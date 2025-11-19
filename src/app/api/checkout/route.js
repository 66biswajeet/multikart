import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import Product from "@/models/Products";
import Address from "@/models/Address";
import { requireAdmin } from "@/utils/auth/serverAuth";

/**
 * POST /api/checkout - Create order from cart
 */
export async function POST(request) {
  console.log("=== CHECKOUT API CALLED ===");
  try {
    await dbConnect();

    // Check admin authentication
    const authCheck = await requireAdmin(request);
    if (!authCheck.success) {
      return authCheck.errorResponse;
    }

    const body = await request.json();
    const {
      consumer_id,
      billing_address_id,
      shipping_address_id,
      products,
      payment_method,
      delivery_description,
      delivery_interval,
      coupon_code,
      wallet_discount = 0,
      points_discount = 0,
      shipping_total = 0,
    } = body;

    // Validation
    if (!consumer_id || !billing_address_id || !payment_method) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }
    if (!products || products.length === 0) {
      return NextResponse.json(
        { success: false, message: "Cart is empty" },
        { status: 400 }
      );
    }

    // Fetch addresses
    const billingAddress = await Address.findById(billing_address_id);
    if (!billingAddress) {
      return NextResponse.json(
        { success: false, message: "Billing address not found" },
        { status: 404 }
      );
    }

    let shippingAddress = null;
    if (shipping_address_id) {
      shippingAddress = await Address.findById(shipping_address_id);
      if (!shippingAddress) {
        return NextResponse.json(
          { success: false, message: "Shipping address not found" },
          { status: 404 }
        );
      }
    }

    // Process order items and calculate totals
    const orderItems = [];
    let subtotal = 0;
    let isDigitalOnly = true;

    for (const item of products) {
      const product = await Product.findById(item.product_id);
      if (!product) {
        return NextResponse.json(
          { success: false, message: `Product ${item.product_id} not found` },
          { status: 404 }
        );
      }

      // Check stock
      const availableQty = item.variation_id
        ? product.variations.id(item.variation_id)?.quantity
        : product.quantity;

      if (availableQty < item.quantity) {
        return NextResponse.json(
          {
            success: false,
            message: `Insufficient stock for ${product.name}. Available: ${availableQty}`,
          },
          { status: 400 }
        );
      }

      // Get variation if exists
      const variation = item.variation_id
        ? product.variations.id(item.variation_id)
        : null;

      const price = variation
        ? variation.sale_price
        : product.sale_price || product.price;
      const sub_total = price * item.quantity;
      subtotal += sub_total;

      // Check if digital only
      if (product.product_type !== "digital") {
        isDigitalOnly = false;
      }

      orderItems.push({
        product_id: product._id,
        variation_id: item.variation_id || null,
        product_name: product.name,
        product_sku: variation ? variation.sku : product.sku,
        product_image: product.product_thumbnail,
        quantity: item.quantity,
        price: variation ? variation.price : product.price,
        sale_price: price,
        sub_total: sub_total,
        variation_options: variation ? variation.variation_options : null,
      });

      // Update product stock
      if (variation) {
        variation.quantity -= item.quantity;
        if (variation.quantity < 0) variation.quantity = 0;
      } else {
        product.quantity -= item.quantity;
        if (product.quantity < 0) product.quantity = 0;
      }
      await product.save();
    }

    // Calculate coupon discount (simplified - implement coupon logic)
    let coupon_discount = 0;
    if (coupon_code) {
      // TODO: Implement coupon validation and discount calculation
      // For now, set to 0
      coupon_discount = 0;
    }

    // Calculate tax (simplified - implement tax logic)
    const tax_total = subtotal * 0.1; // 10% tax (adjust as needed)

    // Calculate total
    const total =
      subtotal +
      shipping_total +
      tax_total -
      coupon_discount -
      wallet_discount -
      points_discount;

    // Create order
    const orderData = {
      consumer_id,
      store_id: products[0].store_id || 1, // Get from first product or default
      items: orderItems,
      billing_address: billing_address_id,
      shipping_address: shipping_address_id || null,
      subtotal,
      shipping_total,
      tax_total,
      discount_total: coupon_discount + wallet_discount + points_discount,
      coupon_code: coupon_code || null,
      coupon_discount,
      wallet_discount,
      points_discount,
      total,
      payment_method,
      payment_status:
        payment_method === "cash_on_delivery" ? "pending" : "pending",
      order_status: "pending",
      delivery_description: delivery_description || null,
      delivery_interval: delivery_interval || null,
      is_digital_only: isDigitalOnly,
      status: 1,
    };

    const order = new Order(orderData);
    await order.save();

    // Populate order for response
    const populatedOrder = await Order.findById(order._id)
      .populate("consumer_id", "name email phone")
      .populate("billing_address")
      .populate("shipping_address")
      .populate("items.product_id", "name slug");

    console.log("✅ Order created successfully:", order.order_number);
    return NextResponse.json(
      {
        success: true,
        message: "Order placed successfully",
        data: populatedOrder,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Checkout Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create order",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
