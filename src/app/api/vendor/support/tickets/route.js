import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import SupportTicket from "@/models/SupportTicket";
import { requireAuth } from "@/utils/auth/serverAuth";

// 1. GET: Fetch all tickets for the vendor
export async function GET(request) {
  try {
    await dbConnect();
    const auth = await requireAuth(request);
    if (!auth.success) return auth.errorResponse;

    const vendorId = auth.authData.userId;

    const tickets = await SupportTicket.find({ vendor: vendorId }).sort({
      createdAt: -1,
    });

    return NextResponse.json({
      success: true,
      data: { data: tickets, total: tickets.length },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// 2. POST: Create a new support ticket
export async function POST(request) {
  try {
    await dbConnect();
    const auth = await requireAuth(request);
    if (!auth.success) return auth.errorResponse;

    const vendorId = auth.authData.userId;
    const body = await request.json();

    const newTicket = await SupportTicket.create({
      vendor: vendorId,
      subject: body.subject,
      category: body.category,
      message: body.message,
    });

    return NextResponse.json({
      success: true,
      message: "Ticket created successfully",
      data: newTicket,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
