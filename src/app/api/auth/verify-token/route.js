import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import jwt from "jsonwebtoken";

/**
 * POST /api/auth/verify-token
 * Verify OTP token for password reset
 */
export async function POST(request) {
  try {
    await dbConnect();

    const { email, token } = await request.json(); // 'token' here is the 5-digit OTP

    // Validate inputs
    if (!email || !token) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and OTP token are required",
          data: null,
        },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or token",
          data: null,
        },
        { status: 400 }
      );
    }

    // Check if OTP matches
    if (user.otp !== parseInt(token)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid OTP token",
          data: null,
        },
        { status: 400 }
      );
    }

    // Check if OTP has expired
    if (!user.otp_expiry || new Date() > user.otp_expiry) {
      return NextResponse.json(
        {
          success: false,
          message: "OTP token has expired. Please request a new one.",
          data: null,
        },
        { status: 400 }
      );
    }

    // Check if password reset token exists and is valid
    if (!user.password_reset_token || !user.password_reset_expiry) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password reset token not found. Please request a new password reset.",
          data: null,
        },
        { status: 400 }
      );
    }

    if (new Date() > user.password_reset_expiry) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password reset token has expired. Please request a new one.",
          data: null,
        },
        { status: 400 }
      );
    }

    // Generate a temporary JWT token for password reset (valid for 15 minutes)
    const resetJwtToken = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        resetToken: user.password_reset_token, // The secure crypto token
        type: "password_reset",
      },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "15m" }
    );

    // Clear OTP after successful verification
    user.otp = null;
    user.otp_expiry = null;
    await user.save();

    return NextResponse.json({
      success: true,
      message: "OTP verified successfully. You can now reset your password.",
      data: {
        token: resetJwtToken, // This is the new JWT token
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Verify token error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to verify token",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
