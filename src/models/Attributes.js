import mongoose from 'mongoose';

const attributeValueSchema = new mongoose.Schema({
  value: {
    type: String,
    required: true
  },
  hex_color: {
    type: String,
    default: null
  },
  slug: {
    type: String,
    required: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const attributeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  style: {
    type: String,
    enum: ['rectangle', 'circle', 'image','radio', 'dropdown','color'],
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: Number,
    default: 1
  },
  attribute_values: [attributeValueSchema]
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const Attribute = mongoose.models.Attribute || mongoose.model('Attribute', attributeSchema);

export const AttributeValue = mongoose.models.AttributeValue || mongoose.model('AttributeValue', attributeValueSchema);
export default Attribute;