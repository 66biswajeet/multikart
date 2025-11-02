import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Role from "@/models/Role";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    await dbConnect();

    const results = {
      roles: [],
      users: [],
      errors: []
    };

    // Default roles
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
          { id: 25, name: "setting.index", guard_name: "web" },
          { id: 26, name: "setting.edit", guard_name: "web" },
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
          { id: 29, name: "dashboard.index", guard_name: "web" }
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
          { id: 29, name: "dashboard.index", guard_name: "web" }
        ]
      }
    ];

    // Create roles
    for (const roleData of defaultRoles) {
      try {
        const existingRole = await Role.findByName(roleData.name);
        
        if (!existingRole) {
          const newRole = new Role(roleData);
          const savedRole = await newRole.save();
          results.roles.push({
            action: 'created',
            role: savedRole.name,
            id: savedRole._id
          });
        } else {
          results.roles.push({
            action: 'already_exists',
            role: existingRole.name,
            id: existingRole._id
          });
        }
      } catch (error) {
        results.errors.push(`Error creating role ${roleData.name}: ${error.message}`);
      }
    }

    // Create admin user
    try {
      const adminExists = await User.findOne({ email: "admin@multikart.com" });
      
      if (!adminExists) {
        const adminRole = await Role.findByName("admin");
        const hashedPassword = await bcrypt.hash("admin123", 10);

        const adminUser = new User({
          name: "System Administrator",
          email: "admin@multikart.com",
          phone: 1234567890,
          country_code: "91",
          password: hashedPassword,
          status: 1,
          isAdmin: true,
          role: adminRole ? adminRole._id : null,
          role_data: adminRole ? {
            id: adminRole._id,
            name: adminRole.name,
            guard_name: adminRole.guard_name,
            system_reserve: adminRole.system_reserve
          } : null,
          email_verified_at: new Date(),
          created_at: new Date()
        });

        const savedUser = await adminUser.save();
        results.users.push({
          action: 'created',
          user: 'admin@multikart.com',
          password: 'admin123',
          id: savedUser._id
        });
      } else {
        results.users.push({
          action: 'already_exists',
          user: 'admin@multikart.com',
          id: adminExists._id
        });
      }
    } catch (error) {
      results.errors.push(`Error creating admin user: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      message: "System initialization completed",
      data: results
    });

  } catch (error) {
    console.error("Error during system initialization:", error);
    return NextResponse.json({
      success: false,
      message: "System initialization failed",
      error: error.message
    }, { status: 500 });
  }
}