import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import { requireAdmin } from "@/utils/auth/serverAuth";

/**
 * GET /api/order/[id] - Get single order by ID
 */
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const authCheck = await requireAdmin(request);
    if (!authCheck.success) {
      return authCheck.errorResponse;
    }

    const { updateId } = params;
    const order = await Order.findById(updateId)
      .populate("consumer_id", "name email phone")
      .populate("billing_address")
      .populate("shipping_address")
      .populate("items.product_id", "name slug product_thumbnail description")
      .populate("items.variation_id");

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("❌ Order GET Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch order",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/order/[id] - Update order (status, payment status, etc.)
 */
export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const authCheck = await requireAdmin(request);
    if (!authCheck.success) {
      return authCheck.errorResponse;
    }

    const { updateId } = params;
    const body = await request.json();

    const order = await Order.findById(updateId);

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Update allowed fields
    if (body.order_status) {
      order.order_status = body.order_status;
    }
    if (body.payment_status) {
      order.payment_status = body.payment_status;
    }
    if (body.notes !== undefined) {
      order.notes = body.notes;
    }
    if (body.status !== undefined) {
      order.status = body.status;
    }

    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate("consumer_id", "name email phone")
      .populate("billing_address")
      .populate("shipping_address")
      .populate("items.product_id", "name slug product_thumbnail");

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("❌ Order PUT Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update order",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/order/[id] - Delete order (soft delete)
 */
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const authCheck = await requireAdmin(request);
    if (!authCheck.success) {
      return authCheck.errorResponse;
    }

    const { updateId } = params;
    const order = await Order.findById(updateId);

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Soft delete
    order.status = 0;
    await order.save();

    return NextResponse.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("❌ Order DELETE Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete order",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
