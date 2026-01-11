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

    // 1. Calculate Aggregate Statistics (Total Revenue, Orders, Avg Value)
    const stats = await Order.aggregate([
      { $match: { vendor: vendorId, order_status: "Completed" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total_amount" },
          totalOrders: { $count: {} },
          avgValue: { $avg: "$total_amount" },
        },
      },
    ]);

    // 2. Monthly Revenue and Order Data for the Chart
    const monthlyData = await Order.aggregate([
      { $match: { vendor: vendorId, order_status: "Completed" } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          revenue: { $sum: "$total_amount" },
          orders: { $count: {} },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Map month numbers to names for the ApexChart
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const formattedMonths = monthlyData.map((item) => monthNames[item._id - 1]);
    const formattedRevenue = monthlyData.map((item) => item.revenue);

    const reportResponse = {
      totalRevenue: stats[0]?.totalRevenue || 0,
      totalOrders: stats[0]?.totalOrders || 0,
      avgValue: stats[0]?.avgValue?.toFixed(2) || 0,
      months: formattedMonths,
      revenue: formattedRevenue,
    };

    return NextResponse.json({
      success: true,
      data: reportResponse,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
