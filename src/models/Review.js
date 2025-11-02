import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  consumer: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User' // Assuming consumer is stored in a User model
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  review_image: {
    type: String,
    default: null
  },
  rating: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    default: null
  },
  review_image: {
    type: String,
    default: null
  },

}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);
export default Review;
