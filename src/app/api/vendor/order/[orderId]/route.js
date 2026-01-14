import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { orderId } = await params;
    // Get user identity from headers (set by middleware)
    const userId = request.headers.get("x-user-id");
    const isAdmin = request.headers.get("x-is-admin") === "true";

    // Fetch order and populate details
    const order = await Order.findById(orderId)
      .populate("consumer_id", "name email phone")
      .populate("items.product_id", "name slug product_thumbnail price");

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Security: If not admin, verify the vendor owns at least one item in this order
    const isOwner = order.items.some(
      (item) => item.vendor_id?.toString() === userId
    );
    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
