import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true, maxlength: 32 },
  image: { type: String, default: '', maxlength: 200000 },
  fontFamily: { type: String, default: 'Inter', maxlength: 80 },
  textColor: { type: String, default: '#f4f0ef', match: /^#[0-9a-fA-F]{6}$/ },
  accentColor: { type: String, default: '#ef3340', match: /^#[0-9a-fA-F]{6}$/ },
  animation: { type: String, enum: ['none','pulse','float','spin','bounce','glow'], default: 'none' },
  description: { type: String, default: '', maxlength: 160 },
  selfClaimable: { type: Boolean, default: false },
  requiredPremium: { type: Boolean, default: false },
  requiredRole: { type: String, enum: ['member','staff','co-owner','owner'], default: 'member' },
  maxHolders: { type: Number, default: 0, min: 0, max: 1000000 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

badgeSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Badge = mongoose.model('Badge', badgeSchema);
