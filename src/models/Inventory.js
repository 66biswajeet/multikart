import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },
    stock: { type: Number, required: true, default: 0 },
    low_stock_threshold: { type: Number, default: 10 }, // Used for "Low Stock" filter
  },
  { timestamps: true }
);

const Inventory =
  mongoose.models.Inventory || mongoose.model("Inventory", inventorySchema);
export default Inventory;
