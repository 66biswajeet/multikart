import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { requireAuth } from "@/utils/auth/serverAuth";

export async function POST(request) {
  try {
    await dbConnect();

    // Get authenticated user
    const authCheck = await requireAuth(request);
    if (!authCheck.success) {
      return authCheck.errorResponse;
    }

    const userId = authCheck.authData.userId;
    const { current_password, password, password_confirmation } =
      await request.json();

    // Validate inputs
    if (!current_password || !password || !password_confirmation) {
      return NextResponse.json(
        {
          success: false,
          message: "All password fields are required",
          data: null,
        },
        { status: 400 }
      );
    }

    if (password !== password_confirmation) {
      return NextResponse.json(
        {
          success: false,
          message: "New password and confirmation do not match",
          data: null,
        },
        { status: 400 }
      );
    }

    // Find user (we need the full user document to check the password)
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

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      current_password,
      user.password
    );
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Current password is incorrect",
          data: null,
        },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password
    await User.findByIdAndUpdate(userId, { password: hashedPassword });

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
      data: null,
    });
  } catch (error) {
    console.error("Update password error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update password",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
