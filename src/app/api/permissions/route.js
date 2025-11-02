import { NextResponse } from "next/server";

// Default permissions for the system
const permissions = {
  data: [
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

    // Order Management
    { id: 13, name: "order.index", display_name: "View Orders", guard_name: "web", category: "Order Management" },
    { id: 14, name: "order.create", display_name: "Create Orders", guard_name: "web", category: "Order Management" },
    { id: 15, name: "order.edit", display_name: "Edit Orders", guard_name: "web", category: "Order Management" },
    { id: 16, name: "order.destroy", display_name: "Delete Orders", guard_name: "web", category: "Order Management" },

    // Category Management
    { id: 17, name: "category.index", display_name: "View Categories", guard_name: "web", category: "Category Management" },
    { id: 18, name: "category.create", display_name: "Create Categories", guard_name: "web", category: "Category Management" },
    { id: 19, name: "category.edit", display_name: "Edit Categories", guard_name: "web", category: "Category Management" },
    { id: 20, name: "category.destroy", display_name: "Delete Categories", guard_name: "web", category: "Category Management" },

    // Brand Management
    { id: 91, name: "brand.index", display_name: "View Brands", guard_name: "web", category: "Brand Management" },
    { id: 92, name: "brand.create", display_name: "Create Brands", guard_name: "web", category: "Brand Management" },
    { id: 93, name: "brand.edit", display_name: "Edit Brands", guard_name: "web", category: "Brand Management" },
    { id: 94, name: "brand.destroy", display_name: "Delete Brands", guard_name: "web", category: "Brand Management" },

    // Settings
    { id: 25, name: "setting.index", display_name: "View Settings", guard_name: "web", category: "Settings" },
    { id: 26, name: "setting.edit", display_name: "Edit Settings", guard_name: "web", category: "Settings" },

    // Reports
    { id: 27, name: "report.index", display_name: "View Reports", guard_name: "web", category: "Reports" },
    { id: 28, name: "report.export", display_name: "Export Reports", guard_name: "web", category: "Reports" },

    // Dashboard
    { id: 29, name: "dashboard.index", display_name: "View Dashboard", guard_name: "web", category: "Dashboard" },

    // Store Management (for vendors)
    { id: 30, name: "store.index", display_name: "View Store", guard_name: "web", category: "Store Management" },
    { id: 31, name: "store.edit", display_name: "Edit Store", guard_name: "web", category: "Store Management" },

    // Wallet Management
    { id: 32, name: "wallet.index", display_name: "View Wallet", guard_name: "web", category: "Wallet Management" },
    { id: 33, name: "wallet.create", display_name: "Add Wallet Balance", guard_name: "web", category: "Wallet Management" },

    // Point Management
    { id: 34, name: "point.index", display_name: "View Points", guard_name: "web", category: "Point Management" },
    { id: 35, name: "point.create", display_name: "Add Points", guard_name: "web", category: "Point Management" },

    // Coupon Management
    { id: 36, name: "coupon.index", display_name: "View Coupons", guard_name: "web", category: "Coupon Management" },
    { id: 37, name: "coupon.create", display_name: "Create Coupons", guard_name: "web", category: "Coupon Management" },
    { id: 38, name: "coupon.edit", display_name: "Edit Coupons", guard_name: "web", category: "Coupon Management" },
    { id: 39, name: "coupon.destroy", display_name: "Delete Coupons", guard_name: "web", category: "Coupon Management" },

    // Review Management
    { id: 40, name: "review.index", display_name: "View Reviews", guard_name: "web", category: "Review Management" },
    { id: 41, name: "review.edit", display_name: "Moderate Reviews", guard_name: "web", category: "Review Management" },
    { id: 42, name: "review.destroy", display_name: "Delete Reviews", guard_name: "web", category: "Review Management" }
  ]
};

export async function GET(request) {
  try {
    const searchParams = request?.nextUrl?.searchParams;
    const queryCategory = searchParams.get("category");
    
    let filteredPermissions = permissions.data;
    
    // Filter by category if provided
    if (queryCategory && queryCategory !== "all") {
      filteredPermissions = permissions.data.filter(
        permission => permission.category === queryCategory
      );
    }

    // Group permissions by category for easier UI handling
    const groupedPermissions = filteredPermissions.reduce((acc, permission) => {
      const category = permission.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(permission);
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      data: filteredPermissions,
      grouped: groupedPermissions,
      categories: [...new Set(permissions.data.map(p => p.category))]
    });

  } catch (error) {
    console.error("Error fetching permissions:", error);
    return NextResponse.json({
      success: false,
      message: "Internal Server Error",
      data: null
    }, { status: 500 });
  }
}