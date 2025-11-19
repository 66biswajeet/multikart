import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import crypto from "crypto";
// 1. Import the email service and settings
import { sendPasswordResetEmail } from "@/utils/email/emailService";
import setting from "@/app/api/settings/setting.json";

/**
 * POST /api/auth/forgot-password
 * Generate and send password reset OTP/token
 */
export async function POST(request) {
  try {
    await dbConnect();

    const { email } = await request.json();

    // Validate email
    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "Email is required",
          data: null,
        },
        { status: 400 }
      );
    }

    // 2. Check if password reset emails are enabled
    const emailSettings = setting?.values?.email || {};
    const passwordResetEnabled = emailSettings.password_reset_mail !== false;

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // For security, don't reveal if user exists or not
    // Always return success message even if user doesn't exist
    if (!user) {
      return NextResponse.json({
        success: true,
        message:
          "If an account with that email exists, a password reset OTP has been sent.",
        data: null,
      });
    }

    // Generate 5-digit OTP
    const otp = Math.floor(10000 + Math.random() * 90000).toString();

    console.log("GENERATED OTP (for testing):", otp);

    // Generate reset token (for additional security)
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Set expiry (15 minutes from now)
    const resetExpiry = new Date();
    resetExpiry.setMinutes(resetExpiry.getMinutes() + 15);

    // Update user with reset token and OTP
    user.password_reset_token = resetToken;
    user.password_reset_expiry = resetExpiry;
    user.otp = parseInt(otp);
    user.otp_expiry = resetExpiry;

    await user.save();

    // 3. Send OTP via email if enabled
    if (passwordResetEnabled) {
      try {
        await sendPasswordResetEmail(user.email, otp, user.name);
        console.log(`Password reset OTP sent to ${user.email}`);
      } catch (emailError) {
        console.error("Failed to send password reset email:", emailError);
        console.log("Password Reset OTP for", user.email, ":", otp);
        console.log("(Email failed, using console fallback)");
        // Don't fail the request if email fails, but log it
        // In production, you might want to queue this for retry
      }
    } else {
      // If email is disabled, log OTP for development
      console.log("Password Reset OTP for", user.email, ":", otp);
      console.log("(Email sending is disabled in settings)");
    }

    // 4. Only log Reset Token in development mode
    if (process.env.NODE_ENV === "development") {
      console.log("Reset Token:", resetToken);
    }

    return NextResponse.json({
      success: true,
      message:
        "If an account with that email exists, a password reset OTP has been sent.",
      data: {
        email: email,
        // 5. Update logic: Don't return OTP in production, or if email is enabled (since it was sent)
        otp:
          process.env.NODE_ENV === "development" && !passwordResetEnabled
            ? otp
            : undefined,
      },
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to process password reset request",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
