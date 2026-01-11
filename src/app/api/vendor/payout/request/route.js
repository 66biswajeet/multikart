import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import { requireAuth } from "@/utils/auth/serverAuth";

// 1. GET: Fetch completed orders without invoices
export async function GET(request) {
  try {
    await dbConnect();
    const auth = await requireAuth(request);
    if (!auth.success) return auth.errorResponse;

    const vendorId = auth.authData.userId;

    // Filter: Status is Completed AND invoice_url is missing or null
    const orders = await Order.find({
      vendor: vendorId,
      order_status: "Completed",
      $or: [
        { invoice_url: { $exists: false } },
        { invoice_url: null },
        { invoice_url: "" },
      ],
    }).sort({ createdAt: -1 });

    const formattedOrders = orders.map((order) => ({
      id: order._id,
      order_id:
        order.order_number || order._id.toString().slice(-6).toUpperCase(),
      date: order.createdAt,
      amount: order.total_amount,
      customer: order.customer_name || "Guest",
      payment_method: order.payment_method,
    }));

    return NextResponse.json({
      success: true,
      data: { data: formattedOrders, total: formattedOrders.length },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// 2. PUT: Upload invoice for a specific order
export async function PUT(request) {
  try {
    await dbConnect();
    const auth = await requireAuth(request);
    if (!auth.success) return auth.errorResponse;

    const body = await request.json();
    const { order_id, invoice_url } = body;

    if (!order_id || !invoice_url) {
      return NextResponse.json(
        { success: false, message: "Missing Data" },
        { status: 400 }
      );
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      order_id,
      { $set: { invoice_url: invoice_url } },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Invoice uploaded successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
