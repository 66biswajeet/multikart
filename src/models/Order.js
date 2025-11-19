import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variation_id: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    product_name: {
      type: String,
      required: true,
    },
    product_sku: {
      type: String,
      required: true,
    },
    product_image: {
      type: String,
      default: null,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
    },
    sale_price: {
      type: Number,
      required: true,
    },
    sub_total: {
      type: Number,
      required: true,
    },
    variation_options: {
      type: String,
      default: null,
    },
  },
  { _id: true }
);

const orderSchema = new mongoose.Schema(
  {
    order_number: {
      type: String,
      required: true,
      unique: true,
    },
    consumer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    store_id: {
      type: Number,
      ref: "Store",
      required: true,
    },
    items: [orderItemSchema],
    billing_address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },
    shipping_address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      default: null,
    },
    subtotal: {
      type: Number,
      required: true,
      default: 0,
    },
    shipping_total: {
      type: Number,
      default: 0,
    },
    tax_total: {
      type: Number,
      default: 0,
    },
    discount_total: {
      type: Number,
      default: 0,
    },
    coupon_code: {
      type: String,
      default: null,
    },
    coupon_discount: {
      type: Number,
      default: 0,
    },
    wallet_discount: {
      type: Number,
      default: 0,
    },
    points_discount: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
    payment_method: {
      type: String,
      required: true,
      enum: ["cash_on_delivery", "card", "wallet", "bank_transfer", "other"],
    },
    payment_status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    order_status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    delivery_description: {
      type: String,
      default: null,
    },
    delivery_interval: {
      type: String,
      default: null,
    },
    is_digital_only: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      default: null,
    },
    status: {
      type: Number,
      default: 1,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Generate unique order number
orderSchema.pre("save", async function (next) {
  if (!this.order_number) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    this.order_number = `ORD-${timestamp}-${random}`;
  }
  next();
});

// Virtual for ID
orderSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Indexes for better query performance
orderSchema.index({ consumer_id: 1, created_at: -1 });
orderSchema.index({ order_number: 1 });
orderSchema.index({ order_status: 1 });
orderSchema.index({ payment_status: 1 });

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
export default Order;
