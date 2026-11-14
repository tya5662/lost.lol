import mongoose from 'mongoose';

const profileCommentSchema = new mongoose.Schema({
  profileUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  authorUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorUsername: { type: String, required: true, maxlength: 20 },
  authorName: { type: String, required: true, maxlength: 60 },
  body: { type: String, required: true, trim: true, maxlength: 500 },
  createdAt: { type: Date, default: Date.now, index: true },
});
profileCommentSchema.index({ profileUserId: 1, createdAt: -1 });
export const ProfileComment = mongoose.model('ProfileComment', profileCommentSchema);
