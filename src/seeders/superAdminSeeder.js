/**
 * Super Admin Seeder Script
 * This script creates a super admin user with all permissions in the database
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Role from "../models/Role.js";
import dbConnect from "../lib/dbConnect.js";

// Super Admin Configuration
const SUPER_ADMIN_CONFIG = {
  name: "Super Administrator",
  email: "admin@multivendor.com",
  phone: 1234567890,
  country_code: "+1",
  password: "SuperAdmin123!",
  system_reserve: "1",
  status: 1,
  isAdmin: true,
  email_verified_at: new Date(),
};

// All available permissions for super admin (ALL 94 permissions from account.json)
const ALL_PERMISSIONS = [
  // User Management
  { id: 1, name: "user.index", display_name: "View Users", guard_name: "web", category: "User Management" },
  { id: 2, name: "user.create", display_name: "Create Users", guard_name: "web", category: "User Management" },
  { id: 3, name: "user.edit", display_name: "Edit Users", guard_name: "web", category: "User Management" },
  { id: 4, name: "user.destroy", display_name: "Delete Users", guard_name: "web", category: "User Management" },
  
  // Role Management
  { id: 5, name: "role.index", display_name: "View Roles", guard_name: "web", category: "Role Management" },
  { id: 6, name: "role.create", display_name: "Create Roles", guard_name: "web", category: "Role Management" },
  { id: 7, name: "role.edit", display_name: "Edit Roles", guard_name: "web", category: "Role Management" },
  { id: 8, name: "role.destroy", display_name: "Delete Roles", guard_name: "web", category: "Role Management" },
  
  // Product Management
  { id: 9, name: "product.index", display_name: "View Products", guard_name: "web", category: "Product Management" },
  { id: 10, name: "product.create", display_name: "Create Products", guard_name: "web", category: "Product Management" },
  { id: 11, name: "product.edit", display_name: "Edit Products", guard_name: "web", category: "Product Management" },
  { id: 12, name: "product.destroy", display_name: "Delete Products", guard_name: "web", category: "Product Management" },
  
  // Attribute Management
  { id: 13, name: "attribute.index", display_name: "View Attributes", guard_name: "web", category: "Attribute Management" },
  { id: 14, name: "attribute.create", display_name: "Create Attributes", guard_name: "web", category: "Attribute Management" },
  { id: 15, name: "attribute.edit", display_name: "Edit Attributes", guard_name: "web", category: "Attribute Management" },
  { id: 16, name: "attribute.destroy", display_name: "Delete Attributes", guard_name: "web", category: "Attribute Management" },
  
  // Category Management
  { id: 17, name: "category.index", display_name: "View Categories", guard_name: "web", category: "Category Management" },
  { id: 18, name: "category.create", display_name: "Create Categories", guard_name: "web", category: "Category Management" },
  { id: 19, name: "category.edit", display_name: "Edit Categories", guard_name: "web", category: "Category Management" },
  { id: 20, name: "category.destroy", display_name: "Delete Categories", guard_name: "web", category: "Category Management" },
  
  // Tag Management
  { id: 21, name: "tag.index", display_name: "View Tags", guard_name: "web", category: "Tag Management" },
  { id: 22, name: "tag.create", display_name: "Create Tags", guard_name: "web", category: "Tag Management" },
  { id: 23, name: "tag.edit", display_name: "Edit Tags", guard_name: "web", category: "Tag Management" },
  { id: 24, name: "tag.destroy", display_name: "Delete Tags", guard_name: "web", category: "Tag Management" },
  
  // Store Management
  { id: 25, name: "store.index", display_name: "View Store", guard_name: "web", category: "Store Management" },
  { id: 26, name: "store.create", display_name: "Create Store", guard_name: "web", category: "Store Management" },
  { id: 27, name: "store.edit", display_name: "Edit Store", guard_name: "web", category: "Store Management" },
  { id: 28, name: "store.destroy", display_name: "Delete Store", guard_name: "web", category: "Store Management" },
  
  // Vendor Wallet Management
  { id: 29, name: "vendor_wallet.index", display_name: "View Vendor Wallet", guard_name: "web", category: "Vendor Wallet Management" },
  { id: 30, name: "vendor_wallet.credit", display_name: "Credit Vendor Wallet", guard_name: "web", category: "Vendor Wallet Management" },
  { id: 31, name: "vendor_wallet.debit", display_name: "Debit Vendor Wallet", guard_name: "web", category: "Vendor Wallet Management" },
  
  // Commission Management
  { id: 32, name: "commission_history.index", display_name: "View Commission History", guard_name: "web", category: "Commission Management" },
  
  // Withdraw Request Management
  { id: 33, name: "withdraw_request.index", display_name: "View Withdraw Requests", guard_name: "web", category: "Withdraw Request Management" },
  { id: 34, name: "withdraw_request.create", display_name: "Create Withdraw Request", guard_name: "web", category: "Withdraw Request Management" },
  { id: 35, name: "withdraw_request.action", display_name: "Action on Withdraw Request", guard_name: "web", category: "Withdraw Request Management" },
  
  // Order Management
  { id: 36, name: "order.index", display_name: "View Orders", guard_name: "web", category: "Order Management" },
  { id: 37, name: "order.create", display_name: "Create Orders", guard_name: "web", category: "Order Management" },
  { id: 38, name: "order.edit", display_name: "Edit Orders", guard_name: "web", category: "Order Management" },
  
  // Attachment Management
  { id: 39, name: "attachment.index", display_name: "View Attachments", guard_name: "web", category: "Attachment Management" },
  { id: 40, name: "attachment.create", display_name: "Create Attachments", guard_name: "web", category: "Attachment Management" },
  { id: 41, name: "attachment.destroy", display_name: "Delete Attachments", guard_name: "web", category: "Attachment Management" },
  
  // Blog Management
  { id: 42, name: "blog.index", display_name: "View Blogs", guard_name: "web", category: "Blog Management" },
  { id: 43, name: "blog.create", display_name: "Create Blogs", guard_name: "web", category: "Blog Management" },
  { id: 44, name: "blog.edit", display_name: "Edit Blogs", guard_name: "web", category: "Blog Management" },
  { id: 45, name: "blog.destroy", display_name: "Delete Blogs", guard_name: "web", category: "Blog Management" },
  
  // Page Management
  { id: 46, name: "page.index", display_name: "View Pages", guard_name: "web", category: "Page Management" },
  { id: 47, name: "page.create", display_name: "Create Pages", guard_name: "web", category: "Page Management" },
  { id: 48, name: "page.edit", display_name: "Edit Pages", guard_name: "web", category: "Page Management" },
  { id: 49, name: "page.destroy", display_name: "Delete Pages", guard_name: "web", category: "Page Management" },
  
  // Tax Management
  { id: 50, name: "tax.index", display_name: "View Tax", guard_name: "web", category: "Tax Management" },
  { id: 51, name: "tax.create", display_name: "Create Tax", guard_name: "web", category: "Tax Management" },
  { id: 52, name: "tax.edit", display_name: "Edit Tax", guard_name: "web", category: "Tax Management" },
  { id: 53, name: "tax.destroy", display_name: "Delete Tax", guard_name: "web", category: "Tax Management" },
  
  // Shipping Management
  { id: 54, name: "shipping.index", display_name: "View Shipping", guard_name: "web", category: "Shipping Management" },
  { id: 55, name: "shipping.create", display_name: "Create Shipping", guard_name: "web", category: "Shipping Management" },
  { id: 56, name: "shipping.edit", display_name: "Edit Shipping", guard_name: "web", category: "Shipping Management" },
  { id: 57, name: "shipping.destroy", display_name: "Delete Shipping", guard_name: "web", category: "Shipping Management" },
  
  // Coupon Management
  { id: 58, name: "coupon.index", display_name: "View Coupons", guard_name: "web", category: "Coupon Management" },
  { id: 59, name: "coupon.create", display_name: "Create Coupons", guard_name: "web", category: "Coupon Management" },
  { id: 60, name: "coupon.edit", display_name: "Edit Coupons", guard_name: "web", category: "Coupon Management" },
  { id: 61, name: "coupon.destroy", display_name: "Delete Coupons", guard_name: "web", category: "Coupon Management" },
  
  // Currency Management
  { id: 62, name: "currency.index", display_name: "View Currency", guard_name: "web", category: "Currency Management" },
  { id: 63, name: "currency.create", display_name: "Create Currency", guard_name: "web", category: "Currency Management" },
  { id: 64, name: "currency.edit", display_name: "Edit Currency", guard_name: "web", category: "Currency Management" },
  { id: 65, name: "currency.destroy", display_name: "Delete Currency", guard_name: "web", category: "Currency Management" },
  
  // Point Management
  { id: 66, name: "point.index", display_name: "View Points", guard_name: "web", category: "Point Management" },
  { id: 67, name: "point.credit", display_name: "Credit Points", guard_name: "web", category: "Point Management" },
  { id: 68, name: "point.debit", display_name: "Debit Points", guard_name: "web", category: "Point Management" },
  
  // Wallet Management
  { id: 69, name: "wallet.index", display_name: "View Wallet", guard_name: "web", category: "Wallet Management" },
  { id: 70, name: "wallet.credit", display_name: "Credit Wallet", guard_name: "web", category: "Wallet Management" },
  { id: 71, name: "wallet.debit", display_name: "Debit Wallet", guard_name: "web", category: "Wallet Management" },
  
  // Refund Management
  { id: 72, name: "refund.index", display_name: "View Refunds", guard_name: "web", category: "Refund Management" },
  { id: 73, name: "refund.create", display_name: "Create Refunds", guard_name: "web", category: "Refund Management" },
  { id: 74, name: "refund.action", display_name: "Action on Refunds", guard_name: "web", category: "Refund Management" },
  
  // Review Management
  { id: 75, name: "review.index", display_name: "View Reviews", guard_name: "web", category: "Review Management" },
  { id: 76, name: "review.create", display_name: "Create Reviews", guard_name: "web", category: "Review Management" },
  
  // FAQ Management
  { id: 77, name: "faq.index", display_name: "View FAQ", guard_name: "web", category: "FAQ Management" },
  { id: 78, name: "faq.create", display_name: "Create FAQ", guard_name: "web", category: "FAQ Management" },
  { id: 79, name: "faq.edit", display_name: "Edit FAQ", guard_name: "web", category: "FAQ Management" },
  { id: 80, name: "faq.destroy", display_name: "Delete FAQ", guard_name: "web", category: "FAQ Management" },
  
  // Theme Management
  { id: 81, name: "theme.index", display_name: "View Theme", guard_name: "web", category: "Theme Management" },
  { id: 82, name: "theme.edit", display_name: "Edit Theme", guard_name: "web", category: "Theme Management" },
  
  // Theme Option Management
  { id: 83, name: "theme_option.index", display_name: "View Theme Options", guard_name: "web", category: "Theme Option Management" },
  { id: 84, name: "theme_option.edit", display_name: "Edit Theme Options", guard_name: "web", category: "Theme Option Management" },
  
  // Settings Management
  { id: 85, name: "setting.index", display_name: "View Settings", guard_name: "web", category: "Settings Management" },
  { id: 86, name: "setting.edit", display_name: "Edit Settings", guard_name: "web", category: "Settings Management" },
  
  // Q&A Management
  { id: 87, name: "question_and_answer.index", display_name: "View Q&A", guard_name: "web", category: "Q&A Management" },
  { id: 88, name: "question_and_answer.create", display_name: "Create Q&A", guard_name: "web", category: "Q&A Management" },
  { id: 89, name: "question_and_answer.edit", display_name: "Edit Q&A", guard_name: "web", category: "Q&A Management" },
  { id: 90, name: "question_and_answer.destroy", display_name: "Delete Q&A", guard_name: "web", category: "Q&A Management" },
  
  // Brand Management
  { id: 91, name: "brand.index", display_name: "View Brands", guard_name: "web", category: "Brand Management" },
  { id: 92, name: "brand.create", display_name: "Create Brands", guard_name: "web", category: "Brand Management" },
  { id: 93, name: "brand.edit", display_name: "Edit Brands", guard_name: "web", category: "Brand Management" },
  { id: 94, name: "brand.destroy", display_name: "Delete Brands", guard_name: "web", category: "Brand Management" }
];

/**
 * Create Super Admin Role
 */
async function createSuperAdminRole() {
  console.log("🔧 Creating super admin role...");
  
  try {
    // Check if super admin role already exists
    let adminRole = await Role.findOne({ name: "super-admin" });
    
    if (adminRole) {
      console.log("✅ Super admin role already exists, updating permissions...");
      
      // Update permissions
      adminRole.permissions = ALL_PERMISSIONS.map(permission => ({
        id: permission.id,
        name: permission.name,
        guard_name: permission.guard_name,
        created_at: new Date(),
        updated_at: new Date()
      }));
      
      await adminRole.save();
      return adminRole;
    }
    
    // Create new super admin role
    adminRole = new Role({
      name: "super-admin",
      display_name: "Super Administrator",
      guard_name: "web",
      system_reserve: "1",
      description: "Full system access with all permissions",
      status: 1,
      permissions: ALL_PERMISSIONS.map(permission => ({
        id: permission.id,
        name: permission.name,
        guard_name: permission.guard_name,
        created_at: new Date(),
        updated_at: new Date()
      }))
    });
    
    await adminRole.save();
    console.log("✅ Super admin role created successfully!");
    return adminRole;
    
  } catch (error) {
    console.error("❌ Error creating super admin role:", error);
    throw error;
  }
}

/**
 * Create Super Admin User
 */
async function createSuperAdminUser(adminRole) {
  console.log("👤 Creating super admin user...");
  
  try {
    // Check if super admin user already exists
    let adminUser = await User.findOne({ email: SUPER_ADMIN_CONFIG.email });
    
    if (adminUser) {
      console.log("✅ Super admin user already exists, updating role and permissions...");
      
      // Update user with admin role
      adminUser.role = adminRole._id;
      adminUser.role_id = 1;
      adminUser.role_data = {
        id: 1,
        name: adminRole.name,
        guard_name: adminRole.guard_name,
        system_reserve: adminRole.system_reserve
      };
      adminUser.isAdmin = true;
      adminUser.status = 1;
      adminUser.system_reserve = "1";
      
      await adminUser.save();
      return adminUser;
    }
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(SUPER_ADMIN_CONFIG.password, saltRounds);
    
    // Create new super admin user
    adminUser = new User({
      ...SUPER_ADMIN_CONFIG,
      password: hashedPassword,
      role: adminRole._id,
      role_id: 1,
      role_data: {
        id: 1,
        name: adminRole.name,
        guard_name: adminRole.guard_name,
        system_reserve: adminRole.system_reserve
      },
      created_by: null // Self-created
    });
    
    await adminUser.save();
    console.log("✅ Super admin user created successfully!");
    console.log("📧 Email:", SUPER_ADMIN_CONFIG.email);
    console.log("🔑 Password:", SUPER_ADMIN_CONFIG.password);
    
    return adminUser;
    
  } catch (error) {
    console.error("❌ Error creating super admin user:", error);
    throw error;
  }
}

/**
 * Main seeder function
 */
async function seedSuperAdmin() {
  try {
    console.log("🚀 Starting super admin seeder...");
    
    // Connect to database
    await dbConnect();
    console.log("📦 Connected to database");
    
    // Create super admin role
    const adminRole = await createSuperAdminRole();
    
    // Create super admin user
    const adminUser = await createSuperAdminUser(adminRole);
    
    console.log("✨ Super admin seeder completed successfully!");
    console.log("🎯 You can now login with:");
    console.log("   Email:", SUPER_ADMIN_CONFIG.email);
    console.log("   Password:", SUPER_ADMIN_CONFIG.password);
    
    return { adminRole, adminUser };
    
  } catch (error) {
    console.error("💥 Super admin seeder failed:", error);
    throw error;
  }
}

// Export for use as a module
export { seedSuperAdmin, SUPER_ADMIN_CONFIG, ALL_PERMISSIONS };

// Run directly if this file is executed
if (import.meta.url === `file://${process.argv[1]}`) {
  seedSuperAdmin()
    .then(() => {
      console.log("🎉 Seeder execution completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("🔥 Seeder execution failed:", error);
      process.exit(1);
    });
}