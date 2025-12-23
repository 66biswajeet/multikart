import mongoose from "mongoose";

const WarehouseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g., "Fulfillment Hulhumale 1"
    building_name: { type: String, required: true }, // [cite: 1802]
    floor: { type: String }, // [cite: 1802]
    unit: { type: String }, // [cite: 1802]
    island: { type: String, required: true }, // [cite: 1803]
    atoll: { type: String, required: true }, // [cite: 1803]
    country: { type: String, default: "Maldives" }, // [cite: 1803]
    contact_no: { type: String, required: true }, // [cite: 1804]
    is_fulfillment_center: { type: Boolean, default: true },
    status: { type: Number, default: 1 }, // 1 for Active, 0 for Inactive
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

// Singleton pattern to prevent duplicate model errors during build
const Warehouse =
  mongoose.models.Warehouse || mongoose.model("Warehouse", WarehouseSchema);
export default Warehouse;
