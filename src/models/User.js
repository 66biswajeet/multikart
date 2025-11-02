import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    country_code: { type: String, required: false },
    phone: { type: Number, required: true },
    system_reserve: { type: String, default: "0" },
    status: { type: Number, default: 1 },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    email_verified_at: { type: Date, default: null },
    created_at: { type: Date, default: Date.now },
    orders_count: { type: Number, default: 0 },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      default: null
    },
    profile_image: { type: String, default: null },
    wallet: {
      id: { type: Number },
      consumer_id: { type: Number },
      balance: { type: Number }
    },
    point: {
      id: { type: Number },
      consumer_id: { type: Number },
      balance: { type: Number }
    },
    verified: { type: Boolean, default: false },
    otp: { type: Number, default: null },
    otp_expiry: { type: Date, default: null },
    password: { type: String, required: true },
    address: { type: String, default: null },
    city: { type: String, default: null },
    state: { type: String, default: null },
    country: { type: String, default: null },
    zip: { type: String, default: null },
    store_name: { type: String, default: null },
    store_description: { type: String, default: null },
    isAdmin: { type: Boolean, default: false },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Add virtual for ID (to match frontend expectations)
userSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;