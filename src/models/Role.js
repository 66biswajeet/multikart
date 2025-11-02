import mongoose from "mongoose";

const permissionSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  guard_name: { type: String, default: "web" },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const roleSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  display_name: {
    type: String,
    required: true,
    trim: true
  },
  guard_name: { 
    type: String, 
    default: "web" 
  },
  system_reserve: { 
    type: String, 
    default: "0",
    enum: ["0", "1"] // 1 for system reserved roles, 0 for custom roles
  },
  description: {
    type: String,
    default: ""
  },
  status: {
    type: Number,
    default: 1,
    enum: [0, 1] // 0 for inactive, 1 for active
  },
  permissions: [permissionSchema],
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add virtual for ID (to match frontend expectations)
roleSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Pre-save middleware to update timestamps
roleSchema.pre('save', function(next) {
  // Don't set custom timestamps since we're using mongoose timestamps
  next();
});

// Virtual for created_at to use createdAt
roleSchema.virtual('created_at').get(function() {
  return this.createdAt;
});

// Virtual for updated_at to use updatedAt  
roleSchema.virtual('updated_at').get(function() {
  return this.updatedAt;
});

// Static methods for common queries
roleSchema.statics.findActive = function() {
  return this.find({ status: 1 });
};

roleSchema.statics.findByName = function(name) {
  return this.findOne({ name: name.toLowerCase() });
};

roleSchema.statics.findNonSystemReserved = function() {
  return this.find({ system_reserve: "0" });
};

// Instance methods
roleSchema.methods.addPermission = function(permission) {
  if (!this.permissions.some(p => p.name === permission.name)) {
    this.permissions.push(permission);
  }
  return this.save();
};

roleSchema.methods.removePermission = function(permissionName) {
  this.permissions = this.permissions.filter(p => p.name !== permissionName);
  return this.save();
};

roleSchema.methods.hasPermission = function(permissionName) {
  return this.permissions.some(p => p.name === permissionName);
};

const Role = mongoose.models.Role || mongoose.model("Role", roleSchema);

export default Role;