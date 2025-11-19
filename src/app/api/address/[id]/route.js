import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Address from "@/models/Address";
import mongoose from "mongoose";
import { requireAuth } from "@/utils/auth/serverAuth";

// PUT - Update address
export async function POST(request, { params }) {
  try {
    await dbConnect();

    const authCheck = await requireAuth(request);
    if (!authCheck.success) {
      return authCheck.errorResponse;
    }

    const userId = authCheck.authData.userId;
    const { id } = params; // This 'id' comes from the folder name

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid address ID",
          data: null,
        },
        { status: 400 }
      );
    }

    const { label, street, city, state, country, zip, phone, is_default } =
      await request.json();

    // Find address and verify ownership
    const address = await Address.findOne({ _id: id, user: userId });
    if (!address) {
      return NextResponse.json(
        {
          success: false,
          message: "Address not found",
          data: null,
        },
        { status: 404 }
      );
    }

    // If setting as default, unset other defaults
    if (is_default) {
      await Address.updateMany(
        { user: userId, _id: { $ne: id } },
        { is_default: false }
      );
    }

    // Update address
    const updateData = {};
    if (label) updateData.label = label;
    if (street) updateData.street = street;
    if (city) updateData.city = city;
    if (state) updateData.state = state;
    if (country) updateData.country = country;
    if (zip) updateData.zip = zip;
    if (phone !== undefined) updateData.phone = phone;
    if (is_default !== undefined) updateData.is_default = is_default;

    const updatedAddress = await Address.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json({
      success: true,
      message: "Address updated successfully",
      data: updatedAddress,
    });
  } catch (error) {
    console.error("Update address error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update address",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete address
export async function DELETE(request, { params }) {
  try {
    await dbConnect();

    const authCheck = await requireAuth(request);
    if (!authCheck.success) {
      return authCheck.errorResponse;
    }

    const userId = authCheck.authData.userId;
    const { id } = params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid address ID",
          data: null,
        },
        { status: 400 }
      );
    }

    // Find address and verify ownership
    const address = await Address.findOne({ _id: id, user: userId });
    if (!address) {
      return NextResponse.json(
        {
          success: false,
          message: "Address not found",
          data: null,
        },
        { status: 404 }
      );
    }

    // Soft delete (set status to 0) or hard delete
    // The plan uses hard delete:
    await Address.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Address deleted successfully",
      data: null,
    });
  } catch (error) {
    console.error("Delete address error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete address",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
