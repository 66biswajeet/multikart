import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Products";
import mongoose from "mongoose";
import { requireAuth } from "@/utils/auth/serverAuth";

// GET /api/vendor/product/[productId]
export async function GET(request, { params }) {
  try {
    // Connect to database
    await dbConnect();
    console.log("✓ Database connected");

    // Check authentication
    const authCheck = await requireAuth(request);
    if (!authCheck.success) {
      console.error("❌ Auth check failed:", authCheck.errorResponse);
      return authCheck.errorResponse;
    }
    
    const vendorId = authCheck.authData.userId;
    console.log("✓ Authenticated vendor:", vendorId);

    // Get and validate productId - await params (Next.js 15+ requirement)
    const { productId } = await params;
    console.log("📦 Raw productId from params:", productId);

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      console.error("❌ Invalid ObjectId format:", productId);
      return NextResponse.json(
        { success: false, message: "Invalid product ID format" },
        { status: 400 }
      );
    }

    // Convert to ObjectId if needed
    const objectId = new mongoose.Types.ObjectId(productId);
    console.log("✓ Converted to ObjectId:", objectId);

    // Fetch product
    const product = await Product.findById(objectId).lean();
    console.log("📦 Product found:", product ? "Yes" : "No");

    if (!product) {
      console.error("❌ Product not found for ID:", productId);
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    // Find vendor's offering
    const myOffer = (product.linked_vendor_offerings || []).find(
      (offer) => offer.vendor_id.toString() === vendorId.toString()
    );

    if (!myOffer) {
      console.warn("⚠️ Vendor has no offering for this product");
    }

    console.log("✓ API response prepared successfully");
    return NextResponse.json({ success: true, product, myOffer: myOffer || null });
  } catch (error) {
    console.error("❌ API Error:", error.message, error.stack);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/vendor/product/[productId]
export async function PATCH(request, { params }) {
  try {
    // Connect to database
    await dbConnect();
    console.log("✓ Database connected");

    // Check authentication
    const authCheck = await requireAuth(request);
    if (!authCheck.success) {
      console.error("❌ Auth check failed");
      return authCheck.errorResponse;
    }

    const vendorId = authCheck.authData.userId;
    console.log("✓ Authenticated vendor:", vendorId);

    // Get and validate productId - await params (Next.js 15+ requirement)
    const { productId } = await params;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      console.error("❌ Invalid ObjectId format:", productId);
      return NextResponse.json(
        { success: false, message: "Invalid product ID format" },
        { status: 400 }
      );
    }

    const objectId = new mongoose.Types.ObjectId(productId);
    const data = await request.json();
    console.log("📝 Update data received:", Object.keys(data));

    // Build update fields
    const updateFields = {};
    if (data.vendor_sku !== undefined)
      updateFields["linked_vendor_offerings.$.vendor_sku"] = data.vendor_sku;
    if (data.base_price !== undefined)
      updateFields["linked_vendor_offerings.$.base_price"] = data.base_price;
    if (data.floor_price !== undefined)
      updateFields["linked_vendor_offerings.$.floor_price"] = data.floor_price;
    if (data.price !== undefined)
      updateFields["linked_vendor_offerings.$.price"] = data.price;
    if (data.condition !== undefined)
      updateFields["linked_vendor_offerings.$.condition"] = data.condition;
    if (data.shipping_info !== undefined)
      updateFields["linked_vendor_offerings.$.shipping_info"] =
        data.shipping_info;
    if (data.warehouse_stock !== undefined)
      updateFields["linked_vendor_offerings.$.warehouse_stock"] =
        data.warehouse_stock;

    console.log("📝 Update fields:", Object.keys(updateFields));

    // Update product
    const updated = await Product.findOneAndUpdate(
      { _id: objectId, "linked_vendor_offerings.vendor_id": vendorId },
      { $set: updateFields },
      { new: true }
    );

    if (!updated) {
      console.error("❌ Update failed - product or vendor offering not found");
      return NextResponse.json(
        { success: false, message: "Product or vendor offering not found" },
        { status: 404 }
      );
    }

    console.log("✓ Product updated successfully");
    return NextResponse.json({ success: true, message: "Product updated" });
  } catch (error) {
    console.error("❌ PATCH Error:", error.message, error.stack);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
