import { NextResponse } from "next/server";
import user from "./user.json";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Role from "@/models/Role";
import bcrypt from "bcryptjs";


export async function GET(request) {
 try{
  await dbConnect();
   const searchParams = request?.nextUrl?.searchParams;
  const queryCategory = searchParams.get("category");
  const querySortBy = searchParams.get("sortBy");
  const querySearch = searchParams.get("search");
  const queryTag = searchParams.get("tag");
  const queryIds = searchParams.get("ids");

  const queryPage = parseInt(searchParams.get("page")) || 1; // default to page 1
  const queryLimit = parseInt(searchParams.get("paginate")) || 10; // default to 10 items per page

  let users = await User.find().populate('role').lean();

  // Filtering logic
  if (querySortBy || queryCategory || querySearch || queryTag || queryIds) {
    // Filter by category
    if (queryCategory) {
      users = users.filter((post) => post?.categories?.some((category) => queryCategory.split(",").includes(category.slug)));
    }

    // Filter by tag
    if (queryTag) {
      users = users.filter((post) => post?.tags?.some((tag) => queryTag.split(",").includes(tag.slug)));
    }

    if (queryIds) {
      users = users.filter((product) => queryIds.split(",").includes(product?.id?.toString()));
    }

    // Search filter by title
    if (querySearch) {
      users = users.filter((post) => post.title.toLowerCase().includes(querySearch.toLowerCase()));
    }

    // Sort logic
    if (querySortBy === "asc") {
      users = users.sort((a, b) => a.id - b.id);
    } else if (querySortBy === "desc") {
      users = users.sort((a, b) => b.id - a.id);
    } else if (querySortBy === "a-z") {
      users = users.sort((a, b) => a.title.localeCompare(b.title));
    } else if (querySortBy === "z-a") {
      users = users.sort((a, b) => b.title.localeCompare(a.title));
    } else if (querySortBy === "newest") {
      users = users.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (querySortBy === "oldest") {
      users = users.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }
  }

  // users = users?.length ? users : user?.data;

  // Implementing pagination
  const totalusers = users.length;
  const startIndex = (queryPage - 1) * queryLimit;
  const endIndex = startIndex + queryLimit;
  const paginatedusers = users.slice(startIndex, endIndex);

  const response = {
    current_page: queryPage,
    last_page: Math.ceil(totalusers / queryLimit),
    total: totalusers,
    per_page: queryLimit,
    data: paginatedusers, // the users for the current page
  };

  return NextResponse.json(response);

 }
 catch(error){
  console.log(error);
  return NextResponse.json({message:"Internal Server Error"}, {status:500});
  }
}

export async function POST(request) {
  console.log("=== USER POST API CALLED ===");
  try{
    await dbConnect();
    
    // Get user info from middleware headers
    const isAdmin = request.headers.get('x-is-admin') === 'true';
    const adminUserId = request.headers.get('x-user-id');
    
    console.log("Admin check:", { isAdmin, adminUserId });
    
    // Check if user is admin
    if (!isAdmin) {
      return NextResponse.json({
        success: false,
        message: "Access denied. Only administrators can create users.",
        data: null
      }, { status: 403 });
    }

    const reqData = await request.json();
    console.log("Request data:", reqData);
    const { name, email, phone, password, role, status, country_code, address, city, state, country, zip } = reqData;

    // Validate required fields
    if (!name || !email || !phone || !password) {
      return NextResponse.json({
        success: false,
        message: "Please provide all required fields (name, email, phone, password)",
        data: null
      }, { status: 400 });
    }
    let finalAddress = "";
    if(address && typeof address !== 'string'){
      address.map((addr)=>{
        finalAddress += addr;
      })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: reqData?.email });
    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: "User with this email already exists",
        data: null
      }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      email,
      phone: Number(phone),
      password: hashedPassword,
      country_code: country_code || "91",
      status: status !== undefined ? Number(status) : 1,
      created_by: adminUserId,
      role,
      finalAddress,
      city,
      state,
      country,
      zip,
      isAdmin: false, // Only existing admins can create users, new users are not admin by default
      created_at: new Date(),
    });

    const savedUser = await newUser.save();

    // Remove password from response
    const { password: _, ...userResponse } = savedUser.toObject();

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      data: userResponse
    }, { status: 201 });

  }
  catch(error){
    console.log("Error creating user:", error);
    return NextResponse.json({
      success: false,
      message: "Internal Server Error",
      data: null
    }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await dbConnect();
    
    // Get user info from middleware headers
    const isAdmin = request.headers.get('x-is-admin') === 'true';
    
    if (!isAdmin) {
      return NextResponse.json({
        success: false,
        message: "Access denied. Only administrators can delete users.",
        data: null
      }, { status: 403 });
    }

    const reqData = await request.json();
    const { ids } = reqData;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Please provide user IDs to delete",
        data: null
      }, { status: 400 });
    }

    // Prevent deletion of admin users (safety check)
    const adminUsers = await User.find({ 
      _id: { $in: ids }, 
      isAdmin: true 
    });

    if (adminUsers.length > 0) {
      return NextResponse.json({
        success: false,
        message: "Cannot delete admin users",
        data: null
      }, { status: 400 });
    }

    // Delete users
    const result = await User.deleteMany({ 
      _id: { $in: ids },
      isAdmin: { $ne: true } // Extra safety check
    });

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} user(s)`,
      data: { deletedCount: result.deletedCount }
    });

  } catch (error) {
    console.log("Error deleting users:", error);
    return NextResponse.json({
      success: false,
      message: "Internal Server Error",
      data: null
    }, { status: 500 });
  }
}