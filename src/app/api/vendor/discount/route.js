import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Discount from "@/models/Discount";
import { requireAuth } from "@/utils/auth/serverAuth";

/**
 * GET - Fetch all discount rules for the logged-in vendor
 */
export async function GET(request) {
  try {
    await dbConnect();
    const auth = await requireAuth(request);
    if (!auth.success) return auth.errorResponse;

    const vendorId = auth.authData.userId;
    const discounts = await Discount.find({ vendor: vendorId }).sort({
      createdAt: -1,
    });

    return NextResponse.json({ success: true, data: discounts });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST - Create a new discount rule
 */
export async function POST(request) {
  try {
    await dbConnect();
    const auth = await requireAuth(request);
    if (!auth.success) return auth.errorResponse;

    const vendorId = auth.authData.userId;
    const body = await request.json();

    // Basic Validation per wireframe requirements [cite: 1261, 1268]
    if (!body.rule_name || !body.application_type || !body.value) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const newDiscount = new Discount({
      ...body,
      vendor: vendorId,
    });

    await newDiscount.save();

    return NextResponse.json(
      {
        success: true,
        message: "Discount rule created successfully",
        data: newDiscount,
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
