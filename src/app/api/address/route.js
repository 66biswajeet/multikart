import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Address from "@/models/Address";
import { requireAuth } from "@/utils/auth/serverAuth";

// GET - Get all addresses for logged-in user
export async function GET(request) {
  try {
    await dbConnect();

    const authCheck = await requireAuth(request);
    if (!authCheck.success) {
      return authCheck.errorResponse;
    }

    const userId = authCheck.authData.userId;

    const addresses = await Address.find({ user: userId, status: 1 }).sort({
      is_default: -1,
      createdAt: -1,
    });

    return NextResponse.json({
      success: true,
      message: "Addresses fetched successfully",
      data: addresses,
    });
  } catch (error) {
    console.error("Get addresses error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch addresses",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// POST - Create new address
export async function POST(request) {
  try {
    await dbConnect();

    const authCheck = await requireAuth(request);
    if (!authCheck.success) {
      return authCheck.errorResponse;
    }

    const userId = authCheck.authData.userId;
    const { label, street, city, state, country, zip, phone, is_default } =
      await request.json();

    // Validate required fields
    if (!label || !street || !city || !state || !country || !zip) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide all required fields",
          data: null,
        },
        { status: 400 }
      );
    }

    // If this is set as default, unset other defaults
    if (is_default) {
      await Address.updateMany({ user: userId }, { is_default: false });
    }

    const newAddress = new Address({
      user: userId,
      label,
      street,
      city,
      state,
      country,
      zip,
      phone: phone || null,
      is_default: is_default || false,
    });

    await newAddress.save();

    return NextResponse.json(
      {
        success: true,
        message: "Address created successfully",
        data: newAddress,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create address error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create address",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
