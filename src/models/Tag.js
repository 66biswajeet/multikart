import mongoose from 'mongoose';

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['product', 'post'],
    default: 'product'
  },
  description: String,
  // created_by_id: {
  //   type: String,
  //   required: true
  // },
  status: {
    type: Number,
    default: 1
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

const Tag = mongoose.models.Tag || mongoose.model('Tag', tagSchema);
export default Tag;