import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { requireAuth } from "@/utils/auth/serverAuth";

export async function POST(request) {
  // <-- We keep this as POST
  try {
    await dbConnect();

    const authCheck = await requireAuth(request);
    if (!authCheck.success) {
      return authCheck.errorResponse;
    }

    const userId = authCheck.authData.userId;

    // --- THIS IS THE FIX ---
    // We now read 'profile_image' from the JSON, not 'profile_image_id'
    const { name, phone, country_code, profile_image } = await request.json();
    // -----------------------

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
          data: null,
        },
        { status: 404 }
      );
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = Number(phone);
    if (country_code) updateData.country_code = country_code;

    // --- THIS IS THE FIX ---
    // We now update the 'profile_image' field, which exists in your schema
    if (profile_image !== undefined) {
      updateData.profile_image = profile_image;
    }
    // -----------------------

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update profile",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
