import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import { requireAdmin } from "@/utils/auth/serverAuth";

/**
 * GET /api/order - Get all orders with filtering, searching, sorting and pagination
 */
export async function GET(request) {
  try {
    await dbConnect();

    // Check admin authentication
    const authCheck = await requireAdmin(request);
    if (!authCheck.success) {
      return authCheck.errorResponse;
    }

    const searchParams = request?.nextUrl?.searchParams;
    const queryStatus = searchParams.get("status");
    const queryPaymentStatus = searchParams.get("payment_status");
    const querySearch = searchParams.get("search");
    const queryOrderNumber = searchParams.get("order_number");
    const queryConsumerId = searchParams.get("consumer_id");
    const queryStartDate = searchParams.get("start_date");
    const queryEndDate = searchParams.get("end_date");
    const queryPage = parseInt(searchParams.get("page")) || 1;
    const queryLimit = parseInt(searchParams.get("paginate")) || 10;

    // Build MongoDB query
    let query = {};

    // Filter by order status
    if (queryStatus) {
      query.order_status = queryStatus;
    }

    // Filter by payment status
    if (queryPaymentStatus) {
      query.payment_status = queryPaymentStatus;
    }

    // Filter by consumer
    if (queryConsumerId) {
      query.consumer_id = queryConsumerId;
    }

    // Filter by order number
    if (queryOrderNumber) {
      query.order_number = { $regex: queryOrderNumber, $options: "i" };
    }

    // Search by order number or consumer name
    if (querySearch) {
      query.$or = [
        { order_number: { $regex: querySearch, $options: "i" } },
        // Add consumer name search if populated
      ];
    }

    // Date range filter
    if (queryStartDate || queryEndDate) {
      query.created_at = {};
      if (queryStartDate) {
        query.created_at.$gte = new Date(queryStartDate);
      }
      if (queryEndDate) {
        query.created_at.$lte = new Date(queryEndDate);
      }
    }

    // Build sort options
    const sortOptions = { created_at: -1 }; // Default: newest first

    // Execute query with pagination
    const totalOrders = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate("consumer_id", "name email phone")
      .populate("billing_address")
      .populate("shipping_address")
      .populate("items.product_id", "name slug product_thumbnail")
      .sort(sortOptions)
      .skip((queryPage - 1) * queryLimit)
      .limit(queryLimit);

    const response = {
      current_page: queryPage,
      last_page: Math.ceil(totalOrders / queryLimit),
      total: totalOrders,
      per_page: queryLimit,
      data: orders,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("❌ Order GET Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch orders",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
