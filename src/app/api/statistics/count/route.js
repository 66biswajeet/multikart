import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import { requireAdmin } from "@/utils/auth/serverAuth";

export async function GET(request) {
  try {
    await dbConnect();
    const authCheck = await requireAdmin(request);
    if (!authCheck.success) {
      return authCheck.errorResponse;
    }

    const [
      total_orders,
      pending_orders,
      processing_orders,
      shipped_orders,
      delivered_orders,
      cancelled_orders,
    ] = await Promise.all([
      Order.countDocuments({ status: 1 }),
      Order.countDocuments({ order_status: "pending", status: 1 }),
      Order.countDocuments({ order_status: "processing", status: 1 }),
      Order.countDocuments({ order_status: "shipped", status: 1 }),
      Order.countDocuments({ order_status: "delivered", status: 1 }),
      Order.countDocuments({ order_status: "cancelled", status: 1 }),
    ]);

    return NextResponse.json({
      total_orders,
      pending_orders,
      processing_orders,
      shipped_orders,
      delivered_orders,
      cancelled_orders,
    });
  } catch (error) {
    console.error("❌ Statistics Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch statistics",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
