import mongoose from 'mongoose';

const adminRoleSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 32 },
  key: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 40 },
  level: { type: Number, default: 10, min: 1, max: 99 },
  color: { type: String, default: '#a1a1aa', match: /^#[0-9a-fA-F]{6}$/ },
  description: { type: String, default: '', maxlength: 180 },
  permissions: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

adminRoleSchema.pre('save', function(next) { this.updatedAt = new Date(); next(); });

export const AdminRole = mongoose.models.AdminRole || mongoose.model('AdminRole', adminRoleSchema);
