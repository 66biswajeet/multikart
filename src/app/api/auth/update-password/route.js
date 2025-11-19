import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
// 1. Import the email service and settings
import { sendPasswordResetSuccessEmail } from "@/utils/email/emailService";
import setting from "@/app/api/settings/setting.json";

/**
 * POST /api/auth/update-password
 * Reset password using reset token
 */
export async function POST(request) {
  try {
    await dbConnect();

    const { email, token, password, password_confirmation } =
      await request.json();

    // ... (All validation logic from lines 17-106 remains identical) ...

    // Validate inputs
    if (!email || !token || !password || !password_confirmation) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required",
          data: null,
        },
        { status: 400 }
      );
    }

    // Validate password match
    if (password !== password_confirmation) {
      return NextResponse.json(
        {
          success: false,
          message: "Password and confirmation do not match",
          data: null,
        },
        { status: 400 }
      );
    }

    // Validate password strength (minimum 6 characters)
    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 6 characters long",
          data: null,
        },
        { status: 400 }
      );
    }

    // Verify JWT token
    let decoded;
    try {
      const secret = process.env.JWT_SECRET || "your_jwt_secret";
      decoded = jwt.verify(token, secret);

      // Verify token type
      if (decoded.type !== "password_reset") {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid token type",
            data: null,
          },
          { status: 400 }
        );
      }

      // Verify email matches
      if (decoded.email !== email.toLowerCase().trim()) {
        return NextResponse.json(
          {
            success: false,
            message: "Email does not match token",
            data: null,
          },
          { status: 400 }
        );
      }
    } catch (jwtError) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid or expired reset token. Please request a new password reset.",
          data: null,
        },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findById(decoded.userId);
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

    // Verify reset token matches
    if (user.password_reset_token !== decoded.resetToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid reset token",
          data: null,
        },
        { status: 400 }
      );
    }

    // Check if reset token has expired
    if (
      !user.password_reset_expiry ||
      new Date() > user.password_reset_expiry
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Reset token has expired. Please request a new password reset.",
          data: null,
        },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear reset token
    user.password = hashedPassword;
    user.password_reset_token = null;
    user.password_reset_expiry = null;
    user.otp = null;
    user.otp_expiry = null;

    await user.save();

    // 2. Add the success email logic
    const emailSettings = setting?.values?.email || {};
    const passwordResetEnabled = emailSettings.password_reset_mail !== false;

    if (passwordResetEnabled) {
      try {
        await sendPasswordResetSuccessEmail(user.email, user.name);
        console.log(`Password reset success email sent to ${user.email}`);
      } catch (emailError) {
        console.error(
          "Failed to send password reset success email:",
          emailError
        );
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message:
        "Password has been reset successfully. Please login with your new password.",
      data: null,
    });
  } catch (error) {
    console.error("Update password error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to reset password",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
