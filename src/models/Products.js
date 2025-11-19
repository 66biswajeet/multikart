// import mongoose from 'mongoose';
// import { string } from 'yup/lib/locale';

// // const variationGallerySchema = new mongoose.Schema({
// //   id: Number,
// //   name: String,
// //   file_name: String,
// //   mime_type: String,
// //   disk: String,
// //   created_by_id: String,
// //   asset_url: String,
// //   original_url: String
// // }, {
// //   timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
// // });

// const variationSchema = new mongoose.Schema({
//   name: String,
//   price: Number,
//   quantity: Number,
//   stock_status: {
//     type: String,
//     enum: ['in_stock', 'out_of_stock'],
//     default: 'in_stock'
//   },
//   sale_price: Number,
//   discount: {
//     type: Number,
//     default: null
//   },
//   sku: String,
//   status: {
//     type: Number,
//     default: 1
//   },
//   variation_options: {
//     type: String,
//     default: null
//   },
//   preview_url: {
//     type: String,
//     default: null
//   },
//   separator: {
//     type: String,
//     default: null
//   },
//   is_digital: {
//     type: Boolean,
//     default: null
//   },
//   is_licensable: {
//     type: Number,
//     default: 0
//   },
//   is_licensekey_auto: {
//     type: Number,
//     default: 0
//   },
//   variation_image: String,
//   product_id: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Product'
//   },
//   variation_galleries: [{
//     type : String
//   }],
//   attribute_values: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'AttributeValue'
//   }]
// }, {
//   timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
// });

// const productGallerySchema = new mongoose.Schema({
//   id: Number,
//   name: String,
//   disk: String,
//   file_name: String,
//   mime_type: String,
//   asset_url: String,
//   original_url: String
// });

// const productThumbnailSchema = new mongoose.Schema({
//   id: Number,
//   name: String,
//   disk: String,
//   file_name: String,
//   mime_type: String,
//   asset_url: String,
//   original_url: String
// });

// const reviewSchema = new mongoose.Schema({
//   // Define your review schema here based on your requirements
// });

// const productSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true
//   },
//   short_description: String,
//   description: String,
//   type: {
//     type: String,
//     enum: ['simple', 'classified'],
//     default: 'simple'
//   },
//   unit: String,
//   weight: Number,
//   quantity: Number,
//   price: Number,
//   sale_price: Number,
//   discount: {
//     type: Number,
//     default: null
//   },
//   is_featured: {
//     type: Number,
//     default: 0
//   },
//   shipping_days: {
//     type: Number,
//     default: null
//   },
//   is_cod: {
//     type: Number,
//     default: 0
//   },
//   is_free_shipping: {
//     type: Number,
//     default: 0
//   },
//   is_sale_enable: {
//     type: Number,
//     default: 0
//   },
//   is_return: {
//     type: Number,
//     default: 0
//   },
//   is_trending: {
//     type: Number,
//     default: 0
//   },
//   is_approved: {
//     type: Number,
//     default: 0
//   },
//   is_external: {
//     type: Number,
//     default: 0
//   },
//   external_url: {
//     type: String,
//     default: null
//   },
//   external_button_text: {
//     type: String,
//     default: null
//   },
//   sale_starts_at: {
//     type: Date,
//     default: null
//   },
//   sale_expired_at: {
//     type: Date,
//     default: null
//   },
//   sku: {
//     type: String,
//     required: true
//   },
//   is_random_related_products: {
//     type: Number,
//     default: 0
//   },
//   stock_status: {
//     type: String,
//     enum: ['in_stock', 'out_of_stock'],
//     default: 'in_stock'
//   },
//   meta_title: String,
//   meta_description: String,
//   product_thumbnail: String,
//   product_meta_image: String,
//   size_chart_image: {
//     type: String,
//     default: null
//   },
//   estimated_delivery_text: String,
//   return_policy_text: String,
//   safe_checkout: {
//     type: Number,
//     default: 0
//   },
//   secure_checkout: {
//     type: Number,
//     default: 0
//   },
//   social_share: {
//     type: Number,
//     default: 0
//   },
//   encourage_order: {
//     type: Number,
//     default: 0
//   },
//   encourage_view: {
//     type: Number,
//     default: 0
//   },
//   slug: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   status: {
//     type: Number,
//     default: 1
//   },
//   store_id: {
//     type: Number,
//     ref: 'Store',
//     required: true
//   },
//   created_by: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   },
//   tax_id: {
//     type: Number,
//     default: 1
//   },
//   preview_type: {
//     type: String,
//     default: 'url'
//   },
//   product_type: {
//     type: String,
//     enum: ['physical', 'digital'],
//     default: 'physical'
//   },
//   separator: {
//     type: String,
//     default: null
//   },
//   is_licensable: {
//     type: Number,
//     default: 0
//   },
//   license_type: {
//     type: String,
//     default: null
//   },
//   preview_url: {
//     type: String,
//     default: null
//   },
//   watermark: {
//     type: Number,
//     default: 0
//   },
//   watermark_image: {
//     type: String,
//     default: null
//   },
//   watermark_position: {
//     type: String,
//     default: 'center'
//   },
//   brand_id: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Brand'
//   },
//   wholesale_price_type: {
//     type: String,
//     default: null
//   },
//   is_licensekey_auto: {
//     type: Number,
//     default: 0
//   },
//   preview_audio_file_id: {
//     type: Number,
//     default: null
//   },
//   preview_video_file_id: {
//     type: Number,
//     default: null
//   },
//   orders_count: {
//     type: Number,
//     default: 0
//   },
//   reviews_count: {
//     type: Number,
//     default: 0
//   },
//   can_review: {
//     type: Boolean,
//     default: false
//   },
//   order_amount: {
//     type: Number,
//     default: 0
//   },
//   is_wishlist: {
//     type: Boolean,
//     default: false
//   },
//   rating_count: {
//     type: Number,
//     default: null
//   },
//   review_ratings: [Number],

//   // References to other collections
//   categories: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Category'
//   }],
//   tags: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Tag'
//   }],
//   attributes: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Attribute'
//   }],
//   related_products: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Product'
//   }],
//   cross_sell_products: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Product'
//   }],

//   // Embedded subdocuments
//   variations: [variationSchema],
//   product_thumbnail: {
//     type : String
//   },
//   product_galleries: [{
//     type : String
//   }],
//   wholesales: [{
//     min_qty: {
//       type: Number,
//       required: true
//     },
//     max_qty: {
//       type: Number,
//       required: true
//     },
//     value: {
//       type: Number,
//       required: true
//     }
//   }],
//   reviews: [reviewSchema]
// }, {
//   timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
// });

// // Virtual for similar_products (could be populated based on categories/tags)
// productSchema.virtual('similar_products', {
//   ref: 'Product',
//   localField: 'categories',
//   foreignField: 'categories'
// });

// // Virtual for cross_products
// productSchema.virtual('cross_products', {
//   ref: 'Product',
//   localField: 'cross_sell_products',
//   foreignField: 'id'
// });

// // Add virtual for ID (to match frontend expectations)
// productSchema.virtual('id').get(function() {
//   return this._id.toHexString();
// });

// // Ensure virtuals are included in JSON output
// productSchema.set('toObject', { virtuals: true });
// productSchema.set('toJSON', { virtuals: true });

// // Add indexing for better performance
// productSchema.index({ slug: 1 });
// productSchema.index({ sku: 1 });
// productSchema.index({ store_id: 1 });
// productSchema.index({ status: 1 });
// productSchema.index({ 'categories': 1 });
// productSchema.index({ brand_id: 1 });

// const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
// export default Product;

//----------------------------------------------------//

import mongoose from "mongoose";

/**
 * Sub-schema for vendor-specific offerings linked to this master product.
 * Based on the example in Deliverable 4 [cite: 664-694].
 */
const vendorOfferingSchema = new mongoose.Schema(
  {
    vendor_product_id: {
      type: mongoose.Schema.Types.ObjectId, // Vendor's internal product ID
      required: true,
    },
    vendor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming this links to the vendor's user account
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "MVR",
    },
    stock_quantity: {
      type: Number,
      required: true,
    },
    condition: {
      type: String,
      enum: ["new", "refurbished"],
      default: "new",
    },
    shipping_info: {
      type: String,
    },
    is_active: {
      type: Boolean,
      default: true, // Vendor's offering can be active or inactive
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

/**
 * Sub-schema for standardized product policies [cite: 606-629].
 */
const productPolicySchema = new mongoose.Schema(
  {
    about_this_item: { type: String },
    key_features: { type: [String] },
    return_policy: { type: String },
    refund_policy: { type: String },
    warranty_info: { type: String },
  },
  { _id: false }
);

/**
 * Sub-schema for storing selected attribute values [cite: 632-638].
 * E.g., { attribute_id: '... (Brand)', value: 'Apple' }
 */
const attributeValueSchema = new mongoose.Schema(
  {
    attribute_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attribute",
    },
    value: {
      type: String,
    },
  },
  { _id: false }
);

/**
 * Sub-schema for storing defined variant options [cite: 641-646].
 * E.g., { variant_id: '... (Color)', options: ['Red', 'Blue', 'Green'] }
 */
const variantValueSchema = new mongoose.Schema(
  {
    variant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Variant",
    },
    options: {
      type: [String],
    },
  },
  { _id: false }
);

/**
 * Sub-schema for standardized media assets [cite: 648-653].
 */
const mediaSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["image", "video"],
      default: "image",
    },
    url: {
      type: String,
      required: true,
    },
    is_primary: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

/**
 * Main Master Product Schema.
 * This replaces the old vendor-centric product schema.
 * It is managed by Admins and serves as the universal reference.
 */
const masterProductSchema = new mongoose.Schema(
  {
    master_product_code: {
      // This is the UPID
      type: String,
      required: true,
      unique: true,
    },
    product_name: {
      // Standardized name
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    category_id: {
      // Link to the single leaf category
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    brand_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
    },
    model_number: {
      // Optional internal model/SKU
      type: String,
    },
    status: {
      // Admin-controlled status for the master product
      type: String,
      enum: ["active", "inactive", "archived"],
      default: "inactive",
    },

    // Standardized Content (from Deliverable 4 plan)
    product_policies: productPolicySchema,
    internal_notes: { type: String }, // Admin-only notes

    // SEO Metadata (from Deliverable 4 plan)
    seo_meta_title: { type: String },
    seo_meta_description: { type: String },

    // Taxonomy Links
    attribute_values: [attributeValueSchema], // Selected attributes (e.g., Brand: Apple)
    variant_values: [variantValueSchema], // Defined variants (e.g., Colors: Red, Blue)

    // Media Assets
    media: [mediaSchema],

    // Links to Vendor Offerings
    linked_vendor_offerings: [vendorOfferingSchema],

    // Audit Fields
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Add virtual for ID
masterProductSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Ensure virtuals are included in JSON output
masterProductSchema.set("toObject", { virtuals: true });
masterProductSchema.set("toJSON", { virtuals: true });

// Add indexing for better performance
masterProductSchema.index({ slug: 1 });
masterProductSchema.index({ master_product_code: 1 });
masterProductSchema.index({ category_id: 1 });
masterProductSchema.index({ brand_id: 1 });
masterProductSchema.index({ status: 1 });

const Product =
  mongoose.models.Product || mongoose.model("Product", masterProductSchema);
export default Product; 
