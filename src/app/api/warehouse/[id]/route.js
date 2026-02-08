import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Warehouse from "@/models/Warehouse";
import { requireAdmin } from "@/utils/auth/serverAuth";

// GET - Admin: Fetch a single fulfillment center
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const authCheck = await requireAdmin(request);
    if (!authCheck.success) return authCheck.errorResponse;

    // --- FIX FOR NEXT.JS 15 ---
    const { id } = await params;

    const center = await Warehouse.findById(id);
    if (!center) {
      return NextResponse.json(
        { success: false, message: "Not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: center });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// PUT - Admin: Update a single fulfillment center
export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const authCheck = await requireAdmin(request);
    if (!authCheck.success) return authCheck.errorResponse;

    // --- FIX FOR NEXT.JS 15 ---
    const { id } = await params;

    const body = await request.json();
    const updated = await Warehouse.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Fulfillment center not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Admin: Remove a single fulfillment center
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const authCheck = await requireAdmin(request);
    if (!authCheck.success) return authCheck.errorResponse;

    // --- FIX FOR NEXT.JS 15 ---
    const { id } = await params;

    const deletedCenter = await Warehouse.findByIdAndDelete(id);

    if (!deletedCenter) {
      return NextResponse.json(
        { success: false, message: "Fulfillment center not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Fulfillment center removed successfully",
    });
  } catch (error) {
    console.error("Error deleting fulfillment center:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
