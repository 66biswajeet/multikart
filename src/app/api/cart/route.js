import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Products";
import { requireAdmin } from "@/utils/auth/serverAuth";

/**
 * GET /api/cart - Get cart items
 * This should ideally be user-specific, but for now we'll use session/cookie
 */
export async function GET(request) {
  try {
    await dbConnect();
    // For now, we'll return empty cart
    // In production, you'd get cart from session/cookie/database
    const response = {
      items: [],
      total: 0,
      subtotal: 0,
      is_digital_only: false,
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error("❌ Cart GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch cart", error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cart - Add item to cart
 */
export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { product_id, variation_id, quantity = 1 } = body;

    if (!product_id) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    // Fetch product
    const product = await Product.findById(product_id)
      .populate("categories", "name")
      .populate("brand_id", "name");

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    // Get variation if provided
    let variation = null;
    if (variation_id && product.variations) {
      variation = product.variations.id(variation_id);
    }

    // Calculate price
    const price = variation
      ? variation.sale_price
      : product.sale_price || product.price;
    const sub_total = price * quantity;

    const cartItem = {
      product_id: product._id,
      variation_id: variation_id || null,
      product_name: product.name,
      product_sku: variation ? variation.sku : product.sku,
      product_image: product.product_thumbnail,
      quantity: quantity,
      price: variation ? variation.price : product.price,
      sale_price: price,
      sub_total: sub_total,
      variation_options: variation ? variation.variation_options : null,
    };

    // In production, save to database/session
    // For now, return the item
    return NextResponse.json({
      success: true,
      message: "Item added to cart",
      item: cartItem,
    });
  } catch (error) {
    console.error("❌ Cart POST Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to add item to cart",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/cart - Update cart item
 */
export async function PUT(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { item_id, quantity } = body;

    if (!item_id || !quantity) {
      return NextResponse.json(
        { success: false, message: "Item ID and quantity are required" },
        { status: 400 }
      );
    }

    // In production, update cart in database/session
    return NextResponse.json({
      success: true,
      message: "Cart item updated",
    });
  } catch (error) {
    console.error("❌ Cart PUT Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update cart",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cart - Remove item from cart
 */
export async function DELETE(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const item_id = searchParams.get("item_id");

    if (!item_id) {
      return NextResponse.json(
        { success: false, message: "Item ID is required" },
        { status: 400 }
      );
    }

    // In production, remove from database/session
    return NextResponse.json({
      success: true,
      message: "Item removed from cart",
    });
  } catch (error) {
    console.error("❌ Cart DELETE Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to remove item from cart",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
