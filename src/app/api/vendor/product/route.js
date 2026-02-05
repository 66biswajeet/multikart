import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Products";
import Category from "@/models/Category";
import Discount from "@/models/Discount";
import mongoose from "mongoose";
import { requireAuth } from "@/utils/auth/serverAuth";
import { uploadToCloudinary } from "@/utils/cloudinary/cloudinaryService";
import { applyDiscountsToProducts } from "@/utils/discountCalculator";

/**
 * GET /api/vendor/product
 * Lists all Master Products that this vendor is selling.
 */
export async function GET(request) {
  try {
    await dbConnect();

    // 1. Verify Vendor Auth
    const authCheck = await requireAuth(request);
    if (!authCheck.success) {
      return authCheck.errorResponse;
    }

    const vendorId = authCheck.authData.userId;

    // 2. Find Master Products
    const products = await Product.find({
      "linked_vendor_offerings.vendor_id": vendorId,
    })
      .populate("category_id", "name")
      .select(
        "product_name slug product_thumbnail linked_vendor_offerings status createdAt base_price floor_price promo_price sku",
      )
      .lean();

    // 3. Get active discounts for this vendor
    const discounts = await Discount.find({
      vendor: vendorId,
      status: true,
      start_date: { $lte: new Date() },
      end_date: { $gte: new Date() },
    }).lean();

    // 4. Transform data
    const vendorProducts = products.map((p) => {
      const myOffer = p.linked_vendor_offerings.find(
        (offer) => offer.vendor_id.toString() === vendorId.toString(),
      );

      return {
        id: p._id,
        _id: p._id,
        name: p.product_name,
        slug: p.slug,
        image: p.product_thumbnail,
        category: p.category_id?.name || "N/A",
        category_id: p.category_id,
        sku: myOffer?.vendor_sku || p.sku || "N/A",
        base_price: myOffer?.base_price ?? 0,
        floor_price: myOffer?.floor_price ?? 0,
        price: myOffer?.price || 0,
        stock: myOffer?.stock_quantity || 0,
        status: myOffer?.is_active ? 1 : 0,
        created_at: p.createdAt,
      };
    });

    // 5. Apply discounts to calculate promotional prices
    const productsWithDiscounts = applyDiscountsToProducts(
      vendorProducts,
      discounts,
    );

    // --- FIX: Return data in Pagination format for the Table ---
    return NextResponse.json({
      success: true,
      data: {
        data: productsWithDiscounts,
        total: productsWithDiscounts.length,
        current_page: 1,
        per_page:
          productsWithDiscounts.length > 0 ? productsWithDiscounts.length : 10,
        last_page: 1,
      },
    });
  } catch (error) {
    console.error("Vendor Product GET Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

/**
 * POST /api/vendor/product
 * 1. Link to existing Master Product ("Sell This Product")
 * 2. OR Submit new product for approval
 */
// export async function POST(request) {
//   console.log("=== VENDOR PRODUCT SUBMISSION API ===");
//   try {
//     await dbConnect();

//     const authCheck = await requireAuth(request);
//     if (!authCheck.success) {
//       return authCheck.errorResponse;
//     }

//     const formData = await request.formData();
//     const productDataString = formData.get("data");
//     const productData = productDataString ? JSON.parse(productDataString) : {};

//     // SCENARIO 1: Link to Existing Master Product
//     if (productData.master_product_id) {
//       console.log(
//         "🔗 Linking vendor to existing Master Product:",
//         productData.master_product_id
//       );

//       // Create the offering object
//       // Support new warehouse_stock array from frontend
//       let stock_quantity = 0;
//       let warehouse_stock = [];
//       if (
//         Array.isArray(productData.warehouse_stock) &&
//         productData.warehouse_stock.length > 0
//       ) {
//         warehouse_stock = productData.warehouse_stock.map((ws) => ({
//           warehouse_id: ws.warehouse_id,
//           stock: Number(ws.stock) || 0,
//         }));
//         stock_quantity = warehouse_stock.reduce((sum, ws) => sum + ws.stock, 0);
//       } else {
//         stock_quantity = Number(productData.stock_quantity) || 0;
//       }

//       // Find master product first
//       const masterProduct = await Product.findById(
//         productData.master_product_id
//       );

//       if (!masterProduct) {
//         return NextResponse.json(
//           { success: false, message: "Master Product not found." },
//           { status: 404 }
//         );
//       }

//       // Create vendor offering subdocument
//       const vendorOffering = {
//         vendor_product_id: new mongoose.Types.ObjectId(),
//         vendor_id: authCheck.authData.userId,
//         vendor_sku: productData.vendor_sku || "",
//         base_price: Number(productData.base_price) || 0,
//         floor_price: Number(productData.floor_price) || 0,
//         price: Number(productData.price),
//         stock_quantity,
//         warehouse_stock,
//         condition: productData.condition || "new",
//         shipping_info: productData.shipping_info,
//         is_active: true,
//         selected_variants: productData.selected_variants || {},
//       };

//       // Push to array and save (lets Mongoose handle subdocument creation)
//       masterProduct.linked_vendor_offerings.push(vendorOffering);
//       const updatedProduct = await masterProduct.save();

//       return NextResponse.json(
//         {
//           success: true,
//           message: "Product listed successfully.",
//           data: updatedProduct,
//         },
//         { status: 200 }
//       );
//     }

//     // SCENARIO 2: Request New Product (Fallback for full submission)
//     const {
//       product_name,
//       category_id,
//       brand_id,
//       product_policies,
//       attribute_values,
//       variant_values,
//       price,
//       stock_quantity,
//     } = productData;

//     if (!product_name || !category_id) {
//       return NextResponse.json(
//         { success: false, message: "Product Name and Category are required." },
//         { status: 400 }
//       );
//     }

//     // Generate UPID
//     const lastProduct = await Product.findOne().sort({ created_at: -1 });
//     let nextId = 1;
//     if (lastProduct && lastProduct.master_product_code) {
//       try {
//         const lastIdNum = parseInt(
//           lastProduct.master_product_code.split("UPID-")[1]
//         );
//         if (!isNaN(lastIdNum)) nextId = lastIdNum + 1;
//         else nextId = (await Product.countDocuments()) + 1;
//       } catch (e) {
//         nextId = (await Product.countDocuments()) + 1;
//       }
//     }
//     const master_product_code = `UPID-${nextId.toString().padStart(6, "0")}`;

//     // Generate Slug
//     let slug = product_name
//       .toLowerCase()
//       .replace(/[^a-z0-9]+/g, "-")
//       .replace(/(^-|-$)/g, "");
//     const existingSlug = await Product.findOne({ slug });
//     if (existingSlug) slug = `${slug}-${Date.now()}`;

//     // Handle Files - Upload directly with buffer (Vercel compatible)
//     const media = [];
//     const product_thumbnail_file = formData.get("product_thumbnail");

//     if (product_thumbnail_file && product_thumbnail_file.size > 0) {
//       const bytes = await product_thumbnail_file.arrayBuffer();
//       const buffer = Buffer.from(bytes);

//       const uploadResult = await uploadToCloudinary(
//         [{ buffer, originalname: product_thumbnail_file.name }],
//         "products"
//       );
//       media.push({
//         url: uploadResult[0].secure_url,
//         is_primary: true,
//         type: "image",
//       });
//     }

//     // Create Vendor Offering
//     const vendorOffering = {
//       vendor_product_id: new mongoose.Types.ObjectId(),
//       vendor_id: authCheck.authData.userId,
//       vendor_sku: productData.vendor_sku || "",
//       base_price: Number(productData.base_price) || 0,
//       floor_price: Number(productData.floor_price) || 0,
//       price: Number(price) || 0,
//       stock_quantity: Number(stock_quantity) || 0,
//       is_active: true,
//     };

//     // Save New Product (Inactive/Pending)
//     const newProduct = new Product({
//       master_product_code,
//       product_name,
//       slug,
//       category_id,
//       brand_id: brand_id || null,
//       status: "inactive", // Forces Admin Approval
//       product_policies: product_policies || {},
//       attribute_values: attribute_values || [],
//       variant_values: variant_values || [],
//       media: media,
//       linked_vendor_offerings: [vendorOffering],
//       created_by: authCheck.authData.userId,
//       updated_by: authCheck.authData.userId,
//     });

//     await newProduct.save();

//     return NextResponse.json(
//       {
//         success: true,
//         message: "Product submitted successfully. Waiting for Admin approval.",
//         data: newProduct,
//       },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.error("❌ Vendor Product Submit Error:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         message: "Failed to submit product",
//         error: error.message,
//       },
//       { status: 500 }
//     );
//   }
// }
export async function POST(request) {
  console.log("=== VENDOR PRODUCT SUBMISSION API ===");
  try {
    await dbConnect();

    const authCheck = await requireAuth(request);
    if (!authCheck.success) {
      return authCheck.errorResponse;
    }
    const vendorId = authCheck.authData.userId;

    // Parse Form Data
    const formData = await request.formData();
    const productDataString = formData.get("data");
    const productData = productDataString ? JSON.parse(productDataString) : {};

    // SCENARIO 1: Link to Existing Master Product
    if (productData.master_product_id) {
      const masterProduct = await Product.findById(
        productData.master_product_id,
      );
      if (!masterProduct) {
        return NextResponse.json(
          { success: false, message: "Master Product not found." },
          { status: 404 },
        );
      }

      const offeringsList =
        productData.offerings && Array.isArray(productData.offerings)
          ? productData.offerings
          : [productData];

      // Loop through offerings (variants)
      for (let i = 0; i < offeringsList.length; i++) {
        const offer = offeringsList[i];

        // 1. Process Inventory
        let warehouse_stock = [];
        let total_stock = 0;
        if (Array.isArray(offer.inventory_data)) {
          warehouse_stock = offer.inventory_data.map((inv) => ({
            warehouse_id: inv.warehouse_id,
            stock: Number(inv.stock_quantity) || 0,
            low_stock_threshold: Number(inv.low_stock_threshold) || 0,
          }));
          total_stock = warehouse_stock.reduce(
            (acc, curr) => acc + curr.stock,
            0,
          );
        } else {
          total_stock = Number(offer.stock_quantity) || 0;
        }

        // 2. Process Images for this Variant
        // We look for keys 'files_variant_0_0', 'files_variant_0_1' etc in FormData
        const media = [];
        // 'offer.media' from frontend contains metadata placeholders (is_main).
        // We use its length to know how many files to look for.
        if (offer.media && Array.isArray(offer.media)) {
          for (let j = 0; j < offer.media.length; j++) {
            const fileKey = `files_variant_${i}_${j}`;
            const file = formData.get(fileKey);

            if (file && file.size > 0) {
              // Upload File
              const bytes = await file.arrayBuffer();
              const buffer = Buffer.from(bytes);
              const uploadResult = await uploadToCloudinary(
                [{ buffer, originalname: file.name }],
                "products/variants",
              );

              media.push({
                url: uploadResult[0].secure_url,
                is_primary: offer.media[j].is_main, // Use meta from JSON
                type: "image",
              });
            }
          }
        }

        // 3. Create Offering
        const vendorOffering = {
          vendor_product_id: new mongoose.Types.ObjectId(),
          vendor_id: vendorId,
          vendor_sku: offer.vendor_sku || "",
          base_price: Number(offer.base_price) || 0,
          floor_price: Number(offer.floor_price) || 0,
          price: Number(offer.base_price) || 0,
          stock_quantity: total_stock,
          warehouse_stock: warehouse_stock,
          condition: offer.condition || "new",
          shipping_info: offer.shipping_info,
          is_active: true,
          selected_variants: offer.selected_variants || {},
          media: media, // Save uploaded media
        };

        masterProduct.linked_vendor_offerings.push(vendorOffering);
      }

      await masterProduct.save();

      return NextResponse.json(
        {
          success: true,
          message: `${offeringsList.length} product variant(s) listed successfully.`,
        },
        { status: 200 },
      );
    }

    // SCENARIO 2 (New Product Request) remains same... (omitted for brevity as user is linking)
    return NextResponse.json(
      { success: false, message: "Invalid Request" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Submit Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit product",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/vendor/product
 * Bulk delete vendor products
 */
export async function DELETE(request) {
  try {
    await dbConnect();

    const authCheck = await requireAuth(request);
    if (!authCheck.success) {
      return authCheck.errorResponse;
    }

    const vendorId = authCheck.authData.userId;
    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, message: "Product IDs are required" },
        { status: 400 },
      );
    }

    // Update products to remove vendor offerings for this vendor
    const result = await Product.updateMany(
      {
        _id: { $in: ids },
        "linked_vendor_offerings.vendor_id": vendorId,
      },
      {
        $pull: { linked_vendor_offerings: { vendor_id: vendorId } },
      },
    );

    return NextResponse.json({
      success: true,
      message: `${result.modifiedCount} products removed from your offerings`,
    });
  } catch (error) {
    console.error("❌ Vendor Product DELETE Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
