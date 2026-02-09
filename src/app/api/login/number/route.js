import { NextResponse } from "next/server";
import admin from "firebase-admin";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import jwt from "jsonwebtoken";

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    // Check if service account credentials are provided
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : null;

    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("Firebase Admin initialized with service account");
    } else {
      // Fallback: Try to initialize with application default credentials
      admin.initializeApp();
      console.log("Firebase Admin initialized with default credentials");
    }
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
  }
}

/**
 * POST /api/login/number
 * Verify Firebase phone authentication token and create user session
 */
export async function POST(request) {
  try {
    await dbConnect();

    const { firebaseToken, phoneNumber, uid } = await request.json();

    // Validate inputs
    if (!firebaseToken || !phoneNumber || !uid) {
      return NextResponse.json(
        {
          success: false,
          message: "Firebase token, phone number, and UID are required",
          data: null,
        },
        { status: 400 }
      );
    }

    // Verify Firebase ID token
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(firebaseToken);
      console.log("Firebase token verified:", decodedToken);

      // Ensure the token's UID matches
      if (decodedToken.uid !== uid) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid authentication token",
            data: null,
          },
          { status: 401 }
        );
      }

      // Ensure the phone number matches
      if (decodedToken.phone_number !== phoneNumber) {
        return NextResponse.json(
          {
            success: false,
            message: "Phone number mismatch",
            data: null,
          },
          { status: 401 }
        );
      }
    } catch (error) {
      console.error("Firebase token verification error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired Firebase token",
          error: error.message,
        },
        { status: 401 }
      );
    }

    // Find or create user by phone number
    let user = await User.findOne({ phone: phoneNumber.replace(/\D/g, "") });

    if (!user) {
      // Create new user
      user = new User({
        name: decodedToken.name || `User_${phoneNumber.slice(-4)}`,
        email: decodedToken.email || `${uid}@temp.com`, // Temporary email
        phone: phoneNumber.replace(/\D/g, ""),
        country_code: phoneNumber.replace(/\D/g, "").slice(0, -10) || "91",
        password: `firebase_${uid}_${Date.now()}`, // Random password (not used for Firebase auth)
        verified: true, // Phone is verified by Firebase
        role: null, // Default consumer role
        status: 1, // Active
      });

      await user.save();
      console.log("New user created:", user._id);
    } else {
      // Update last login
      user.verified = true;
      await user.save();
      console.log("Existing user logged in:", user._id);
    }

    // Generate JWT access token for our application
    const access_token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "30d" }
    );

    // Return user data and token
    return NextResponse.json({
      success: true,
      message: "Login successful",
      data: {
        access_token,
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        country_code: user.country_code,
        profile_image: user.profile_image,
        role: user.role,
        wallet: user.wallet,
        point: user.point,
      },
    });
  } catch (error) {
    console.error("Login with phone error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to process login",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
