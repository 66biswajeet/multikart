import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Products";
import { requireAuth } from "@/utils/auth/serverAuth";

/**
 * PUT /api/vendor/product/bulk-status
 * Bulk update status of vendor products
 */
export async function PUT(request) {
  try {
    await dbConnect();

    const authCheck = await requireAuth(request);
    if (!authCheck.success) {
      return authCheck.errorResponse;
    }

    const vendorId = authCheck.authData.userId;
    const { ids, status } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, message: "Product IDs are required" },
        { status: 400 }
      );
    }

    // Update the is_active status for the vendor's offerings
    // Since linked_vendor_offerings is an array, we need to update each product individually
    let updatedCount = 0;
    for (const productId of ids) {
      const result = await Product.updateOne(
        {
          _id: productId,
          "linked_vendor_offerings.vendor_id": vendorId,
        },
        {
          $set: { "linked_vendor_offerings.$.is_active": status === 1 },
        }
      );
      if (result.modifiedCount > 0) {
        updatedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `${updatedCount} products status updated successfully`,
    });
  } catch (error) {
    console.error("❌ Vendor Product Bulk Status Update Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
