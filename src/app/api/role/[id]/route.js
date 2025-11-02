import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Role from "@/models/Role";
import mongoose from "mongoose";
import { requireAdmin } from "@/utils/auth/serverAuth";

// Default permissions mapping (same as in permissions API and role/route.js)
const permissionsMap = {
  1: { id: 1, name: "user.index", display_name: "View Users", guard_name: "web", category: "User Management" },
  2: { id: 2, name: "user.create", display_name: "Create Users", guard_name: "web", category: "User Management" },
  3: { id: 3, name: "user.edit", display_name: "Edit Users", guard_name: "web", category: "User Management" },
  4: { id: 4, name: "user.destroy", display_name: "Delete Users", guard_name: "web", category: "User Management" },
  5: { id: 5, name: "role.index", display_name: "View Roles", guard_name: "web", category: "Role Management" },
  6: { id: 6, name: "role.create", display_name: "Create Roles", guard_name: "web", category: "Role Management" },
  7: { id: 7, name: "role.edit", display_name: "Edit Roles", guard_name: "web", category: "Role Management" },
  8: { id: 8, name: "role.destroy", display_name: "Delete Roles", guard_name: "web", category: "Role Management" },
  9: { id: 9, name: "product.index", display_name: "View Products", guard_name: "web", category: "Product Management" },
  10: { id: 10, name: "product.create", display_name: "Create Products", guard_name: "web", category: "Product Management" },
  11: { id: 11, name: "product.edit", display_name: "Edit Products", guard_name: "web", category: "Product Management" },
  12: { id: 12, name: "product.destroy", display_name: "Delete Products", guard_name: "web", category: "Product Management" },
  13: { id: 13, name: "order.index", display_name: "View Orders", guard_name: "web", category: "Order Management" },
  14: { id: 14, name: "order.create", display_name: "Create Orders", guard_name: "web", category: "Order Management" },
  15: { id: 15, name: "order.edit", display_name: "Edit Orders", guard_name: "web", category: "Order Management" },
  16: { id: 16, name: "order.destroy", display_name: "Delete Orders", guard_name: "web", category: "Order Management" },
  17: { id: 17, name: "category.index", display_name: "View Categories", guard_name: "web", category: "Category Management" },
  18: { id: 18, name: "category.create", display_name: "Create Categories", guard_name: "web", category: "Category Management" },
  19: { id: 19, name: "category.edit", display_name: "Edit Categories", guard_name: "web", category: "Category Management" },
  20: { id: 20, name: "category.destroy", display_name: "Delete Categories", guard_name: "web", category: "Category Management" },
  25: { id: 25, name: "setting.index", display_name: "View Settings", guard_name: "web", category: "Settings" },
  26: { id: 26, name: "setting.edit", display_name: "Edit Settings", guard_name: "web", category: "Settings" },
  27: { id: 27, name: "report.index", display_name: "View Reports", guard_name: "web", category: "Reports" },
  28: { id: 28, name: "report.export", display_name: "Export Reports", guard_name: "web", category: "Reports" },
  29: { id: 29, name: "dashboard.index", display_name: "View Dashboard", guard_name: "web", category: "Dashboard" },
  30: { id: 30, name: "store.index", display_name: "View Store", guard_name: "web", category: "Store Management" },
  31: { id: 31, name: "store.edit", display_name: "Edit Store", guard_name: "web", category: "Store Management" },
  32: { id: 32, name: "wallet.index", display_name: "View Wallet", guard_name: "web", category: "Wallet Management" },
  33: { id: 33, name: "wallet.create", display_name: "Add Wallet Balance", guard_name: "web", category: "Wallet Management" },
  34: { id: 34, name: "point.index", display_name: "View Points", guard_name: "web", category: "Point Management" },
  35: { id: 35, name: "point.create", display_name: "Add Points", guard_name: "web", category: "Point Management" },
  36: { id: 36, name: "coupon.index", display_name: "View Coupons", guard_name: "web", category: "Coupon Management" },
  37: { id: 37, name: "coupon.create", display_name: "Create Coupons", guard_name: "web", category: "Coupon Management" },
  38: { id: 38, name: "coupon.edit", display_name: "Edit Coupons", guard_name: "web", category: "Coupon Management" },
  39: { id: 39, name: "coupon.destroy", display_name: "Delete Coupons", guard_name: "web", category: "Coupon Management" },
  40: { id: 40, name: "review.index", display_name: "View Reviews", guard_name: "web", category: "Review Management" },
  41: { id: 41, name: "review.edit", display_name: "Moderate Reviews", guard_name: "web", category: "Review Management" },
  42: { id: 42, name: "review.destroy", display_name: "Delete Reviews", guard_name: "web", category: "Review Management" },
  91: { id: 91, name: "brand.index", display_name: "View Brands", guard_name: "web", category: "Brand Management" },
  92: { id: 92, name: "brand.create", display_name: "Create Brands", guard_name: "web", category: "Brand Management" },
  93: { id: 93, name: "brand.edit", display_name: "Edit Brands", guard_name: "web", category: "Brand Management" },
  94: { id: 94, name: "brand.destroy", display_name: "Delete Brands", guard_name: "web", category: "Brand Management" }
};

/**
 * Convert permission IDs to permission objects
 * @param {Array} permissionIds - Array of permission IDs
 * @returns {Array} - Array of permission objects
 */
function convertPermissionIdsToObjects(permissionIds) {
  if (!Array.isArray(permissionIds)) {
    return [];
  }

  return permissionIds
    .map(id => {
      const numId = Number(id);
      const permission = permissionsMap[numId];
      if (permission) {
        return {
          id: permission.id,
          name: permission.name,
          guard_name: permission.guard_name,
          created_at: new Date(),
          updated_at: new Date()
        };
      }
      return null;
    })
    .filter(Boolean); // Remove null values
}

// GET - Fetch single role by ID
export async function GET(request, { params }) {
  try {
    await dbConnect();

    const { id } = await params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({
        success: false,
        message: "Invalid role ID",
        data: null
      }, { status: 400 });
    }

    const role = await Role.findById(id);

    if (!role) {
      return NextResponse.json({
        success: false,
        message: "Role not found",
        data: null
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Role fetched successfully",
      data: role
    });

  } catch (error) {
    console.error("Error fetching role:", error);
    return NextResponse.json({
      success: false,
      message: "Internal Server Error",
      data: null
    }, { status: 500 });
  }
}

// PUT - Update role by ID
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
        message: "Invalid role ID",
        data: null
      }, { status: 400 });
    }

    const reqData = await request.json();
    const { name, display_name, description, permissions, status } = reqData;

    // Find the role
    const role = await Role.findById(id);

    if (!role) {
      return NextResponse.json({
        success: false,
        message: "Role not found",
        data: null
      }, { status: 404 });
    }

    // Check if it's a system reserved role
    if (role.system_reserve === "1") {
      return NextResponse.json({
        success: false,
        message: "Cannot update system reserved roles",
        data: null
      }, { status: 400 });
    }

    // Check if name is being changed and if new name already exists
    if (name && name.toLowerCase() !== role.name) {
      const existingRole = await Role.findByName(name);
      if (existingRole) {
        return NextResponse.json({
          success: false,
          message: "Role with this name already exists",
          data: null
        }, { status: 400 });
      }
    }

    // Update role
    const updateData = {};
    if (name) updateData.name = name.toLowerCase();
    if (display_name) updateData.display_name = display_name;
    if (description !== undefined) updateData.description = description;
    
    // Convert permission IDs to permission objects
    if (permissions) {
      updateData.permissions = convertPermissionIdsToObjects(permissions);
    }
    
    if (status !== undefined) updateData.status = status;

    const updatedRole = await Role.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      message: "Role updated successfully",
      data: updatedRole
    });

  } catch (error) {
    console.log("Error updating role:", error);
    return NextResponse.json({
      success: false,
      message: "Internal Server Error",
      data: null
    }, { status: 500 });
  }
}

// DELETE - Delete single role by ID
export async function DELETE(request, { params }) {
  try {
    await dbConnect();

    // Check admin authentication
    const authCheck = await requireAdmin(request);
    if (!authCheck.success) {
      return authCheck.errorResponse;
    }

    const { id } = params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({
        success: false,
        message: "Invalid role ID",
        data: null
      }, { status: 400 });
    }

    // Find the role
    const role = await Role.findById(id);

    if (!role) {
      return NextResponse.json({
        success: false,
        message: "Role not found",
        data: null
      }, { status: 404 });
    }

    // Check if it's a system reserved role
    if (role.system_reserve === "1") {
      return NextResponse.json({
        success: false,
        message: "Cannot delete system reserved roles",
        data: null
      }, { status: 400 });
    }

    // Delete the role
    await Role.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Role deleted successfully",
      data: null
    });

  } catch (error) {
    console.error("Error deleting role:", error);
    return NextResponse.json({
      success: false,
      message: "Internal Server Error",
      data: null
    }, { status: 500 });
  }
}