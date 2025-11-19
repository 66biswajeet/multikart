import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Store from "@/models/Store";
import { requireAuth } from "@/utils/auth/serverAuth";

// GET - Get all payout accounts for the vendor
export async function GET(request) {
  try {
    const authCheck = await requireAuth(request);
    if (!authCheck.success) return authCheck.errorResponse;

    await dbConnect();
    const { userId } = authCheck.authData;

    const store = await Store.findOne({ owner_user_id: userId }, "payout");
    if (!store) {
      return NextResponse.json(
        { success: false, message: "Vendor store not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: store.payout });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST - Add a new payout account
export async function POST(request) {
  try {
    const authCheck = await requireAuth(request);
    if (!authCheck.success) return authCheck.errorResponse;

    await dbConnect();
    const { userId } = authCheck.authData;
    const body = await request.json();

    // In a real multi-account system, you'd push to an array.
    // For now, we'll just update the single 'payout' object as per the current model.
    const store = await Store.findOneAndUpdate(
      { owner_user_id: userId },
      { $set: { payout: body.payout } }, // This sets the payout object
      { new: true }
    );

    if (!store) {
      return NextResponse.json(
        { success: false, message: "Vendor store not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payout account added",
      data: store.payout,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
