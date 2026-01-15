import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Discount from "@/models/Discount";
import { requireAuth } from "@/utils/auth/serverAuth";

/**
 * GET - Fetch all discount rules for the logged-in vendor
 */
export async function GET(request) {
  try {
    await dbConnect();
    const auth = await requireAuth(request);
    if (!auth.success) return auth.errorResponse;

    const vendorId = auth.authData.userId;

    // Get query parameters for pagination and search
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const paginate = parseInt(searchParams.get("paginate")) || 15;
    const search = searchParams.get("search") || "";
    const sortField = searchParams.get("field") || "createdAt";
    const sortOrder = searchParams.get("sort") === "asc" ? 1 : -1;

    // Build query
    const query = { vendor: vendorId };
    if (search) {
      query.rule_name = { $regex: search, $options: "i" };
    }

    // Calculate pagination
    const skip = (page - 1) * paginate;

    // Fetch discounts with pagination
    const [discounts, total] = await Promise.all([
      Discount.find(query)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(paginate)
        .lean(),
      Discount.countDocuments(query),
    ]);

    // Transform data to match table format
    const transformedData = discounts.map((discount) => ({
      ...discount,
      id: discount._id,
    }));

    // Return paginated response
    return NextResponse.json({
      success: true,
      data: {
        data: transformedData,
        total,
        current_page: page,
        per_page: paginate,
        last_page: Math.ceil(total / paginate),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST - Create a new discount rule
 */
export async function POST(request) {
  try {
    await dbConnect();
    const auth = await requireAuth(request);
    if (!auth.success) return auth.errorResponse;

    const vendorId = auth.authData.userId;
    const body = await request.json();

    // Basic Validation per wireframe requirements [cite: 1261, 1268]
    if (!body.rule_name || !body.application_type || !body.value) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const newDiscount = new Discount({
      ...body,
      vendor: vendorId,
    });

    await newDiscount.save();

    return NextResponse.json(
      {
        success: true,
        message: "Discount rule created successfully",
        data: newDiscount,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Bulk delete discount rules
 */
export async function DELETE(request) {
  try {
    await dbConnect();
    const auth = await requireAuth(request);
    if (!auth.success) return auth.errorResponse;

    const vendorId = auth.authData.userId;
    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, message: "Discount IDs are required" },
        { status: 400 }
      );
    }

    // Delete discounts that belong to this vendor
    const result = await Discount.deleteMany({
      _id: { $in: ids },
      vendor: vendorId,
    });

    return NextResponse.json({
      success: true,
      message: `${result.deletedCount} discount(s) deleted successfully`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Bulk update status of discount rules
 */
export async function PATCH(request) {
  try {
    await dbConnect();
    const auth = await requireAuth(request);
    if (!auth.success) return auth.errorResponse;

    const vendorId = auth.authData.userId;
    const { ids, status } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, message: "Discount IDs are required" },
        { status: 400 }
      );
    }

    if (typeof status !== "boolean") {
      return NextResponse.json(
        { success: false, message: "Status must be a boolean" },
        { status: 400 }
      );
    }

    // Update discounts that belong to this vendor
    const result = await Discount.updateMany(
      {
        _id: { $in: ids },
        vendor: vendorId,
      },
      { $set: { status } }
    );

    return NextResponse.json({
      success: true,
      message: `${result.modifiedCount} discount(s) updated successfully`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
