import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Attachment from "@/models/Attachment";
import { deleteFromCloudinary } from "@/utils/cloudinary/cloudinaryService";

// DELETE - Delete single attachment
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({
        success: false,
        message: "Attachment ID is required"
      }, { status: 400 });
    }
    
    // Find attachment
    const attachment = await Attachment.findById(id);
    
    if (!attachment) {
      return NextResponse.json({
        success: false,
        message: "Attachment not found"
      }, { status: 404 });
    }
    
    // Delete from Cloudinary
    try {
      await deleteFromCloudinary(attachment.original_url);
    } catch (cloudinaryError) {
      console.error("Cloudinary delete error:", cloudinaryError);
      // Continue with database deletion even if Cloudinary deletion fails
    }
    
    // Delete from database
    await Attachment.findByIdAndDelete(id);
    
    return NextResponse.json({
      success: true,
      message: "Attachment deleted successfully"
    });
    
  } catch (error) {
    console.error("Error deleting attachment:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to delete attachment",
      error: error.message
    }, { status: 500 });
  }
}
