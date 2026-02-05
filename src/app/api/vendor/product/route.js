import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Products";
import Discount from "@/models/Discount";
import mongoose from "mongoose";
import { requireAuth } from "@/utils/auth/serverAuth";
import { uploadToCloudinary } from "@/utils/cloudinary/cloudinaryService";
import { applyDiscountsToProducts } from "@/utils/discountCalculator";

export async function GET(request) {
  try {
    await dbConnect();
    const authCheck = await requireAuth(request);
    if (!authCheck.success) return authCheck.errorResponse;
    const vendorId = authCheck.authData.userId;

    const products = await Product.find({
      "linked_vendor_offerings.vendor_id": vendorId,
    })
      .populate("category_id", "name")
      .select(
        "product_name slug product_thumbnail linked_vendor_offerings status createdAt base_price floor_price promo_price sku",
      )
      .lean();

    const discounts = await Discount.find({
      vendor: vendorId,
      status: true,
      start_date: { $lte: new Date() },
      end_date: { $gte: new Date() },
    }).lean();

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

    const productsWithDiscounts = applyDiscountsToProducts(
      vendorProducts,
      discounts,
    );

    return NextResponse.json({
      success: true,
      data: {
        data: productsWithDiscounts,
        total: productsWithDiscounts.length,
        current_page: 1,
        per_page: 10,
        last_page: 1,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const authCheck = await requireAuth(request);
    if (!authCheck.success) return authCheck.errorResponse;
    const vendorId = authCheck.authData.userId;

    const formData = await request.formData();
    const productDataString = formData.get("data");
    const productData = productDataString ? JSON.parse(productDataString) : {};

    // --- SCENARIO 1: LINKING TO MASTER PRODUCT ---
    if (productData.master_product_id) {
      const masterProduct = await Product.findById(
        productData.master_product_id,
      );
      if (!masterProduct)
        return NextResponse.json(
          { success: false, message: "Master Product not found." },
          { status: 404 },
        );

      const offeringsList =
        productData.offerings && Array.isArray(productData.offerings)
          ? productData.offerings
          : [productData];

      for (let i = 0; i < offeringsList.length; i++) {
        const offer = offeringsList[i];

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

        // Upload images for this variant
        const media = [];
        if (offer.media && Array.isArray(offer.media)) {
          for (let j = 0; j < offer.media.length; j++) {
            const fileKey = `files_variant_${i}_${j}`;
            const file = formData.get(fileKey);
            if (file && file.size > 0) {
              const bytes = await file.arrayBuffer();
              const buffer = Buffer.from(bytes);
              const uploadResult = await uploadToCloudinary(
                [{ buffer, originalname: file.name }],
                "products/variants",
              );
              media.push({
                url: uploadResult[0].secure_url,
                is_primary: offer.media[j].is_main,
                type: "image",
              });
            }
          }
        }

        masterProduct.linked_vendor_offerings.push({
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
          media: media,
        });
      }

      await masterProduct.save();
      return NextResponse.json(
        { success: true, message: "Products listed successfully." },
        { status: 200 },
      );
    }

    // --- SCENARIO 2: REQUEST NEW PRODUCT ---
    const { product_name, category_id } = productData;
    if (!product_name || !category_id)
      return NextResponse.json(
        { success: false, message: "Product Name and Category are required." },
        { status: 400 },
      );

    const lastProduct = await Product.findOne().sort({ created_at: -1 });
    let nextId = 1;
    if (lastProduct?.master_product_code) {
      const lastIdNum = parseInt(
        lastProduct.master_product_code.split("UPID-")[1],
      );
      if (!isNaN(lastIdNum)) nextId = lastIdNum + 1;
    }
    const master_product_code = `UPID-${nextId.toString().padStart(6, "0")}`;

    let slug = product_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    if (await Product.findOne({ slug })) slug = `${slug}-${Date.now()}`;

    // Upload Thumbnail
    const media = [];
    const product_thumbnail_file = formData.get("product_thumbnail");
    if (product_thumbnail_file && product_thumbnail_file.size > 0) {
      const bytes = await product_thumbnail_file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadResult = await uploadToCloudinary(
        [{ buffer, originalname: product_thumbnail_file.name }],
        "products",
      );
      media.push({
        url: uploadResult[0].secure_url,
        is_primary: true,
        type: "image",
      });
    }

    // Sanitize Empty Policies
    const policies = productData.product_policies || {};
    if (policies.return_policy === "") policies.return_policy = null;
    if (policies.refund_policy === "") policies.refund_policy = null;
    if (policies.warranty_info === "") policies.warranty_info = null;

    const newProduct = new Product({
      master_product_code,
      product_name,
      slug,
      category_id,
      brand_id: productData.brand_id || null,
      status: "inactive",
      product_policies: policies,
      attribute_values: productData.attribute_values || [],
      variant_values: productData.variant_values || [],
      media: media,
      linked_vendor_offerings: [
        {
          vendor_product_id: new mongoose.Types.ObjectId(),
          vendor_id: vendorId,
          vendor_sku: productData.vendor_sku || "",
          base_price: Number(productData.base_price) || 0,
          floor_price: Number(productData.floor_price) || 0,
          price: Number(productData.price) || 0,
          stock_quantity: Number(productData.stock_quantity) || 0,
          is_active: true,
        },
      ],
      created_by: vendorId,
      updated_by: vendorId,
    });

    await newProduct.save();

    return NextResponse.json(
      {
        success: true,
        message: "Product submitted for approval.",
        data: newProduct,
      },
      { status: 201 },
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

export async function DELETE(request) {
  try {
    await dbConnect();
    const authCheck = await requireAuth(request);
    if (!authCheck.success) return authCheck.errorResponse;
    const vendorId = authCheck.authData.userId;
    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids))
      return NextResponse.json(
        { success: false, message: "IDs required" },
        { status: 400 },
      );

    const result = await Product.updateMany(
      { _id: { $in: ids }, "linked_vendor_offerings.vendor_id": vendorId },
      { $pull: { linked_vendor_offerings: { vendor_id: vendorId } } },
    );

    return NextResponse.json({
      success: true,
      message: `${result.modifiedCount} products removed.`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
