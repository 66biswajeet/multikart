import User from "@/models/User";
import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Role from "@/models/Role";

export async function POST(request) {
  try {
    await dbConnect();
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide all required fields",
          data: null,
        },
        { status: 400 }
      );
    }
    const existingUser = await User.findOne({ email }).populate("role");

    // const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials", data: null },
        { status: 400 }
      );
    }
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials", data: null },
        { status: 400 }
      );
    }

    const userRole = existingUser.role ? existingUser.role.name : null;
    // Generate JWT token
    const token = jwt.sign(
      {
        userId: existingUser._id,
        email: existingUser.email,
        isAdmin: existingUser.isAdmin,
        role: userRole,
      },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "1h" }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Signin successful",
        data: { user: existingUser, token },
      },
      { status: 200 }
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { success: false, message: "Internal Server Error", data: null },
      { status: 500 }
    );
  }
}
