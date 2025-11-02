import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Products";
import Tag from "@/models/Tag";
import Category from "@/models/Category";
import Brand from "@/models/Brand";
import { requireAdmin } from "@/utils/auth/serverAuth";

/**
 * POST /api/product/import - Import products from CSV
 */
export async function POST(request) {
  try {
    await dbConnect();

    // Check admin authentication
    const authCheck = await requireAdmin(request);
    if (!authCheck.success) {
      return authCheck.errorResponse;
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 }
      );
    }

    // Read file content
    const fileContent = await file.text();
    const lines = fileContent.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return NextResponse.json(
        { success: false, message: "CSV file must contain headers and at least one data row" },
        { status: 400 }
      );
    }

    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    const dataLines = lines.slice(1);

    const importResults = {
      total: dataLines.length,
      success: 0,
      failed: 0,
      errors: []
    };

    // Get the last product ID for auto-increment
    let lastProduct = await Product.findOne().sort({ id: -1 }).select('id');
    let nextId = lastProduct ? lastProduct.id + 1 : 1;

    for (let i = 0; i < dataLines.length; i++) {
      try {
        const line = dataLines[i];
        const values = [];
        let current = '';
        let inQuotes = false;
        
        // Parse CSV line (handle quoted values)
        for (let j = 0; j < line.length; j++) {
          const char = line[j];
          if (char === '"' && (j === 0 || line[j-1] === ',')) {
            inQuotes = true;
          } else if (char === '"' && inQuotes && (j === line.length - 1 || line[j+1] === ',')) {
            inQuotes = false;
          } else if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        values.push(current.trim()); // Add last value

        // Map CSV values to product object
        const productData = {};
        
        headers.forEach((header, index) => {
          const value = values[index]?.replace(/"/g, '') || '';
          
          switch (header.toLowerCase()) {
            case 'name':
              productData.name = value;
              break;
            case 'sku':
              productData.sku = value || `SKU-${nextId}-${Date.now()}`;
              break;
            case 'price':
              productData.price = parseFloat(value) || 0;
              break;
            case 'sale price':
            case 'sale_price':
              productData.sale_price = parseFloat(value) || null;
              break;
            case 'quantity':
              productData.quantity = parseInt(value) || 0;
              break;
            case 'description':
              productData.description = value;
              break;
            case 'short description':
            case 'short_description':
              productData.short_description = value;
              break;
            case 'brand id':
            case 'brand_id':
              productData.brand_id = parseInt(value) || null;
              break;
            case 'store id':
            case 'store_id':
              productData.store_id = parseInt(value) || 1;
              break;
            case 'product type':
            case 'product_type':
              productData.product_type = value || 'physical';
              break;
            case 'status':
              productData.status = parseInt(value) || 1;
              break;
          }
        });

        // Set required fields
        productData.id = nextId++;
        productData.created_by_id = authCheck.authData.userId || "admin";
        
        // Generate slug from name
        if (productData.name) {
          productData.slug = productData.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') + `-${Date.now()}`;
        }

        // Validate required fields
        if (!productData.name || !productData.sku) {
          throw new Error(`Row ${i + 1}: Name and SKU are required`);
        }

        // Create product
        const newProduct = new Product(productData);
        await newProduct.save();
        
        importResults.success++;

      } catch (error) {
        importResults.failed++;
        importResults.errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Import completed. ${importResults.success} products imported successfully, ${importResults.failed} failed.`,
      data: importResults
    });

  } catch (error) {
    console.error("Product import error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to import products", error: error.message },
      { status: 500 }
    );
  }
}