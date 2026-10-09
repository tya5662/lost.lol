import mongoose from 'mongoose';

const communityTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 48 },
  description: { type: String, default: '', trim: true, maxlength: 240 },
  previewImage: { type: String, default: '', maxlength: 1200 },
  authorId: { type: Number, required: true, index: true },
  authorUsername: { type: String, required: true, trim: true, lowercase: true },
  settings: { type: mongoose.Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now },
});
communityTemplateSchema.index({ createdAt: -1 });
export const CommunityTemplate = mongoose.model('CommunityTemplate', communityTemplateSchema);
