import mongoose from "mongoose";

const StoreCustomizationSchema = new mongoose.Schema(
  {
    carousel_images: [
      {
        image: {
          type: String,
          required: false,
        },
        link: {
          type: String,
          required: false,
        },
      },
    ],
    site_logo: {
      type: String,
      required: false,
    },
    site_logo_dark: {
      type: String,
      required: false,
    },
    favicon: {
      type: String,
      required: false,
    },
    hero_title: {
      type: String,
      default: "Welcome to Our Store",
    },
    hero_subtitle: {
      type: String,
      default: "Discover amazing products",
    },
    banners: [
      {
        image: {
          type: String,
          required: false,
        },
        link: {
          type: String,
          required: false,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.StoreCustomization ||
  mongoose.model("StoreCustomization", StoreCustomizationSchema);
