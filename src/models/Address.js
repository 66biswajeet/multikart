import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    label: {
      type: String,
      required: true,
      enum: ["Home", "Office", "Other"],
      default: "Home",
    },
    street: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    zip: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      default: null,
    },
    is_default: {
      type: Boolean,
      default: false,
    },
    status: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Ensure only one default address per user
addressSchema.pre("save", async function (next) {
  if (this.is_default) {
    await mongoose.models.Address?.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { is_default: false }
    );
  }
  next();
});

addressSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

const Address =
  mongoose.models.Address || mongoose.model("Address", addressSchema);

export default Address;
