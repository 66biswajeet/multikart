import tag from "../tag.json";
import { NextResponse } from "next/server";
import Tag from "@/models/Tag";
import dbConnect from "@/lib/dbConnect";

export async function PUT(request, { params }) {
  const { updateId } = params;
  try{
    await dbConnect();
    const reqData = await request.json();
    if(!reqData.name || !reqData.description){
      return NextResponse.json({message: "Name and Slug are required"}, {status: 400});
    }
    const slug = reqData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
    const existingTag = await Tag.findOne({ slug: slug, type: 'product', _id: { $ne: updateId } });
    if (existingTag) {
      return NextResponse.json({ message: "Tag with this slug already exists" }, { status: 400 });
    }
    
    const updatedTag = await Tag.findByIdAndUpdate(updateId, {
      name: reqData.name,
      slug: slug,
      description: reqData.description,
      status: reqData.status || 1,
      // created_by_id: reqData.created_by_id || "admin",
    }, { new: true });
    
    if (!updatedTag) {
      return NextResponse.json({ message: "Tag not found" }, { status: 404 });
    }
    
    return NextResponse.json({message: "Tag updated successfully", data: updatedTag}, {status: 200});
  }
  catch(err){
    console.log("Error updating tag:", err);
    return NextResponse.json({message: "Internal Server Error"}, {status: 500});
  }
}

export async function DELETE(request, { params }) {
  const { updateId } = params;
  try{
    await dbConnect();
    const deletedTag = await Tag.findByIdAndDelete(updateId);
    if (!deletedTag) {
      return NextResponse.json({ 
        success: false,
        message: "Tag not found" 
      }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      message: "Tag deleted successfully"
    }, {status: 200});
  }
  catch(err){
    console.log("Error deleting tag:", err);
    return NextResponse.json({
      success: false,
      message: "Internal Server Error"
    }, {status: 500});
  }
}

export async function GET(request, { params }) {
  const { updateId } = await params;
  try{
    await dbConnect();
    const tag = await Tag.findById(updateId); 
    if (!tag) {
      return NextResponse.json({ message: "Tag not found" }, { status: 404 });
    }
    return NextResponse.json({data: tag}, {status: 200});
  }
  catch(err){
    console.log("Error fetching tag:", err);
    return NextResponse.json({message: "Internal Server Error"}, {status: 500});
  }
}


