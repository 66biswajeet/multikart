import dbConnect from "@/lib/dbConnect";
import Category from "@/models/Category";
import { NextResponse } from "next/server";
import { uploadToCloudinary, deleteFromCloudinary } from "@/utils/cloudinary/cloudinaryService";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import path from "path";

// GET - Fetch all categories with pagination and hierarchy
export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || 'product';
    const status = searchParams.get('status');
    const parent_id = searchParams.get('parent_id');
    const include_subcategories = searchParams.get('include_subcategories') === 'true';
    
    const skip = (page - 1) * limit;
    
    // Build query
    let query = { type };
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    if (status !== null && status !== undefined && status !== '') {
      query.status = parseInt(status);
    }
    
    // Filter by parent category
    if (parent_id === 'null' || parent_id === '') {
      query.parent_id = null; // Root categories only
    } else if (parent_id) {
      query.parent_id = parent_id;
    }
    
    // Get total count for pagination
    const total = await Category.countDocuments(query);
    
    let categories;
    
    // If requesting tree structure with subcategories
    if (include_subcategories && (parent_id === 'null' || parent_id === '')) {
      // Get all categories and build tree structure
      const allCategories = await Category.find({ type }).sort({ createdAt: -1 }).lean();
      
      // Build tree structure recursively
      const buildTree = (parentId = null) => {
        return allCategories
          .filter(cat => {
            if (parentId === null) return cat.parent_id === null || cat.parent_id === undefined;
            return cat.parent_id && cat.parent_id.toString() === parentId.toString();
          })
          .map(cat => ({
            ...cat,
            subcategories: buildTree(cat._id)
          }));
      };
      
      categories = buildTree();
      
      // Apply search filter if provided
      if (search) {
        const filterBySearch = (cats) => {
          return cats.filter(cat => {
            const matchesSearch = cat.name.toLowerCase().includes(search.toLowerCase());
            const hasMatchingSubcategories = cat.subcategories && cat.subcategories.length > 0;
            
            if (hasMatchingSubcategories) {
              cat.subcategories = filterBySearch(cat.subcategories);
            }
            
            return matchesSearch || (cat.subcategories && cat.subcategories.length > 0);
          });
        };
        
        categories = filterBySearch(categories);
      }
      
      console.log('Built tree structure:', JSON.stringify(categories, null, 2));
      
    } else {
      // Regular flat list with aggregation pipeline
      let pipeline = [
        { $match: query },
        { $sort: { createdAt: -1 } }
      ];
      
      if (page && limit && !include_subcategories) {
        pipeline.push({ $skip: skip }, { $limit: limit });
      }
      
      // Populate parent category info
      pipeline.push(
        {
          $lookup: {
            from: 'categories',
            localField: 'parent_id',
            foreignField: '_id',
            as: 'parent_category'
          }
        },
        {
          $unwind: {
            path: '$parent_category',
            preserveNullAndEmptyArrays: true
          }
        }
      );
      
      // Add subcategories count
      pipeline.push(
        {
          $lookup: {
            from: 'categories',
            localField: '_id',
            foreignField: 'parent_id',
            as: 'subcategories'
          }
        },
        {
          $addFields: {
            subcategories_count: { $size: '$subcategories' }
          }
        },
        {
          $project: {
            subcategories: 0 // Remove subcategories array, keep only count for performance
          }
        }
      );
      
      categories = await Category.aggregate(pipeline);
    }
    
    return NextResponse.json({
      success: true,
      message: "Categories fetched successfully",
      data: categories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message
    }, { status: 500 });
  }
}

// POST - Create new category
export async function POST(request) {
  console.log("=== CATEGORY POST API CALLED ===");
  try {
    await dbConnect();
    
    const formData = await request.formData();
    console.log("📥 Received FormData");
    
    // Extract text fields
    const name = formData.get('name');
    const description = formData.get('description') || '';
    const type = formData.get('type') || 'product';
    const parent_id = formData.get('parent_id') || null;
    const commission_rate = formData.get('commission_rate') || null;
    const status = formData.get('status') === 'true' ? 1 : 0;
    const meta_title = formData.get('meta_title') || '';
    const meta_description = formData.get('meta_description') || '';
    
    // Extract files
    const category_image_file = formData.get('category_image');
    const category_icon_file = formData.get('category_icon');
    const category_meta_image_file = formData.get('category_meta_image');
    
    console.log('📝 Fields:', {
      name,
      description,
      type,
      parent_id,
      commission_rate,
      status
    });
    console.log('📎 Files:', {
      category_image: category_image_file && category_image_file.size > 0 ? category_image_file.name : 'none',
      category_icon: category_icon_file && category_icon_file.size > 0 ? category_icon_file.name : 'none',
      category_meta_image: category_meta_image_file && category_meta_image_file.size > 0 ? category_meta_image_file.name : 'none'
    });
    
    // Validation
    if (!name) {
      return NextResponse.json({
        success: false,
        message: "Category name is required"
      }, { status: 400 });
    }
    
    // Generate slug
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').trim('-');
    
    // Check if category with same name/slug exists
    const existingCategory = await Category.findOne({
      $or: [{ name }, { slug }],
      type
    });
    
    if (existingCategory) {
      return NextResponse.json({
        success: false,
        message: "Category with this name already exists"
      }, { status: 409 });
    }
    
    // Validate parent category if provided
    if (parent_id) {
      const parentCategory = await Category.findById(parent_id);
      if (!parentCategory) {
        return NextResponse.json({
          success: false,
          message: "Parent category not found"
        }, { status: 404 });
      }
    }
    
    // Process file uploads
    let category_image_url = null;
    let category_icon_url = null;
    let category_meta_image_url = null;

    // Create temp directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'uploads', 'temp');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    try {
      // Upload category_image
      if (category_image_file && category_image_file.size > 0) {
        console.log("☁️ Uploading category_image to Cloudinary...");
        const bytes = await category_image_file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const tempPath = join(uploadDir, `category-image-${Date.now()}${path.extname(category_image_file.name)}`);
        await writeFile(tempPath, buffer);
        
        const uploadResult = await uploadToCloudinary([{
          path: tempPath,
          originalname: category_image_file.name
        }], 'categories');
        
        category_image_url = uploadResult[0].secure_url;
        console.log("✅ Category image uploaded:", category_image_url);
      }

      // Upload category_icon
      if (category_icon_file && category_icon_file.size > 0) {
        console.log("☁️ Uploading category_icon to Cloudinary...");
        const bytes = await category_icon_file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const tempPath = join(uploadDir, `category-icon-${Date.now()}${path.extname(category_icon_file.name)}`);
        await writeFile(tempPath, buffer);
        
        const uploadResult = await uploadToCloudinary([{
          path: tempPath,
          originalname: category_icon_file.name
        }], 'categories');
        
        category_icon_url = uploadResult[0].secure_url;
        console.log("✅ Category icon uploaded:", category_icon_url);
      }

      // Upload category_meta_image
      if (category_meta_image_file && category_meta_image_file.size > 0) {
        console.log("☁️ Uploading category_meta_image to Cloudinary...");
        const bytes = await category_meta_image_file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const tempPath = join(uploadDir, `category-meta-${Date.now()}${path.extname(category_meta_image_file.name)}`);
        await writeFile(tempPath, buffer);
        
        const uploadResult = await uploadToCloudinary([{
          path: tempPath,
          originalname: category_meta_image_file.name
        }], 'categories');
        
        category_meta_image_url = uploadResult[0].secure_url;
        console.log("✅ Category meta image uploaded:", category_meta_image_url);
      }
    } catch (uploadError) {
      console.error("❌ Upload error:", uploadError);
      return NextResponse.json({
        success: false,
        message: "Failed to upload images",
        error: uploadError.message
      }, { status: 500 });
    }
    
    // Create new category
    const newCategory = new Category({
      name,
      slug,
      description,
      type,
      parent_id: parent_id || null,
      commission_rate: commission_rate || null,
      status,
      category_image: category_image_url,
      category_icon: category_icon_url,
      meta_title: meta_title || null,
      meta_description: meta_description || null,
      category_meta_image: category_meta_image_url
    });
    
    const savedCategory = await newCategory.save();
    console.log("✅ Category created successfully");
    
    // Populate parent category for response
    await savedCategory.populate('parent_id');
    
    return NextResponse.json({
      success: true,
      message: "Category created successfully",
      data: savedCategory
    }, { status: 201 });
    
  } catch (error) {
    console.log("❌ Error creating category:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to create category",
      error: error.message
    }, { status: 500 });
  }
}