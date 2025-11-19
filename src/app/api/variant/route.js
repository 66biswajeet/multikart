import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Variant from "@/models/Variant";
import { requireAdmin } from "@/utils/auth/serverAuth";

/**
 * GET /api/variant
 * Retrieves all variants with pagination
 */
export async function GET(request) {
  try {
    await dbConnect();
    const authCheck = await requireAdmin(request);
    if (!authCheck.success) {
      return authCheck.errorResponse;
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("paginate")) || 10;
    const searchQuery = searchParams.get("search") || "";

    let query = {};
    if (searchQuery) {
      query.variant_name = { $regex: searchQuery, $options: "i" };
    }

    const total = await Variant.countDocuments(query);
    const variants = await Variant.find(query)
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(); // Use .lean() for faster mapping

    // --- FIX 1: Transform data to match ShowTable ---
    const transformedVariants = variants.map((variant) => ({
      ...variant,
      status: variant.active ? 1 : 0, // Convert boolean 'active' to numeric 'status'
      id: variant._id.toString(), // Ensure 'id' exists
    }));

    // --- FIX 2: Return JSON in the exact format your TableWrapper expects ---
    return NextResponse.json({
      success: true,
      message: "Variants fetched successfully",
      data: {
        data: transformedVariants, // Nested data array
        current_page: page,
        per_page: limit,
        total: total,
        last_page: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("❌ GET /api/variant Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch variants",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/variant
 * Creates a new variant type (e.g., Color)
 */
export async function POST(request) {
  try {
    await dbConnect();
    const authCheck = await requireAdmin(request);
    if (!authCheck.success) {
      return authCheck.errorResponse;
    }

    const body = await request.json();
    const { variant_name, description, input_type, options } = body;

    if (!variant_name || !input_type) {
      return NextResponse.json(
        { success: false, message: "Variant name and input type are required" },
        { status: 400 }
      );
    }

    const newVariant = new Variant({
      variant_name,
      description,
      input_type,
      options: options || [], // Options can be added now or later
      created_by: authCheck?.user?.id || null, // You had this correct
    });

    await newVariant.save();

    return NextResponse.json(
      {
        success: true,
        message: "Variant created successfully",
        data: newVariant,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ POST /api/variant Error:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: "A variant with this name already exists" },
        { status: 409 } // Conflict
      );
    }
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create variant",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
