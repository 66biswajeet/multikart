import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema({
  file_name: {
    type: String,
    required: true
  },
  original_url: {
    type: String,
    required: true
  },
  mime_type: {
    type: String,
    required: true
  },
  file_size: {
    type: Number,
    required: true
  },
  width: {
    type: Number,
    default: null
  },
  height: {
    type: Number,
    default: null
  },
  public_id: {
    type: String,
    required: true
  },
  resource_type: {
    type: String,
    enum: ['image', 'video', 'raw'],
    default: 'image'
  },
  folder: {
    type: String,
    default: 'default'
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const Attachment = mongoose.models.Attachment || mongoose.model('Attachment', attachmentSchema);

export default Attachment;
