import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Products";
import Tag from "@/models/Tag";
import Category from "@/models/Category";
import Brand from "@/models/Brand";
import { requireAdmin } from "@/utils/auth/serverAuth";

/**
 * POST /api/product/replicate - Duplicate/replicate a product
 */
export async function POST(request) {
  try {
    await dbConnect();

    // Check admin authentication
    const authCheck = await requireAdmin(request);
    if (!authCheck.success) {
      return authCheck.errorResponse;
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Product ID is required for replication" },
        { status: 400 }
      );
    }

    // Find the original product
    const originalProduct = await Product.findById(id);
    
    if (!originalProduct) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    // Create a copy of the product data
    const productData = originalProduct.toObject();
    
    // Remove fields that should be unique for the new product
    delete productData._id;
    delete productData.id;
    delete productData.created_at;
    delete productData.updated_at;
    delete productData.__v;

    // Generate new unique values
    const timestamp = Date.now();
    productData.name = `${originalProduct.name} (Copy)`;
    productData.slug = `${originalProduct.slug}-copy-${timestamp}`;
    productData.sku = `${originalProduct.sku}-COPY-${timestamp}`;
    
    // Auto-increment ID for compatibility
    const lastProduct = await Product.findOne().sort({ id: -1 }).select('id');
    productData.id = lastProduct ? lastProduct.id + 1 : 1;

    // Set creator
    productData.created_by_id = authCheck.authData.userId || "admin";

    // Create the duplicated product
    const newProduct = new Product(productData);
    await newProduct.save();

    // Populate relations for response
    const populatedProduct = await Product.findById(newProduct._id)
      .populate('categories', 'name slug')
      .populate('tags', 'name slug');

    return NextResponse.json({
      success: true,
      message: "Product replicated successfully",
      data: populatedProduct
    }, { status: 201 });

  } catch (error) {
    console.error("Product replicate error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to replicate product", error: error.message },
      { status: 500 }
    );
  }
}