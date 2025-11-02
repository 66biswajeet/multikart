import { NextResponse } from "next/server";
import { seedSuperAdmin, SUPER_ADMIN_CONFIG } from "@/seeders/superAdminSeeder";
import User from "@/models/User";
import Role from "@/models/Role";
import dbConnect from "@/lib/dbConnect";

/**
 * POST /api/setup-admin
 * Initialize super admin user and role in the database
 */
export async function POST(request) {
  try {
    const { forceReset } = await request.json().catch(() => ({}));
    
    // Connect to database
    await dbConnect();
    
    // Check if setup has already been completed
    const existingAdmin = await User.findOne({ 
      email: SUPER_ADMIN_CONFIG.email,
      isAdmin: true 
    });
    
    if (existingAdmin && !forceReset) {
      return NextResponse.json(
        {
          success: false,
          message: "Super admin already exists. Use forceReset: true to recreate.",
          data: {
            email: SUPER_ADMIN_CONFIG.email,
            created_at: existingAdmin.created_at,
            id: existingAdmin._id
          }
        },
        { status: 409 }
      );
    }
    
    // If forceReset is true, delete existing admin and role
    if (forceReset) {
      console.log("🔄 Force reset requested, removing existing admin...");
      await User.deleteOne({ email: SUPER_ADMIN_CONFIG.email });
      await Role.deleteOne({ name: "super-admin" });
    }
    
    // Run the seeder
    const { adminRole, adminUser } = await seedSuperAdmin();
    
    return NextResponse.json({
      success: true,
      message: "Super admin setup completed successfully!",
      data: {
        admin: {
          id: adminUser._id,
          name: adminUser.name,
          email: adminUser.email,
          role: adminUser.role_data,
          created_at: adminUser.created_at
        },
        role: {
          id: adminRole._id,
          name: adminRole.name,
          display_name: adminRole.display_name,
          permissions_count: adminRole.permissions.length
        },
        credentials: {
          email: SUPER_ADMIN_CONFIG.email,
          password: SUPER_ADMIN_CONFIG.password,
          note: "Please change this password after first login"
        }
      }
    });
    
  } catch (error) {
    console.error("❌ Setup admin API error:", error);
    
    return NextResponse.json(
      {
        success: false,
        message: "Failed to setup super admin",
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/setup-admin
 * Check super admin setup status
 */
export async function GET() {
  try {
    await dbConnect();
    
    // Check if super admin exists
    const adminUser = await User.findOne({ 
      email: SUPER_ADMIN_CONFIG.email,
      isAdmin: true 
    }).populate('role');
    
    const adminRole = await Role.findOne({ name: "super-admin" });
    
    const isSetup = !!(adminUser && adminRole);
    
    return NextResponse.json({
      success: true,
      data: {
        is_setup: isSetup,
        admin_exists: !!adminUser,
        role_exists: !!adminRole,
        admin_email: SUPER_ADMIN_CONFIG.email,
        setup_info: isSetup ? {
          admin_id: adminUser._id,
          admin_name: adminUser.name,
          role_name: adminRole.name,
          permissions_count: adminRole.permissions.length,
          created_at: adminUser.created_at
        } : null
      }
    });
    
  } catch (error) {
    console.error("❌ Get setup status error:", error);
    
    return NextResponse.json(
      {
        success: false,
        message: "Failed to check setup status",
        error: error.message
      },
      { status: 500 }
    );
  }
}