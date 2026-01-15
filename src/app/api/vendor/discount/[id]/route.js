import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Discount from "@/models/Discount";
import { requireAuth } from "@/utils/auth/serverAuth";

/**
 * GET - Fetch a specific discount by ID
 */
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const auth = await requireAuth(request);
    if (!auth.success) return auth.errorResponse;

    const { id } = await params;
    const vendorId = auth.authData.userId;

    const discount = await Discount.findOne({ _id: id, vendor: vendorId });

    if (!discount) {
      return NextResponse.json(
        { success: false, message: "Discount not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: discount,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update a specific discount (e.g., Toggle status or Edit details)
 */
export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const auth = await requireAuth(request);
    if (!auth.success) return auth.errorResponse;

    const { id } = await params;
    const body = await request.json();
    const vendorId = auth.authData.userId;

    // Ensure vendor owns this discount before updating
    const updatedDiscount = await Discount.findOneAndUpdate(
      { _id: id, vendor: vendorId },
      { $set: body },
      { new: true }
    );

    if (!updatedDiscount) {
      return NextResponse.json(
        { success: false, message: "Discount not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Updated successfully",
      data: updatedDiscount,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Remove a discount rule
 */
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const auth = await requireAuth(request);
    if (!auth.success) return auth.errorResponse;

    const { id } = await params;
    const vendorId = auth.authData.userId;

    const result = await Discount.deleteOne({ _id: id, vendor: vendorId });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Discount not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Discount deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
