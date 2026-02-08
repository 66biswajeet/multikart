import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Products";
import mongoose from "mongoose";
import { requireAuth } from "@/utils/auth/serverAuth";
import { uploadToCloudinary } from "@/utils/cloudinary/cloudinaryService";

// GET /api/vendor/product/[productId]
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { productId } = await params;

    const authCheck = await requireAuth(request);
    if (!authCheck.success) return authCheck.errorResponse;
    const vendorId = authCheck.authData.userId;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json(
        { success: false, message: "Invalid ID" },
        { status: 400 },
      );
    }

    const product = await Product.findById(productId).lean();
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 },
      );
    }

    // Find ALL offerings for this vendor (for multi-variant support)
    const myOffers = (product.linked_vendor_offerings || []).filter(
      (offer) => offer.vendor_id.toString() === vendorId.toString(),
    );

    return NextResponse.json({
      success: true,
      product,
      myOffers, // Returns array of variants
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// PUT /api/vendor/product/[productId]
// Handles Updates + Image Uploads + Packing Data
export async function PUT(request, { params }) {
  console.log("=== VENDOR PRODUCT UPDATE ===");
  try {
    await dbConnect();
    const { productId } = await params;

    const authCheck = await requireAuth(request);
    if (!authCheck.success) return authCheck.errorResponse;
    const vendorId = authCheck.authData.userId;

    // 1. Parse FormData
    const formData = await request.formData();
    const productDataString = formData.get("data");

    if (!productDataString) {
      return NextResponse.json(
        { success: false, message: "No data provided" },
        { status: 400 },
      );
    }

    const data = JSON.parse(productDataString);

    const masterProduct = await Product.findById(productId);
    if (!masterProduct) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 },
      );
    }

    // 2. Remove Old Offerings for this Vendor (to replace with new data)
    masterProduct.linked_vendor_offerings =
      masterProduct.linked_vendor_offerings.filter(
        (off) => off.vendor_id.toString() !== vendorId.toString(),
      );

    // 3. Process New Offerings
    const offeringsList = data.offerings || [data];

    for (let i = 0; i < offeringsList.length; i++) {
      const offer = offeringsList[i];

      // A. Process Inventory
      let warehouse_stock = [];
      let total_stock = 0;
      if (Array.isArray(offer.inventory_data)) {
        warehouse_stock = offer.inventory_data.map((inv) => ({
          warehouse_id: inv.warehouse_id,
          stock: Number(inv.stock_quantity) || 0,
          low_stock_threshold: Number(inv.low_stock_threshold) || 0,
        }));
        total_stock = warehouse_stock.reduce((a, b) => a + b.stock, 0);
      } else {
        total_stock = Number(offer.stock_quantity) || 0;
      }

      // B. Process Images (The Critical Part)
      const media = [];

      // 1. Keep existing images (that are not blobs)
      if (offer.media && Array.isArray(offer.media)) {
        offer.media.forEach((m) => {
          if (m.url && !m.url.startsWith("blob:")) {
            media.push(m);
          }
        });
      }

      // 2. Upload NEW images from FormData
      if (offer.media && Array.isArray(offer.media)) {
        for (let j = 0; j < offer.media.length; j++) {
          const fileKey = `files_variant_${i}_${j}`;
          const file = formData.get(fileKey);

          if (file && file.size > 0) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Upload to Cloudinary
            const uploadResult = await uploadToCloudinary(
              [{ buffer, originalname: file.name }],
              "products/variants",
            );

            // Add new image to media array
            media.push({
              url: uploadResult[0].secure_url,
              is_primary: offer.media[j].is_main, // Map 'is_main' from frontend to 'is_primary'
              type: "image",
            });
          }
        }
      }

      // C. Create Offering Subdocument (With ALL fields)
      masterProduct.linked_vendor_offerings.push({
        vendor_product_id: new mongoose.Types.ObjectId(),
        vendor_id: vendorId,
        vendor_sku: offer.vendor_sku,
        base_price: Number(offer.base_price),
        floor_price: Number(offer.floor_price),
        price: Number(offer.base_price),
        stock_quantity: total_stock,
        warehouse_stock: warehouse_stock,
        condition: offer.condition || "new",
        shipping_info: offer.shipping_info,
        is_active: true,
        selected_variants: offer.selected_variants || {},

        // --- IMPORTANT: Save Media ---
        media: media,

        // --- IMPORTANT: Save Packing Data ---
        shipping_weight: Number(offer.shipping_weight) || 0,
        dimensions: {
          length: Number(offer.dimensions?.length) || 0,
          width: Number(offer.dimensions?.width) || 0,
          height: Number(offer.dimensions?.height) || 0,
        },
      });
    }

    await masterProduct.save();

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
    });
  } catch (error) {
    console.error("Update Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// Alias PATCH to PUT
export async function PATCH(request, { params }) {
  return PUT(request, { params });
}

// DELETE /api/vendor/product/[productId]
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { productId } = await params;

    const authCheck = await requireAuth(request);
    if (!authCheck.success) return authCheck.errorResponse;
    const vendorId = authCheck.authData.userId;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json(
        { success: false, message: "Invalid ID" },
        { status: 400 },
      );
    }

    const updated = await Product.findByIdAndUpdate(
      productId,
      {
        $pull: {
          linked_vendor_offerings: { vendor_id: vendorId },
        },
      },
      { new: true },
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Offering deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
