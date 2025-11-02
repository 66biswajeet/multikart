import dbConnect from "@/lib/dbConnect";
import Category from "@/models/Category";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { uploadToCloudinary, deleteFromCloudinary } from "@/utils/cloudinary/cloudinaryService";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import path from "path";

// GET - Fetch single category with subcategories
export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { updateId } = await params;
    
    if (!updateId) {
      return NextResponse.json({
        success: false,
        message: "Category ID is required"
      }, { status: 400 });
    }
    
    // Use aggregation to get category with subcategories and parent info
    const categoryPipeline = [
      { $match: { _id: new mongoose.Types.ObjectId(updateId) } },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: 'parent_id',
          as: 'subcategories'
        }
      },
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
    ];
    
    const categoryResult = await Category.aggregate(categoryPipeline);
    const category = categoryResult[0];
    
    if (!category) {
      return NextResponse.json({
        success: false,
        message: "Category not found"
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: "Category fetched successfully",
      data: category
    });
    
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch category",
      error: error.message
    }, { status: 500 });
  }
}

// PUT - Update category
export async function PUT(request, { params }) {
  console.log("=== CATEGORY PUT API CALLED ===");
  try {
    await dbConnect();
    
    const { updateId } = await params;
    const formData = await request.formData();
    console.log("📥 Received FormData for update");
    
    // Extract text fields
    const name = formData.get('name');
    const description = formData.get('description');
    const parent_id = formData.get('parent_id');
    const commission_rate = formData.get('commission_rate');
    const status = formData.get('status');
    const meta_title = formData.get('meta_title');
    const meta_description = formData.get('meta_description');
    
    // Extract files
    const category_image_file = formData.get('category_image');
    const category_icon_file = formData.get('category_icon');
    const category_meta_image_file = formData.get('category_meta_image');
    
    // Extract delete flags
    const delete_category_image = formData.get('delete_category_image') === 'true';
    const delete_category_icon = formData.get('delete_category_icon') === 'true';
    const delete_category_meta_image = formData.get('delete_category_meta_image') === 'true';
    
    console.log('📝 Fields:', {
      name,
      description,
      parent_id,
      commission_rate,
      status
    });
    console.log('📎 Files:', {
      category_image: category_image_file && category_image_file.size > 0 ? category_image_file.name : 'none',
      category_icon: category_icon_file && category_icon_file.size > 0 ? category_icon_file.name : 'none',
      category_meta_image: category_meta_image_file && category_meta_image_file.size > 0 ? category_meta_image_file.name : 'none'
    });
    console.log('🗑️ Delete flags:', { delete_category_image, delete_category_icon, delete_category_meta_image });
    
    if (!updateId) {
      return NextResponse.json({
        success: false,
        message: "Category ID is required"
      }, { status: 400 });
    }
    
    // Find existing category
    const existingCategory = await Category.findById(updateId);
    
    if (!existingCategory) {
      return NextResponse.json({
        success: false,
        message: "Category not found"
      }, { status: 404 });
    }
    
    // Validation
    if (!name) {
      return NextResponse.json({
        success: false,
        message: "Category name is required"
      }, { status: 400 });
    }
    
    // Generate new slug if name changed
    let slug = existingCategory.slug;
    if (name !== existingCategory.name) {
      slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').trim('-');
      
      // Check if another category with same name/slug exists
      const duplicateCategory = await Category.findOne({
        $or: [{ name }, { slug }],
        type: existingCategory.type,
        _id: { $ne: updateId }
      });
      
      if (duplicateCategory) {
        return NextResponse.json({
          success: false,
          message: "Another category with this name already exists"
        }, { status: 409 });
      }
    }
    
    // Validate parent category if provided
    if (parent_id && parent_id !== existingCategory.parent_id?.toString()) {
      // Check if parent exists
      const parentCategory = await Category.findById(parent_id);
      if (!parentCategory) {
        return NextResponse.json({
          success: false,
          message: "Parent category not found"
        }, { status: 404 });
      }
      
      // Prevent circular reference (category cannot be its own parent or descendant)
      if (parent_id === updateId) {
        return NextResponse.json({
          success: false,
          message: "Category cannot be its own parent"
        }, { status: 400 });
      }
      
      // Check if the new parent is not a descendant of current category
      const isDescendant = await checkIfDescendant(updateId, parent_id);
      if (isDescendant) {
        return NextResponse.json({
          success: false,
          message: "Cannot set a descendant category as parent"
        }, { status: 400 });
      }
    }
    
    // Create temp directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'uploads', 'temp');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Handle image updates
    let category_image_url = existingCategory.category_image;
    let category_icon_url = existingCategory.category_icon;
    let category_meta_image_url = existingCategory.category_meta_image;

    try {
      // Handle category_image update
      if (category_image_file && category_image_file.size > 0) {
        console.log("☁️ Uploading new category_image...");
        // Delete old image if exists
        if (existingCategory.category_image) {
          console.log("🗑️ Deleting old category_image from Cloudinary");
          await deleteFromCloudinary(existingCategory.category_image).catch(err => 
            console.error("⚠️ Error deleting old category_image:", err)
          );
        }
        // Upload new image
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
      } else if (delete_category_image && existingCategory.category_image) {
        console.log("🗑️ Deleting category_image from Cloudinary");
        await deleteFromCloudinary(existingCategory.category_image).catch(err => 
          console.error("⚠️ Error deleting category_image:", err)
        );
        category_image_url = null;
      }

      // Handle category_icon update
      if (category_icon_file && category_icon_file.size > 0) {
        console.log("☁️ Uploading new category_icon...");
        // Delete old icon if exists
        if (existingCategory.category_icon) {
          console.log("🗑️ Deleting old category_icon from Cloudinary");
          await deleteFromCloudinary(existingCategory.category_icon).catch(err => 
            console.error("⚠️ Error deleting old category_icon:", err)
          );
        }
        // Upload new icon
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
      } else if (delete_category_icon && existingCategory.category_icon) {
        console.log("🗑️ Deleting category_icon from Cloudinary");
        await deleteFromCloudinary(existingCategory.category_icon).catch(err => 
          console.error("⚠️ Error deleting category_icon:", err)
        );
        category_icon_url = null;
      }

      // Handle category_meta_image update
      if (category_meta_image_file && category_meta_image_file.size > 0) {
        console.log("☁️ Uploading new category_meta_image...");
        // Delete old meta image if exists
        if (existingCategory.category_meta_image) {
          console.log("🗑️ Deleting old category_meta_image from Cloudinary");
          await deleteFromCloudinary(existingCategory.category_meta_image).catch(err => 
            console.error("⚠️ Error deleting old category_meta_image:", err)
          );
        }
        // Upload new meta image
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
      } else if (delete_category_meta_image && existingCategory.category_meta_image) {
        console.log("🗑️ Deleting category_meta_image from Cloudinary");
        await deleteFromCloudinary(existingCategory.category_meta_image).catch(err => 
          console.error("⚠️ Error deleting category_meta_image:", err)
        );
        category_meta_image_url = null;
      }
    } catch (uploadError) {
      console.error("❌ Upload error:", uploadError);
      return NextResponse.json({
        success: false,
        message: "Failed to process images",
        error: uploadError.message
      }, { status: 500 });
    }
    
    // Update category
    const updatedCategory = await Category.findByIdAndUpdate(
      updateId,
      {
        name,
        slug,
        description: description !== undefined && description !== null ? description : existingCategory.description,
        parent_id: parent_id || null,
        commission_rate: commission_rate !== undefined && commission_rate !== null ? commission_rate : existingCategory.commission_rate,
        status: status !== undefined && status !== null ? (status === 'true' ? 1 : 0) : existingCategory.status,
        category_image: category_image_url,
        category_icon: category_icon_url,
        meta_title: meta_title !== undefined && meta_title !== null ? meta_title : existingCategory.meta_title,
        meta_description: meta_description !== undefined && meta_description !== null ? meta_description : existingCategory.meta_description,
        category_meta_image: category_meta_image_url
      },
      { new: true, runValidators: true }
    ).populate('parent_id');
    
    console.log("✅ Category updated successfully");
    
    return NextResponse.json({
      success: true,
      message: "Category updated successfully",
      data: updatedCategory
    });
    
  } catch (error) {
    console.error("❌ Error updating category:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to update category",
      error: error.message
    }, { status: 500 });
  }
}

// DELETE - Delete category
export async function DELETE(request, { params }) {
  console.log("=== CATEGORY DELETE API CALLED ===");
  try {
    await dbConnect();
    
    const { updateId } = await params;
    
    if (!updateId) {
      return NextResponse.json({
        success: false,
        message: "Category ID is required"
      }, { status: 400 });
    }
    
    // Check if category exists
    const existingCategory = await Category.findById(updateId);
    
    if (!existingCategory) {
      return NextResponse.json({
        success: false,
        message: "Category not found"
      }, { status: 404 });
    }
    
    // Check if category has subcategories
    const subcategoriesCount = await Category.countDocuments({ parent_id: updateId });
    
    if (subcategoriesCount > 0) {
      return NextResponse.json({
        success: false,
        message: "Cannot delete category that has subcategories. Please delete or move subcategories first."
      }, { status: 400 });
    }
    
    // Delete images from Cloudinary before deleting category
    const imagesToDelete = [];
    if (existingCategory.category_image) imagesToDelete.push(existingCategory.category_image);
    if (existingCategory.category_icon) imagesToDelete.push(existingCategory.category_icon);
    if (existingCategory.category_meta_image) imagesToDelete.push(existingCategory.category_meta_image);

    if (imagesToDelete.length > 0) {
      console.log(`🗑️ Deleting ${imagesToDelete.length} images from Cloudinary`);
      for (const imageUrl of imagesToDelete) {
        await deleteFromCloudinary(imageUrl).catch(err => 
          console.error("⚠️ Error deleting image from Cloudinary:", err)
        );
      }
      console.log("✅ All images deleted from Cloudinary");
    }
    
    // Delete the category
    await Category.findByIdAndDelete(updateId);
    console.log("✅ Category deleted from database");
    
    return NextResponse.json({
      success: true,
      message: "Category deleted successfully"
    });
    
  } catch (error) {
    console.error("❌ Error deleting category:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to delete category",
      error: error.message
    }, { status: 500 });
  }
}

// Helper function to check if a category is a descendant of another
async function checkIfDescendant(categoryId, potentialParentId) {
  const descendants = await getDescendants(categoryId);
  return descendants.includes(potentialParentId);
}

// Helper function to get all descendants of a category
async function getDescendants(categoryId) {
  const descendants = [];
  
  const getChildren = async (parentId) => {
    const children = await Category.find({ parent_id: parentId }).select('_id');
    for (const child of children) {
      descendants.push(child._id.toString());
      await getChildren(child._id);
    }
  };
  
  await getChildren(categoryId);
  return descendants;
}
