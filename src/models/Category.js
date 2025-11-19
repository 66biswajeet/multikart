import mongoose from "mongoose";

// Define mapping schemas based on Deliverable 3 requirements
const attributeMappingSchema = new mongoose.Schema(
  {
    attribute_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attribute",
      required: true,
    },
    is_mandatory: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const variantMappingSchema = new mongoose.Schema(
  {
    variant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Variant",
      required: true,
    },
    is_mandatory: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const categorySchema = new mongoose.Schema(
  {
    name: {
      // Internal name [cite: 59]
      type: String,
      required: true,
    },
    display_name: {
      // Customer-facing name [cite: 59]
      type: String,
      required: true,
    },
    category_code: {
      // Auto-generated code (e.g., CAT0001) [cite: 58]
      type: String,
      unique: true,
      sparse: true, // Allows multiple nulls before code is set
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    description: String,
    category_image: {
      type: String,
      default: null,
    },
    category_icon: {
      type: String,
      default: null,
    },
    status: {
      // Active/Inactive toggle [cite: 493]
      type: Number,
      default: 1, // 1 = Enabled
    },
    meta_title: String,
    meta_description: String,
    category_meta_image: {
      type: String,
      default: null,
    },
    type: {
      type: String,
      enum: ["product", "post"],
      default: "product",
    },
    commission_rate: {
      type: Number,
      default: null,
    },
    parent_id: {
      // [cite: 485]
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    level: {
      // Hierarchy level [cite: 60]
      type: Number,
      default: 0,
    },
    path: {
      // Stores names for breadcrumbs [cite: 60, 546]
      type: [String],
      default: [],
    },
    is_leaf: {
      // True = products can be linked [cite: 60, 504, 539]
      type: Boolean,
      default: true,
    },
    children_count: {
      type: Number,
      default: 0,
    },
    product_count: {
      // [cite: 61, 494]
      type: Number,
      default: 0,
    },
    has_active_products: {
      // [cite: 495, 545]
      type: Boolean,
      default: false,
    },
    // Mappings from Deliverable 3 [cite: 62, 547, 574]
    attribute_mapping: [attributeMappingSchema],
    variant_mapping: [variantMappingSchema],
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    blogs_count: {
      // Kept from original schema
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Virtual for subcategories
categorySchema.virtual("subcategories", {
  ref: "Category",
  localField: "_id",
  foreignField: "parent_id",
});

// Pre-save hook to manage hierarchy, paths, and parent status
categorySchema.pre("save", async function (next) {
  // Generate category_code (e.g., CAT0001) [cite: 58]
  if (this.isNew && !this.category_code) {
    try {
      // Find the last category based on a numeric part of a code if possible, or just count
      const lastCategory = await this.constructor
        .findOne()
        .sort({ created_at: -1 });
      let nextId = 1;
      if (lastCategory && lastCategory.category_code) {
        const lastIdNum = parseInt(
          lastCategory.category_code.replace("CAT", ""),
          10
        );
        if (!isNaN(lastIdNum)) {
          nextId = lastIdNum + 1;
        } else {
          // Fallback if code is not numeric
          const count = await this.constructor.countDocuments();
          nextId = count + 1;
        }
      } else {
        const count = await this.constructor.countDocuments();
        nextId = count + 1;
      }
      this.category_code = `CAT${nextId.toString().padStart(4, "0")}`;
    } catch (error) {
      console.error("Error generating category_code:", error);
      // Don't block save, but log error
    }
  }

  // Manage hierarchy path and parent 'is_leaf' status
  if (this.isModified("parent_id") || this.isNew) {
    if (this.parent_id) {
      try {
        const parent = await this.constructor.findById(this.parent_id);
        if (parent) {
          this.level = parent.level + 1; // [cite: 535]
          this.path = [...parent.path, this.display_name]; // [cite: 546]

          // Update parent to no longer be a leaf [cite: 504, 614]
          if (parent.is_leaf) {
            parent.is_leaf = false;
          }
          parent.children_count = await this.constructor.countDocuments({
            parent_id: this.parent_id,
          });
          await parent.save();
        } else {
          // Parent not found, treat as root
          this.level = 0;
          this.path = [this.display_name];
          this.parent_id = null;
        }
      } catch (error) {
        console.error("Error updating parent category:", error);
        next(error);
      }
    } else {
      // Root level category
      this.level = 0;
      this.path = [this.display_name];
    }
  } else if (this.isModified("display_name") && this.path.length > 0) {
    // If display_name changed, update path
    // This is complex and can require updating all children paths.
    // For now, just update this item's path-ending.
    // A full child-path update would require a more complex operation.
    if (this.level === 0) {
      this.path = [this.display_name];
    } else if (this.parent_id) {
      const parent = await this.constructor.findById(this.parent_id);
      if (parent) {
        this.path = [...parent.path, this.display_name];
      }
    }
    // TODO: Add a background job to update paths of all children
  }

  next();
});

categorySchema.set("toObject", { virtuals: true });
categorySchema.set("toJSON", { virtuals: true });

const Category =
  mongoose.models.Category || mongoose.model("Category", categorySchema);
export default Category;
