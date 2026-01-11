import mongoose from "mongoose";

const discountSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rule_name: {
      type: String,
      required: true,
    },
    application_type: {
      type: String,
      enum: ["All", "Category", "Product"],
      required: true,
    },
    apply_on: {
      // Stores Category ID or Product ID based on application_type
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    discount_type: {
      type: String,
      enum: ["Percentage", "Amount"],
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    start_date: {
      type: Date,
      required: true,
    },
    end_date: {
      type: Date,
      required: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Discount =
  mongoose.models.Discount || mongoose.model("Discount", discountSchema);

export default Discount;
