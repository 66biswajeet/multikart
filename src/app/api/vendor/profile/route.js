import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Store from "@/models/Store";
import User from "@/models/User"; // Keep this for .populate()
// 1. Import your new requireAuth function
import { requireAuth } from "@/utils/auth/serverAuth"; // Check this path

// GET - Get current vendor's full profile
export async function GET(request) {
  try {
    // 2. Use the new auth check
    const authCheck = await requireAuth(request);
    if (!authCheck.success) {
      return authCheck.errorResponse; // This will be the 401 response
    }

    // 3. Get the userId from the successful check
    const { userId } = authCheck.authData;

    await dbConnect();

    const store = await Store.findOne({ owner_user_id: userId }).populate(
      "owner_user_id",
      "name email"
    );

    if (!store) {
      return NextResponse.json(
        { success: false, message: "Vendor store not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: store });
  } catch (error) {
    console.error("Error fetching vendor profile:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update vendor's profile
export async function PUT(request) {
  try {
    // 2. Use the new auth check here as well
    const authCheck = await requireAuth(request);
    if (!authCheck.success) {
      return authCheck.errorResponse;
    }

    // 3. Get the userId from the successful check
    const { userId } = authCheck.authData;

    await dbConnect();
    const store = await Store.findOne({ owner_user_id: userId });

    if (!store) {
      return NextResponse.json(
        { success: false, message: "Vendor store not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    // ... (rest of your update logic) ...
    if (body.business) {
      store.business = body.business;
      store.store_name = body.store_name;
    }
    if (body.contacts) {
      store.contacts = body.contacts;
    }
    if (body.warehouses || body.channels) {
      store.warehouses = body.warewarehouses;
      store.channels = body.channels;
    }

    await store.save();

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: store,
    });
  } catch (error) {
    console.error("Error updating vendor profile:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
