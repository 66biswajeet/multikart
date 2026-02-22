import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import StoreCustomization from "@/models/StoreCustomization";
import { requireAdmin } from "@/utils/auth/serverAuth";
import { writeFile } from "fs/promises";
import path from "path";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";

export async function GET(request) {
  try {
    await dbConnect();

    // Get the single store customization record
    let customization = await StoreCustomization.findOne();

    const data = customization || {
      carousel_images: [],
      site_logo: "",
      site_logo_dark: "",
      favicon: "",
      hero_title: "Welcome to Our Store",
      hero_subtitle: "Discover amazing products",
      banners: [],
    };

    // Return with CORS headers
    return NextResponse.json(
      {
        success: true,
        data: data,
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      },
    );
  } catch (error) {
    console.error("❌ Get store customization error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch store customization",
        error: error.message,
      },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      },
    );
  }
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function POST(request) {
  try {
    await dbConnect();

    // Check for admin authentication
    const authCheck = await requireAdmin(request);
    if (!authCheck.success) {
      return authCheck.errorResponse;
    }

    const formData = await request.formData();

    // Process uploaded files
    const uploadedFiles = {};
    const fileFields = [
      "carousel_image_1",
      "carousel_image_2",
      "carousel_image_3",
      "carousel_image_4",
      "carousel_image_5",
      "site_logo",
      "site_logo_dark",
      "favicon",
      "banner_image_1",
      "banner_image_2",
    ];
    // If Cloudinary credentials present, configure cloudinary
    const useCloudinary =
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET;

    if (useCloudinary) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
      });
    }

    // Ensure upload directory exists for local fallback
    const uploadDir = path.join(process.cwd(), "public", "uploads", "store");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // helper: upload buffer to cloudinary and return secure_url
    const uploadToCloudinary = async (buffer, originalName, mimeType) => {
      try {
        const base64 = buffer.toString("base64");
        const dataUri = `data:${mimeType || "application/octet-stream"};base64,${base64}`;
        const publicId = `store/${Date.now()}-${originalName.replace(/\s+/g, "-")}`;
        const res = await cloudinary.uploader.upload(dataUri, {
          public_id: publicId,
          folder: "store",
          overwrite: true,
        });
        return res.secure_url || res.url;
      } catch (err) {
        console.error("❌ Cloudinary upload failed:", err);
        return null;
      }
    };

    for (const field of fileFields) {
      const file = formData.get(field);
      if (file && file instanceof File && file.size > 0) {
        try {
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);

          // Create unique filename
          const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;

          if (useCloudinary) {
            const cloudUrl = await uploadToCloudinary(
              buffer,
              file.name,
              file.type,
            );
            if (cloudUrl) {
              uploadedFiles[field] = cloudUrl;
              continue;
            }
            // if cloud upload failed, fall back to local disk
          }

          const uploadPath = path.join(uploadDir, fileName);
          await writeFile(uploadPath, buffer);
          uploadedFiles[field] = `/uploads/store/${fileName}`;
        } catch (fileError) {
          console.error(`❌ Error uploading ${field}:`, fileError);
        }
      }
    }

    // Get or create customization record
    let customization = await StoreCustomization.findOne();

    const updateData = {};

    // If Cloudinary is enabled, convert any existing local file paths provided as strings
    // (e.g., "/uploads/store/xxx" or "/assets/images/...") into Cloudinary URLs by
    // reading the file from disk and uploading it.
    const uploadLocalPathToCloud = async (pathStr) => {
      try {
        if (!useCloudinary) return null;
        if (!pathStr || typeof pathStr !== "string") return null;
        // Only attempt for local paths (starting with /uploads or /assets)
        if (!pathStr.startsWith("/uploads") && !pathStr.startsWith("/assets"))
          return null;
        const localFilePath = path.join(
          process.cwd(),
          "public",
          pathStr.replace(/^\//, ""),
        );
        if (!fs.existsSync(localFilePath)) return null;
        const buffer = await fs.promises.readFile(localFilePath);
        const cloudUrl = await uploadToCloudinary(
          buffer,
          path.basename(localFilePath),
          "application/octet-stream",
        );
        return cloudUrl;
      } catch (err) {
        console.error("❌ uploadLocalPathToCloud failed for", pathStr, err);
        return null;
      }
    };

    // Handle carousel images
    const carouselImages = [];
    for (let i = 1; i <= 5; i++) {
      const imageField = `carousel_image_${i}`;
      const linkField = `carousel_image_${i}_link`;

      let imageValue = uploadedFiles[imageField] || formData.get(imageField);
      // If a string local path was provided and Cloudinary is enabled, try to upload it
      if (typeof imageValue === "string" && useCloudinary) {
        const maybeCloud = await uploadLocalPathToCloud(imageValue);
        if (maybeCloud) {
          imageValue = maybeCloud;
        }
      }

      if (imageValue) {
        carouselImages.push({
          image: imageValue,
          link: formData.get(linkField) || "",
        });
      }
    }

    if (carouselImages.length > 0) {
      updateData.carousel_images = carouselImages;
    }

    // Handle logos
    if (uploadedFiles.site_logo) {
      updateData.site_logo = uploadedFiles.site_logo;
    } else if (formData.get("site_logo")) {
      let logoVal = formData.get("site_logo");
      if (typeof logoVal === "string" && useCloudinary) {
        const maybeCloud = await uploadLocalPathToCloud(logoVal);
        updateData.site_logo = maybeCloud || logoVal;
      } else {
        updateData.site_logo = logoVal;
      }
    }

    if (uploadedFiles.site_logo_dark) {
      updateData.site_logo_dark = uploadedFiles.site_logo_dark;
    } else if (formData.get("site_logo_dark")) {
      let logoDarkVal = formData.get("site_logo_dark");
      if (typeof logoDarkVal === "string" && useCloudinary) {
        const maybeCloud = await uploadLocalPathToCloud(logoDarkVal);
        updateData.site_logo_dark = maybeCloud || logoDarkVal;
      } else {
        updateData.site_logo_dark = logoDarkVal;
      }
    }

    if (uploadedFiles.favicon) {
      updateData.favicon = uploadedFiles.favicon;
    } else if (formData.get("favicon")) {
      let faviconVal = formData.get("favicon");
      if (typeof faviconVal === "string" && useCloudinary) {
        const maybeCloud = await uploadLocalPathToCloud(faviconVal);
        updateData.favicon = maybeCloud || faviconVal;
      } else {
        updateData.favicon = faviconVal;
      }
    }

    // Handle text content
    const heroTitle = formData.get("hero_title");
    const heroSubtitle = formData.get("hero_subtitle");

    if (heroTitle) {
      updateData.hero_title = heroTitle;
    }
    if (heroSubtitle) {
      updateData.hero_subtitle = heroSubtitle;
    }

    // Handle banners
    const banners = [];
    for (let i = 1; i <= 2; i++) {
      const imageField = `banner_image_${i}`;
      const linkField = `banner_image_${i}_link`;

      const imageValue = uploadedFiles[imageField] || formData.get(imageField);
      if (imageValue) {
        banners.push({
          image: imageValue,
          link: formData.get(linkField) || "",
        });
      }
    }

    if (banners.length > 0) {
      updateData.banners = banners;
    }

    if (!customization) {
      customization = await StoreCustomization.create(updateData);
    } else {
      customization = await StoreCustomization.findByIdAndUpdate(
        customization._id,
        updateData,
        { new: true, runValidators: true },
      );
    }

    console.log("✅ Store customization saved successfully");

    return NextResponse.json(
      {
        success: true,
        message: "Store customization saved successfully",
        data: customization,
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      },
    );
  } catch (error) {
    console.error("❌ Update store customization error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update store customization",
        error: error.message,
      },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      },
    );
  }
}
