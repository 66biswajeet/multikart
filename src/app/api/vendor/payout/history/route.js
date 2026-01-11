import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import { requireAuth } from "@/utils/auth/serverAuth";

export async function GET(request) {
  try {
    await dbConnect();
    const auth = await requireAuth(request);
    if (!auth.success) return auth.errorResponse;

    const vendorId = auth.authData.userId;
    const { searchParams } = new URL(request.url);

    // Filtering parameters
    const status = searchParams.get("payout_status"); // 'Pending', 'Completed'
    const search = searchParams.get("search");

    // Filter: Invoice must exist AND order belongs to vendor
    let query = {
      vendor: vendorId,
      invoice_url: { $exists: true, $ne: null, $ne: "" },
    };

    if (status && status !== "all") {
      query.payout_status = status;
    }

    if (search) {
      query.order_number = { $regex: search, $options: "i" };
    }

    const orders = await Order.find(query).sort({ updatedAt: -1 });

    const formattedData = orders.map((order) => ({
      id: order._id,
      order_id:
        order.order_number || order._id.toString().slice(-6).toUpperCase(),
      date: order.createdAt,
      amount: order.total_amount,
      payout_status: order.payout_status || "Pending", // Default to Pending if not set
      invoice_url: order.invoice_url,
    }));

    return NextResponse.json({
      success: true,
      data: { data: formattedData, total: formattedData.length },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
