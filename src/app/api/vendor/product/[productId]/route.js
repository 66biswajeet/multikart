import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Products";
import mongoose from "mongoose";
import { requireAuth } from "@/utils/auth/serverAuth";

// GET /api/vendor/product/[productId]
export async function GET(request, { params }) {
  await dbConnect();
  const authCheck = await requireAuth(request);
  if (!authCheck.success) return authCheck.errorResponse;
  const vendorId = authCheck.authData.userId;
  const { productId } = params;
  const product = await Product.findById(productId).lean();
  console.log("DEBUG product:", product);
  if (!product)
    return NextResponse.json(
      { success: false, message: "Product not found" },
      { status: 404 }
    );
  const myOffer = (product.linked_vendor_offerings || []).find(
    (offer) => offer.vendor_id.toString() === vendorId.toString()
  );
  console.log("DEBUG myOffer:", myOffer);
  return NextResponse.json({ success: true, product, myOffer });
}

// PATCH /api/vendor/product/[productId]
export async function PATCH(request, { params }) {
  await dbConnect();
  const authCheck = await requireAuth(request);
  if (!authCheck.success) return authCheck.errorResponse;
  const vendorId = authCheck.authData.userId;
  const { productId } = params;
  const data = await request.json();
  // Update only the vendor's own offering
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
  const updated = await Product.findOneAndUpdate(
    { _id: productId, "linked_vendor_offerings.vendor_id": vendorId },
    { $set: updateFields },
    { new: true }
  );
  if (!updated)
    return NextResponse.json(
      { success: false, message: "Update failed" },
      { status: 400 }
    );
  return NextResponse.json({ success: true, message: "Product updated" });
}
