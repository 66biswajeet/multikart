import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema({
  
  name: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  brand_image: {
    type: String,
    default: null
  },
  brand_meta_image: {
    type: String,
    default: null
  },
  meta_title: String,
  meta_description: String,
  brand_banner: {
    type: String,
    default: null
  },
  status: {
    type: Number,
    default: 1
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  deleted_at: {
    type: Date,
    default: null
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add virtual for ID (to match frontend expectations)
brandSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

const Brand = mongoose.models.Brand || mongoose.model('Brand', brandSchema);
export default Brand;