import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Warehouse from "@/models/Warehouse";
import { requireAdmin } from "@/utils/auth/serverAuth";

/**
 * GET /api/warehouse - Fetch fulfillment centers
 */
export async function GET(request) {
  try {
    await dbConnect();

    // Filter to only show Fulfillment Centers (not vendor warehouses)
    const centers = await Warehouse.find({ is_fulfillment_center: true }).sort({
      created_at: -1,
    });

    return NextResponse.json({
      success: true,
      data: centers,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/warehouse - Create a new fulfillment center
 */
export async function POST(request) {
  try {
    await dbConnect();
    const authCheck = await requireAdmin(request);
    if (!authCheck.success) return authCheck.errorResponse;

    const body = await request.json();

    // Ensure it's marked as a fulfillment center
    const newCenter = new Warehouse({
      ...body,
      is_fulfillment_center: true,
      created_by: authCheck.authData.userId,
    });

    await newCenter.save();

    return NextResponse.json(
      {
        success: true,
        message: "Fulfillment Center created successfully",
        data: newCenter,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/warehouse - Bulk Delete
 */
export async function DELETE(request) {
  try {
    await dbConnect();
    const authCheck = await requireAdmin(request);
    if (!authCheck.success) return authCheck.errorResponse;

    const { ids } = await request.json();
    await Warehouse.deleteMany({ _id: { $in: ids } });

    return NextResponse.json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
