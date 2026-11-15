import mongoose from 'mongoose';

const ipLoginLogSchema = new mongoose.Schema({
  userId: { type: Number, required: true, index: true },
  username: { type: String, required: true, maxlength: 20 },
  // Store a keyed one-way digest instead of exposing or retaining raw IP addresses.
  ipHash: { type: String, required: true, index: true },
  event: { type: String, enum: ['login', 'login_failed', 'otp_login'], required: true },
  success: { type: Boolean, required: true },
  userAgent: { type: String, default: '', maxlength: 300 },
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 30, index: true },
}, { versionKey: false });

export const IpLoginLog = mongoose.models.IpLoginLog || mongoose.model('IpLoginLog', ipLoginLogSchema);
