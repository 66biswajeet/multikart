import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Products";
import Category from "@/models/Category";
import User from "@/models/User";
import Brand from "@/models/Brand";
import mongoose from "mongoose";

/**
 * Helper function to find all child categories recursively
 */
async function findAllChildCategories(parentId) {
  const allIds = [parentId]; // Include the parent itself

  // Find direct children
  const children = await Category.find({ parent_id: parentId })
    .select("_id")
    .lean();

  // Recursively find grandchildren
  for (const child of children) {
    const grandChildren = await findAllChildCategories(child._id);
    allIds.push(...grandChildren);
  }

  return allIds;
}

/**
 * GET /api/vendor-products
 * Public endpoint to get all products that are being sold by vendors
 * Filters by category/subcategory and returns vendor-specific product instances
 */
export async function GET(request) {
  try {
    await dbConnect();

    const searchParams = request?.nextUrl?.searchParams;
    const querySearch = searchParams.get("search");
    const queryCategory = searchParams.get("category_id"); // Single category filter
    const queryCategoryIds = searchParams.get("category_ids"); // Multiple categories filter
    const queryCategorySlug = searchParams.get("category_slug"); // Filter by category slug
    const queryProductSlug = searchParams.get("slug"); // Filter by specific product slug
    const queryVendorProductId = searchParams.get("vendor_product_id"); // Filter by vendor product ID
    const queryBrandIds = searchParams.get("brand_ids");
    const queryPage = parseInt(searchParams.get("page")) || 1;
    const queryLimit = parseInt(searchParams.get("paginate")) || 12;
    const sortBy = searchParams.get("sortBy") || "desc";
    const sortField = searchParams.get("field") || "created_at";

    console.log("🔍 Vendor Products API - Query params:", {
      querySearch,
      queryCategory,
      queryCategoryIds,
      queryCategorySlug,
      queryProductSlug,
      queryVendorProductId,
      queryBrandIds,
      queryPage,
      queryLimit,
      sortBy,
      sortField,
    });

    let query = {
      "linked_vendor_offerings.0": { $exists: true }, // Only products with at least one vendor offering
      "linked_vendor_offerings.is_active": true, // Only active vendor offerings
    };

    // Filter by vendor_product_id if provided
    if (queryVendorProductId) {
      try {
        query["linked_vendor_offerings.vendor_product_id"] =
          new mongoose.Types.ObjectId(queryVendorProductId);
      } catch (e) {
        console.error(
          "❌ Invalid vendor_product_id format:",
          queryVendorProductId,
        );
      }
    }

    // 1. Search by product name or master product code
    if (querySearch) {
      query.$or = [
        { product_name: { $regex: querySearch, $options: "i" } },
        { master_product_code: { $regex: querySearch, $options: "i" } },
      ];
    }

    // 2. Filter by Category Slug
    if (queryCategorySlug) {
      const category = await Category.findOne({
        slug: queryCategorySlug,
        type: "product",
      }).lean();

      if (category) {
        // Find all child categories recursively
        const allCategoryIds = await findAllChildCategories(category._id);
        query.category_id = { $in: allCategoryIds };
      }
    }
    // 3. Filter by Category ID (Single or Multiple) - HIERARCHICAL SUPPORT
    else if (queryCategory) {
      try {
        const categoryId = new mongoose.Types.ObjectId(queryCategory);
        const allCategoryIds = await findAllChildCategories(categoryId);
        query.category_id = { $in: allCategoryIds };
      } catch (e) {
        console.error("❌ Invalid category_id format:", queryCategory);
      }
    } else if (queryCategoryIds) {
      const categoryIdArray = queryCategoryIds.split(",").filter(Boolean);
      if (categoryIdArray.length > 0) {
        try {
          const categoryObjectIds = categoryIdArray.map(
            (id) => new mongoose.Types.ObjectId(id.trim()),
          );

          let allCategoryIds = [];
          for (const catId of categoryObjectIds) {
            const childIds = await findAllChildCategories(catId);
            allCategoryIds = allCategoryIds.concat(childIds);
          }

          // Remove duplicates
          allCategoryIds = [
            ...new Set(allCategoryIds.map((id) => id.toString())),
          ].map((id) => new mongoose.Types.ObjectId(id));

          query.category_id = { $in: allCategoryIds };
        } catch (e) {
          console.error("❌ Invalid category_ids format:", queryCategoryIds);
        }
      }
    }

    // 4. Filter by Brand
    if (queryBrandIds) {
      const brandIdArray = queryBrandIds.split(",").filter(Boolean);
      if (brandIdArray.length > 0) {
        try {
          query.brand_id = {
            $in: brandIdArray.map(
              (id) => new mongoose.Types.ObjectId(id.trim()),
            ),
          };
        } catch (e) {
          console.error("❌ Invalid brand_ids format:", queryBrandIds);
        }
      }
    }

    // 5. Sort options
    const sortOptions = {};
    if (sortField === "price") {
      sortOptions["linked_vendor_offerings.price"] = sortBy === "asc" ? 1 : -1;
    } else {
      sortOptions[sortField] = sortBy === "asc" ? 1 : -1;
    }

    console.log("🔍 Final Query:", JSON.stringify(query, null, 2));

    // Get total count for pagination
    const totalProducts = await Product.countDocuments(query);

    // Fetch products with vendor offerings
    const products = await Product.find(query)
      .populate("category_id", "name display_name slug path")
      .populate("brand_id", "name")
      .populate("linked_vendor_offerings.vendor_id", "name email store_name")
      .sort(sortOptions)
      .skip((queryPage - 1) * queryLimit)
      .limit(queryLimit)
      .lean();

    console.log(`✅ Found ${products.length} products with vendor offerings`);

    // Transform products to create separate instances for each vendor offering
    const vendorProducts = [];

    for (const product of products) {
      // Filter only active vendor offerings
      let activeOfferings = product.linked_vendor_offerings.filter(
        (offering) => offering.is_active,
      );

      // If filtering by specific vendor_product_id, only include that offering
      if (queryVendorProductId) {
        activeOfferings = activeOfferings.filter(
          (offering) =>
            offering.vendor_product_id.toString() === queryVendorProductId,
        );
      }

      // Create a separate product instance for each vendor offering
      for (const offering of activeOfferings) {
        const vendorProduct = {
          // Product base info - each vendor offering gets a unique ID and slug
          id: offering.vendor_product_id, // Unique ID for this vendor's offering
          _id: offering.vendor_product_id, // Unique ID for this vendor's offering
          master_product_id: product._id, // Link to master product
          vendor_product_id: offering.vendor_product_id,
          product_name: product.product_name, // Same name from master
          slug: `${product.slug}-${offering.vendor_product_id}`, // Unique slug for each vendor offering
          master_slug: product.slug, // Keep original slug for reference
          master_product_code: product.master_product_code,
          short_description: product.short_description, // Same from master
          description: product.description, // Same from master
          type: product.type,
          sku: offering.vendor_sku || product.sku,

          // Category and brand
          category_id: product.category_id,
          brand_id: product.brand_id,

          // Vendor-specific pricing and stock
          base_price: offering.base_price,
          floor_price: offering.floor_price,
          price: offering.price,
          standard_price: offering.price,
          sale_price: offering.price,
          stock_quantity: offering.stock_quantity,
          stock_status:
            offering.stock_quantity > 0 ? "in_stock" : "out_of_stock",

          // Vendor info
          vendor_id: offering.vendor_id._id,
          vendor_name: offering.vendor_id.store_name || offering.vendor_id.name,
          vendor_email: offering.vendor_id.email,

          // Product media (prefer vendor media, fallback to master product)
          product_thumbnail:
            offering.media && offering.media.length > 0
              ? offering.media.find((m) => m.is_primary) || offering.media[0]
              : product.product_thumbnail,
          product_galleries:
            offering.media && offering.media.length > 0
              ? offering.media
              : product.product_galleries || [],
          media: offering.media || [],

          // Other product details
          condition: offering.condition,
          shipping_info: offering.shipping_info,
          shipping_weight: offering.shipping_weight,
          dimensions: offering.dimensions,
          selected_variants: offering.selected_variants,

          // Master product attributes
          attribute_values: product.attribute_values,
          variant_values: product.variant_values,
          product_policies: product.product_policies,

          // Status and dates
          status: offering.is_active ? 1 : 0,
          is_active: offering.is_active,
          created_at: offering.created_at || product.created_at,
          updated_at: offering.updated_at || product.updated_at,
        };

        vendorProducts.push(vendorProduct);
      }
    }

    console.log(
      `✅ Transformed into ${vendorProducts.length} vendor product instances`,
    );

    const response = {
      success: true,
      current_page: queryPage,
      last_page: Math.ceil(totalProducts / queryLimit),
      total: vendorProducts.length,
      per_page: queryLimit,
      data: vendorProducts,
    };

    // Add CORS headers for client site access
    const jsonResponse = NextResponse.json(response);
    jsonResponse.headers.set("Access-Control-Allow-Origin", "*");
    jsonResponse.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    jsonResponse.headers.set("Access-Control-Allow-Headers", "Content-Type");

    return jsonResponse;
  } catch (error) {
    console.error("❌ Vendor Products GET Error:", error);
    const errorResponse = NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );

    errorResponse.headers.set("Access-Control-Allow-Origin", "*");
    return errorResponse;
  }
}

/**
 * OPTIONS handler for CORS preflight requests
 */
export async function OPTIONS(request) {
  const response = new NextResponse(null, { status: 200 });
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}
