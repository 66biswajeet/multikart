import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Role from "@/models/Role";

// Default roles for seeding
const defaultRoles = [
  {
    name: "admin",
    display_name: "Administrator", 
    description: "Full system access with all permissions",
    guard_name: "web",
    system_reserve: "1",
    status: 1,
    permissions: [
      { id: 1, name: "user.index", guard_name: "web" },
      { id: 2, name: "user.create", guard_name: "web" },
      { id: 3, name: "user.edit", guard_name: "web" },
      { id: 4, name: "user.destroy", guard_name: "web" },
      { id: 5, name: "role.index", guard_name: "web" },
      { id: 6, name: "role.create", guard_name: "web" },
      { id: 7, name: "role.edit", guard_name: "web" },
      { id: 8, name: "role.destroy", guard_name: "web" },
      { id: 9, name: "product.index", guard_name: "web" },
      { id: 10, name: "product.create", guard_name: "web" },
      { id: 11, name: "product.edit", guard_name: "web" },
      { id: 12, name: "product.destroy", guard_name: "web" },
      { id: 13, name: "order.index", guard_name: "web" },
      { id: 14, name: "order.create", guard_name: "web" },
      { id: 15, name: "order.edit", guard_name: "web" },
      { id: 16, name: "order.destroy", guard_name: "web" },
      { id: 25, name: "setting.index", guard_name: "web" },
      { id: 26, name: "setting.edit", guard_name: "web" },
      { id: 27, name: "report.index", guard_name: "web" },
      { id: 28, name: "report.export", guard_name: "web" },
      { id: 29, name: "dashboard.index", guard_name: "web" }
    ]
  },
  {
    name: "vendor",
    display_name: "Vendor",
    description: "Store owner with product and order management access",
    guard_name: "web", 
    system_reserve: "1",
    status: 1,
    permissions: [
      { id: 9, name: "product.index", guard_name: "web" },
      { id: 10, name: "product.create", guard_name: "web" },
      { id: 11, name: "product.edit", guard_name: "web" },
      { id: 12, name: "product.destroy", guard_name: "web" },
      { id: 13, name: "order.index", guard_name: "web" },
      { id: 15, name: "order.edit", guard_name: "web" },
      { id: 29, name: "dashboard.index", guard_name: "web" },
      { id: 30, name: "store.index", guard_name: "web" },
      { id: 31, name: "store.edit", guard_name: "web" },
      { id: 32, name: "wallet.index", guard_name: "web" },
      { id: 40, name: "review.index", guard_name: "web" },
      { id: 41, name: "review.edit", guard_name: "web" }
    ]
  },
  {
    name: "consumer", 
    display_name: "Consumer",
    description: "Regular customer with basic shopping access",
    guard_name: "web",
    system_reserve: "1", 
    status: 1,
    permissions: [
      { id: 13, name: "order.index", guard_name: "web" },
      { id: 14, name: "order.create", guard_name: "web" },
      { id: 29, name: "dashboard.index", guard_name: "web" },
      { id: 32, name: "wallet.index", guard_name: "web" },
      { id: 34, name: "point.index", guard_name: "web" },
      { id: 40, name: "review.index", guard_name: "web" }
    ]
  }
];

export async function POST(request) {
  try {
    await dbConnect();

    // Get user info from middleware headers
    const isAdmin = request.headers.get('x-is-admin') === 'true';

    // Check if user is admin
    if (!isAdmin) {
      return NextResponse.json({
        success: false,
        message: "Access denied. Only administrators can seed roles.",
        data: null
      }, { status: 403 });
    }

    const results = [];

    for (const roleData of defaultRoles) {
      // Check if role already exists
      const existingRole = await Role.findByName(roleData.name);
      
      if (!existingRole) {
        const newRole = new Role(roleData);
        const savedRole = await newRole.save();
        results.push({
          action: 'created',
          role: savedRole.name,
          id: savedRole._id
        });
      } else {
        results.push({
          action: 'already_exists', 
          role: existingRole.name,
          id: existingRole._id
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Roles seeding completed",
      data: results
    });

  } catch (error) {
    console.error("Error seeding roles:", error);
    return NextResponse.json({
      success: false,
      message: "Internal Server Error",
      data: null
    }, { status: 500 });
  }
}