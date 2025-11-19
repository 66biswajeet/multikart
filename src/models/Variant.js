import mongoose from "mongoose";

/**
 * Defines a single option within a variant type.
 * E.g., For "Color", an option could be { label: "Red", value: "#FF0000" }
 * E.g., For "Pattern", an option could be { label: "Floral", value: "pattern_floral", image_url: "..." }
 */
const optionSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true, // Human-readable label (e.g., "Red", "Large") [cite: 365]
    },
    value: {
      type: String,
      required: true, // Internal value (e.g., "#FF0000", "L") [cite: 366]
    },
    image_url: {
      type: String,
      default: null, // Used for pattern swatches [cite: 347, 367]
    },
    active: {
      type: Boolean,
      default: true, // Controls if this option is selectable [cite: 368]
    },
  },
  { _id: true }
); // Use _id for options to allow easy updates/deletions

/**
 * Defines a Variant Type, which is a centralized template for product variations.
 * E.g., "Color", "Size", "Storage" [cite: 333]
 */
const variantSchema = new mongoose.Schema(
  {
    variant_name: {
      type: String,
      required: true,
      unique: true, // e.g., "Color" [cite: 335]
    },
    description: {
      type: String, // Optional description [cite: 336]
    },
    input_type: {
      type: String,
      required: true,
      enum: ["dropdown", "text", "swatch", "pattern"], // Defines UI display [cite: 339, 360]
      default: "dropdown",
    },
    options: [optionSchema], // List of available options (e.g., Red, Blue, Green) [cite: 341]
    active: {
      type: Boolean,
      default: true, // Controls if this variant type appears in product creation forms [cite: 348, 390]
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Track which admin created this [cite: 395]
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }, // [cite: 392, 393]
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for 'id'
variantSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

const Variant =
  mongoose.models.Variant || mongoose.model("Variant", variantSchema);

export default Variant;
