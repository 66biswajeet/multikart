import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Role from "@/models/Role";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { requireAdmin } from "@/utils/auth/serverAuth";

// GET - Fetch single user by ID
export async function GET(request, { params }) {
  try {
    await dbConnect();

    const { id } = await params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({
        success: false,
        message: "Invalid user ID",
        data: null
      }, { status: 400 });
    }

    const user = await User.findById(id).populate('role').select('-password');

    if (!user) {
      return NextResponse.json({
        success: false,
        message: "User not found",
        data: null
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "User fetched successfully",
      data: user
    });

  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({
      success: false,
      message: "Internal Server Error",
      data: null
    }, { status: 500 });
  }
}

// PUT - Update user by ID
export async function PUT(request, { params }) {
  try {
    await dbConnect();

    // Check admin authentication
    const authCheck = await requireAdmin(request);
    if (!authCheck.success) {
      return authCheck.errorResponse;
    }

    const { id } = await params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({
        success: false,
        message: "Invalid user ID",
        data: null
      }, { status: 400 });
    }

    const reqData = await request.json();
    const { name, email, phone, password, role, status, country_code, address, city, state, country, zip } = reqData;

    // Find the user
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({
        success: false,
        message: "User not found",
        data: null
      }, { status: 404 });
    }

    // Check if email is being changed and if new email already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: id } });
      if (existingUser) {
        return NextResponse.json({
          success: false,
          message: "User with this email already exists",
          data: null
        }, { status: 400 });
      }
    }

    let finalAddress = "";
    if(address && typeof address !== 'string'){
      address.map((addr)=>{
        finalAddress += addr;
      })
    }

    // Prepare update data
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = Number(phone);
    if (country_code) updateData.country_code = country_code;
    if (status !== undefined) updateData.status = Number(status);
    if (finalAddress) updateData.address = finalAddress;
    if (city) updateData.city = city;
    if (state) updateData.state = state;
    if (country) updateData.country = country;
    if (zip) updateData.zip = zip;

    // Update password if provided
    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 10);
    }
    if(role){
      updateData.role = role;
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('role').select('-password');

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      data: updatedUser
    });

  } catch (error) {
    console.log("Error updating user:", error);
    return NextResponse.json({
      success: false,
      message: "Internal Server Error",
      data: null
    }, { status: 500 });
  }
}

// DELETE - Delete single user by ID
export async function DELETE(request, { params }) {
  try {
    await dbConnect();

    // Check admin authentication
    const authCheck = await requireAdmin(request);
    if (!authCheck.success) {
      return authCheck.errorResponse;
    }

    const { id } = await params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({
        success: false,
        message: "Invalid user ID",
        data: null
      }, { status: 400 });
    }

    // Find the user
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({
        success: false,
        message: "User not found",
        data: null
      }, { status: 404 });
    }

    // Prevent deleting admin users (safety check)
    if (user.isAdmin) {
      return NextResponse.json({
        success: false,
        message: "Cannot delete admin users",
        data: null
      }, { status: 400 });
    }

    // Delete the user
    await User.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
      data: null
    });

  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({
      success: false,
      message: "Internal Server Error",
      data: null
    }, { status: 500 });
  }
}