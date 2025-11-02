import dbConnect from "@/lib/dbConnect";
import Attribute from "@/models/Attributes";
import { NextResponse } from "next/server";

// GET - Fetch single attribute
export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { updateId } = await params;
    
    if (!updateId) {
      return NextResponse.json({
        success: false,
        message: "Attribute ID is required"
      }, { status: 400 });
    }
    
    const attribute = await Attribute.findById(updateId);
    
    if (!attribute) {
      return NextResponse.json({
        success: false,
        message: "Attribute not found"
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: "Attribute fetched successfully",
      data: attribute
    });
    
  } catch (error) {
    console.error("Error fetching attribute:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch attribute",
      error: error.message
    }, { status: 500 });
  }
}

// PUT - Update attribute
export async function PUT(request, { params }) {
  try {
    await dbConnect();
    
    const { updateId } = await params;
    const body = await request.json();
    const { name, style, attribute_values = [] } = body;
    
    if (!updateId) {
      return NextResponse.json({
        success: false,
        message: "Attribute ID is required"
      }, { status: 400 });
    }
    
    // Find existing attribute
    const existingAttribute = await Attribute.findById(updateId);
    
    if (!existingAttribute) {
      return NextResponse.json({
        success: false,
        message: "Attribute not found"
      }, { status: 404 });
    }
    
    // Validation
    if (!name || !style) {
      return NextResponse.json({
        success: false,
        message: "Name and style are required"
      }, { status: 400 });
    }
    
    // Generate new slug if name changed
    let slug = existingAttribute.slug;
    if (name !== existingAttribute.name) {
      slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').trim('-');
      
      // Check if another attribute with same name/slug exists
      const duplicateAttribute = await Attribute.findOne({ 
        $or: [{ name }, { slug }],
        _id: { $ne: updateId }
      });
      
      if (duplicateAttribute) {
        return NextResponse.json({
          success: false,
          message: "Another attribute with this name already exists"
        }, { status: 409 });
      }
    }
    
    // Process attribute values
    const processedValues = attribute_values.map((value, index) => ({
      value: value.value || '',
      hex_color: value.hex_color || null,
      slug: value.value ? value.value.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').trim('-') : `value-${index}`
    }));
    
    // Update attribute
    const updatedAttribute = await Attribute.findByIdAndUpdate(
      updateId,
      {
        name,
        style,
        slug,
        status: body.status !== undefined ? body.status : existingAttribute.status,
        attribute_values: processedValues
      },
      { new: true, runValidators: true }
    );
    
    return NextResponse.json({
      success: true,
      message: "Attribute updated successfully",
      data: updatedAttribute
    });
    
  } catch (error) {
    console.error("Error updating attribute:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to update attribute",
      error: error.message
    }, { status: 500 });
  }
}

// DELETE - Delete attribute
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    
    const { updateId } = await params;
    
    if (!updateId) {
      return NextResponse.json({
        success: false,
        message: "Attribute ID is required"
      }, { status: 400 });
    }
    
    // Check if attribute exists
    const existingAttribute = await Attribute.findById(updateId);
    
    if (!existingAttribute) {
      return NextResponse.json({
        success: false,
        message: "Attribute not found"
      }, { status: 404 });
    }
    
    // Delete the attribute
    await Attribute.findByIdAndDelete(updateId);
    
    return NextResponse.json({
      success: true,
      message: "Attribute deleted successfully"
    });
    
  } catch (error) {
    console.error("Error deleting attribute:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to delete attribute",
      error: error.message
    }, { status: 500 });
  }
}
