import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Products";
import { requireAdmin } from "@/utils/auth/serverAuth";

/**
 * GET /api/product/export - Export products to CSV
 */
export async function GET(request) {
  try {
    await dbConnect();

    // Check admin authentication
    const authCheck = await requireAdmin(request);
    if (!authCheck.success) {
      return authCheck.errorResponse;
    }

    const searchParams = request?.nextUrl?.searchParams;
    const categoryIds = searchParams.get("category_ids");
    const brandIds = searchParams.get("brand_ids");
    const storeIds = searchParams.get("store_ids");
    const productType = searchParams.get("product_type");

    // Build query for export
    let query = { status: 1 }; // Only active products

    if (categoryIds) {
      query.categories = { $in: categoryIds.split(",") };
    }
    
    if (brandIds) {
      query.brand_id = { $in: brandIds.split(",").map(id => parseInt(id)) };
    }
    
    if (storeIds) {
      query.store_id = { $in: storeIds.split(",").map(id => parseInt(id)) };
    }
    
    if (productType) {
      query.product_type = productType;
    }

    // Fetch products for export
    const products = await Product.find(query)
      .populate('categories', 'name')
      .populate('tags', 'name')
      .select('name sku price sale_price quantity description short_description categories tags brand_id store_id product_type status')
      .lean();

    // Convert to CSV format
    const csvHeaders = [
      'Name', 'SKU', 'Price', 'Sale Price', 'Quantity', 
      'Description', 'Short Description', 'Categories', 'Tags', 
      'Brand ID', 'Store ID', 'Product Type', 'Status'
    ].join(',');

    const csvRows = products.map(product => [
      `"${product.name || ''}"`,
      `"${product.sku || ''}"`,
      product.price || 0,
      product.sale_price || 0,
      product.quantity || 0,
      `"${(product.description || '').replace(/"/g, '""')}"`,
      `"${(product.short_description || '').replace(/"/g, '""')}"`,
      `"${product.categories?.map(cat => cat.name).join(';') || ''}"`,
      `"${product.tags?.map(tag => tag.name).join(';') || ''}"`,
      product.brand_id || '',
      product.store_id || '',
      product.product_type || 'physical',
      product.status || 1
    ].join(','));

    const csvContent = [csvHeaders, ...csvRows].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="products-export-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });

  } catch (error) {
    console.error("Product export error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to export products", error: error.message },
      { status: 500 }
    );
  }
}