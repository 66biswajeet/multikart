// import allPossibleCases from "../../../utils/customFunctions/AllPossibleCases";
// import request from "../../../utils/axiosUtils";
// import { product } from "../../../utils/axiosUtils/API";

// const ProductSubmitFunction = async (mutate, value, updateId) => {
//   console.log("📤 ProductSubmitFunction called with:", { updateId, valueName: value.name });

//   // NOTE: Removed the deletion of quantity/price for classified products
//   // Classified products can now have stock quantity at the product level

//   // Handle random related products
//   if (value["is_random_related_products"]) {
//     value["related_products"] = [];
//   }

//   // Clean up array fields - remove null, undefined, and empty string values
//   if (Array.isArray(value["categories"])) {
//     value["categories"] = value["categories"].filter(cat => cat !== null && cat !== undefined && cat !== "");
//   }
//   if (Array.isArray(value["tags"])) {
//     value["tags"] = value["tags"].filter(tag => tag !== null && tag !== undefined && tag !== "");
//   }
//   if (Array.isArray(value["attributes"])) {
//     value["attributes"] = value["attributes"].filter(attr => attr !== null && attr !== undefined && attr !== "");
//   }

//   // Clean up brand_id - remove if null, undefined, or empty
//   if (!value["brand_id"] || value["brand_id"] === "" || value["brand_id"] === null) {
//     delete value["brand_id"];
//   }

//   // Convert boolean values to numbers as expected by the backend
//   value["is_sale_enable"] = Number(value["is_sale_enable"]);
//   value["is_random_related_products"] = Number(value["is_random_related_products"]);
//   value["is_free_shipping"] = Number(value["is_free_shipping"]);
//   value["is_featured"] = Number(value["is_featured"]);
//   value["safe_checkout"] = Number(value["safe_checkout"]);
//   value["secure_checkout"] = Number(value["secure_checkout"]);
//   value["social_share"] = Number(value["social_share"]);
//   value["encourage_order"] = Number(value["encourage_order"]);
//   value["encourage_view"] = Number(value["encourage_view"]);
//   value["is_trending"] = Number(value["is_trending"]);
//   value["is_return"] = Number(value["is_return"]);
//   value["status"] = Number(value["status"]);
//   value["is_cod"] = Number(value["is_cod"]);
//   value["is_approved"] = Number(value["is_approved"]);
//   value["is_external"] = Number(value["is_external"]);
//   value["watermark"] = Number(value["watermark"]);

//   // Process variations for classified products
//   if (value["variations"] && value["combination"]) {

//     // Extract attribute IDs from combination and save to product.attributes
//     const attributeIds = value["combination"]
//       ?.map((item) => {
//         const attrId = item?.name?._id || item?.name?.id;
//         return attrId;
//       })
//       .filter(id => id); // Remove any null/undefined values

//     value["attributes"] = attributeIds;

//     // Build array of arrays of attribute value IDs from combination
//     const attributeValueIdArrays = value["combination"]?.map((item) => {
//       return item?.values || [];
//     });

//     // Generate all possible combinations of attribute values
//     const allCombinations = allPossibleCases(attributeValueIdArrays);

//     value["variations"] = value?.variations?.map((elem, ind) => {

//       return {
//         ...elem,
//         discount: elem?.discount || 0, // Keep the discount value, default to 0
//         is_licensable: Number(elem["is_licensable"]),
//         is_licensekey_auto: Number(elem["is_licensekey_auto"]),
//         status: Number(elem["status"]),
//         digital_file_ids: elem?.digital_file_ids ? elem?.digital_file_ids : null,
//         separator: elem.separator ? elem.separator : "",
//         license_key: elem.license_key ? elem.license_key : "",
//         variation_image_id: elem.variation_image_id ? elem.variation_image_id : null,
//         attribute_values: allCombinations[ind] || [],
//       };
//     });
//   }

//   // Clean up unwanted fields
//   delete value["combination"];
//   delete value["_method"]; // This will be handled by the API route

//   // Extract files and delete flags from the value object
//   const product_thumbnail_file = value["product_thumbnail"] instanceof File ? value["product_thumbnail"] : null;
//   const delete_product_thumbnail = value["delete_product_thumbnail"] || false;

//   // Additional image files
//   const size_chart_image_file = value["size_chart_image"] instanceof File ? value["size_chart_image"] : null;
//   const delete_size_chart_image = value["delete_size_chart_image"] || false;

//   const watermark_image_file = value["watermark_image"] instanceof File ? value["watermark_image"] : null;
//   const delete_watermark_image = value["delete_watermark_image"] || false;

//   const product_meta_image_file = value["product_meta_image"] instanceof File ? value["product_meta_image"] : null;
//   const delete_product_meta_image = value["delete_product_meta_image"] || false;

//   // Extract gallery files and delete list
//   const product_galleries_files = [];
//   const delete_galleries = value["delete_product_galleries"] || [];
//   if (value["product_galleries"] && Array.isArray(value["product_galleries"])) {
//     value["product_galleries"].forEach(item => {
//       if (item instanceof File) {
//         product_galleries_files.push(item);
//       }
//     });
//   }

//   // Extract variation images
//   const variation_image_files = {};
//   if (value["variations"] && Array.isArray(value["variations"])) {
//     value["variations"].forEach((variation, index) => {
//       if (variation.variation_image instanceof File) {
//         variation_image_files[`variation_image_${index}`] = variation.variation_image;
//       }
//       // Keep URL strings in the variation object
//       if (typeof variation.variation_image === 'string') {
//         // It's a URL, keep it
//       } else if (variation.variation_image instanceof File) {
//         // Remove file object from variation, will be sent separately
//         delete variation.variation_image;
//       }
//       // Set delete flag if needed
//       if (variation[`delete_variation_image`]) {
//         // Keep the delete flag
//       }
//     });
//   }

//   // Clean up File objects and delete flags from value before stringifying
//   if (value["product_thumbnail"] instanceof File) {
//     delete value["product_thumbnail"];
//   }
//   if (value["size_chart_image"] instanceof File) {
//     delete value["size_chart_image"];
//   }
//   if (value["watermark_image"] instanceof File) {
//     delete value["watermark_image"];
//   }
//   if (value["product_meta_image"] instanceof File) {
//     delete value["product_meta_image"];
//   }
//   if (value["product_galleries"]) {
//     // Keep only URL strings, remove File objects
//     value["product_galleries"] = value["product_galleries"].filter(item => typeof item === 'string');
//   }
//   delete value["delete_product_thumbnail"];
//   delete value["delete_size_chart_image"];
//   delete value["delete_watermark_image"];
//   delete value["delete_product_meta_image"];
//   delete value["delete_product_galleries"];

//   try {
//     // Create FormData
//     const formData = new FormData();

//     // Append the main data as JSON string
//     formData.append('data', JSON.stringify(value));

//     // Append product_thumbnail file if present
//     if (product_thumbnail_file) {
//       formData.append('product_thumbnail', product_thumbnail_file);
//       console.log("📎 Appending product_thumbnail:", product_thumbnail_file.name);
//     } else if (delete_product_thumbnail && updateId) {
//       formData.append('delete_product_thumbnail', 'true');
//       console.log("🗑️ Flagging product_thumbnail for deletion");
//     }

//     // Append size_chart_image file if present
//     if (size_chart_image_file) {
//       formData.append('size_chart_image', size_chart_image_file);
//       console.log("📎 Appending size_chart_image:", size_chart_image_file.name);
//     } else if (delete_size_chart_image && updateId) {
//       formData.append('delete_size_chart_image', 'true');
//       console.log("🗑️ Flagging size_chart_image for deletion");
//     }

//     // Append watermark_image file if present
//     if (watermark_image_file) {
//       formData.append('watermark_image', watermark_image_file);
//       console.log("📎 Appending watermark_image:", watermark_image_file.name);
//     } else if (delete_watermark_image && updateId) {
//       formData.append('delete_watermark_image', 'true');
//       console.log("🗑️ Flagging watermark_image for deletion");
//     }

//     // Append product_meta_image file if present
//     if (product_meta_image_file) {
//       formData.append('product_meta_image', product_meta_image_file);
//       console.log("📎 Appending product_meta_image:", product_meta_image_file.name);
//     } else if (delete_product_meta_image && updateId) {
//       formData.append('delete_product_meta_image', 'true');
//       console.log("🗑️ Flagging product_meta_image for deletion");
//     }

//     // Append product_galleries files if present
//     if (product_galleries_files && product_galleries_files.length > 0) {
//       product_galleries_files.forEach((file, index) => {
//         formData.append('product_galleries', file);
//         console.log(`📎 Appending gallery ${index}:`, file.name);
//       });
//     }

//     // Append delete_galleries list if present
//     if (delete_galleries && delete_galleries.length > 0 && updateId) {
//       formData.append('delete_galleries', JSON.stringify(delete_galleries));
//       console.log(`🗑️ Flagging ${delete_galleries.length} galleries for deletion`);
//     }

//     // Append variation images if present
//     if (variation_image_files && Object.keys(variation_image_files).length > 0) {
//       Object.keys(variation_image_files).forEach(key => {
//         const file = variation_image_files[key];
//         formData.append(key, file); // key is like 'variation_image_0'
//         console.log(`📎 Appending ${key}:`, file.name);
//       });
//     }

//     // Append delete flags for variation images
//     if (value["variations"] && updateId) {
//       value["variations"].forEach((variation, index) => {
//         if (variation[`delete_variation_image`]) {
//           formData.append(`delete_variation_image_${index}`, 'true');
//           console.log(`🗑️ Flagging variation_image_${index} for deletion`);
//         }
//       });
//     }

//     // Log FormData entries
//     console.log("📦 FormData entries:");
//     for (let pair of formData.entries()) {
//       if (pair[1] instanceof File) {
//         console.log("  ", pair[0], ": File -", pair[1].name);
//       } else if (pair[0] === 'data') {
//         console.log("  ", pair[0], ": JSON data");
//       } else {
//         console.log("  ", pair[0], ":", pair[1]);
//       }
//     }

//     let response;

//     if (updateId) {
//       // Update existing product
//       response = await request({
//         url: `${product}/${updateId}`,
//         method: 'PUT',
//         data: formData
//       });
//     } else {
//       // Create new product
//       response = await request({
//         url: product,
//         method: 'POST',
//         data: formData
//       });
//     }

//     console.log("✅ Product submission successful:", response);
//     return response;

//   } catch (error) {
//     console.error("❌ Product submission failed:", error);
//     throw error;
//   }
// };

// export default ProductSubmitFunction;

//------- new file: AllProductTable.js ---------

import request from "../../../utils/axiosUtils";
import { product } from "../../../utils/axiosUtils/API";

/**
 * New Submit Function for the Master Product (Deliverable 4).
 * This prepares the Formik data for the new Master Product API.
 */
const ProductSubmitFunction = async (mutate, value, updateId) => {
  console.log("📤 MASTER ProductSubmitFunction called with:", {
    updateId,
    valueName: value.product_name,
  });

  // --- 1. Create FormData ---
  const formData = new FormData();

  // --- 2. Extract Files and Temporary Fields ---
  const newMediaFiles = value.new_media_files || [];
  const deleteMediaUrls = value.delete_media_urls || [];

  // Create a clean copy of the data to stringify
  const dataToSubmit = { ...value };

  // Remove temporary fields from the data object before stringifying
  delete dataToSubmit.new_media_files;
  delete dataToSubmit.delete_media_urls;

  // --- 3. Append Data to FormData ---

  // Append the main data as JSON string
  // The API will parse 'data' to get all master product fields
  formData.append("data", JSON.stringify(dataToSubmit));

  // Append new files
  if (newMediaFiles.length > 0) {
    newMediaFiles.forEach((file, index) => {
      if (file instanceof File) {
        formData.append("new_media_files", file); // API will get this with .getAll()
        console.log(`📎 Appending new media file ${index}:`, file.name);
      }
    });
  }

  // Append delete list (only for updates)
  if (updateId && deleteMediaUrls.length > 0) {
    formData.append("delete_media_urls", JSON.stringify(deleteMediaUrls));
    console.log(
      `🗑️ Flagging ${deleteMediaUrls.length} media files for deletion`
    );
  }

  // --- 4. Send Request ---
  try {
    let response;

    if (updateId) {
      // Update existing master product
      console.log("📦 Sending PUT request to:", `${product}/${updateId}`);
      response = await request({
        url: `${product}/${updateId}`,
        method: "PUT",
        data: formData,
      });
    } else {
      // Create new master product
      console.log("📦 Sending POST request to:", product);
      response = await request({
        url: product,
        method: "POST",
        data: formData,
      });
    }

    console.log("✅ Master Product submission successful:", response);
    return response;
  } catch (error) {
    console.error("❌ Master Product submission failed:", error);
    throw error;
  }
};

export default ProductSubmitFunction;
