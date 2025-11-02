import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  category_image: {
    type: String,
    default: null
  },
  category_icon: {
    type: String,
    default: null
  },
  status: {
    type: Number,
    default: 1
  },
  meta_title: String,
  meta_description: String,
  category_meta_image: {
    type: String,
    default: null
  },
  type: {
    type: String,
    enum: ['product', 'post'],
    default: 'product'
  },
  commission_rate: {
    type: Number,
    default: null
  },
  parent_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  blogs_count: {
    type: Number,
    default: 0
  },
  products_count: {
    type: Number,
    default: 0
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Virtual for subcategories
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent_id'
});



categorySchema.set('toObject', { virtuals: true });
categorySchema.set('toJSON', { virtuals: true });

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
export default Category;
