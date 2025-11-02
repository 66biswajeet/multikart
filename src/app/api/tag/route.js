import tag from "./tag.json";
import { NextResponse } from "next/server";
import Tag from "@/models/Tag";
import dbConnect from "@/lib/dbConnect";

export async function GET(request) {
  try{
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const paginate = parseInt(searchParams.get('paginate')) || 15;
    const search = searchParams.get('search') || '';
    
    const skip = (page - 1) * paginate;
    
    // Build query
    let query = { type: 'product' };
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    // Get total count
    const total = await Tag.countDocuments(query);
    
    // Fetch tags with pagination
    const tags = await Tag.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(paginate);
    
    return NextResponse.json({
        data: tags,
        current_page: page,
        per_page: paginate,
        total: total,
        last_page: Math.ceil(total / paginate)
    }, {status: 200});
  }
  catch(err){
    console.error("Error fetching tags:", err);
    return NextResponse.json({message: "Database connection error"}, {status: 500});
  }
}

export async function POST(request) {
  try{
    await dbConnect();
    const reqData = await request.json();
    if(!reqData.name || !reqData.description){
      return NextResponse.json({message: "Name and Slug are required"}, {status: 400});
    }
    const slug = reqData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
    const existingTag = await Tag.findOne({ slug: slug, type: 'product' });
    if (existingTag) {
      return NextResponse.json({ message: "Tag with this slug already exists" }, { status: 400 });
    }
    
    const newTag = new Tag({
      name: reqData.name,
      slug: slug,
      description: reqData.description,
      type: 'product',
      status: reqData.status || 1,
      // created_by_id: reqData.created_by_id || "admin",
    });
    await newTag.save();
    return NextResponse.json({message: "Tag created successfully", data: newTag}, {status: 201});
  }
  catch(err){
    console.log("Error creating tag:", err);
    return NextResponse.json({message: "Internal Server Error"}, {status: 500});
  }
}
