import mongoose from 'mongoose';

const storeSchema = new mongoose.Schema({
  store_name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: null
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  store_logo: {
    type: String,
    default: null
  },
  store_cover: {
    type: String,
    default: null
  },
  country: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  city: String,
  address: String,
  pincode: String,
  
  facebook: { type: String, default: null },
  twitter: { type: String, default: null },
  instagram: { type: String, default: null },
  youtube: { type: String, default: null },
  pinterest: { type: String, default: null },

  hide_vendor_email: {
    type: Number,
    default: 0
  },
  hide_vendor_phone: {
    type: Number,
    default: 0
  },

  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming vendor is a user with role vendor
    required: true
  },
  status: {
    type: Number,
    default: 1
  },
  is_approved: {
    type: Number,
    default: 0
  },
  orders_count: {
    type: Number,
    default: 0
  },
  reviews_count: {
    type: Number,
    default: 0
  },
  products_count: {
    type: Number,
    default: 0
  },
  product_images: [{
    type: String
  }],
  order_amount: {
    type: Number,
    default: 0
  },
  rating_count: {
    type: Number,
    default: 0
  },
  store_logo: { type: String, default: null },
  store_cover: { type: String, default: null },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }]
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const Store = mongoose.models.Store || mongoose.model('Store', storeSchema);
export default Store;
