import mongoose from 'mongoose';

// Counter Schema for Auto-Incrementing ID
const counterSchema = new mongoose.Schema({
  field: {
    type: String,
    required: true,
    unique: true,
  },
  count: {
    type: Number,
    default: 0,
  },
});

const Counter = mongoose.model('Counter', counterSchema);

// User Schema
const userSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true,
  },
  username: {
    type: String,
    lowercase: true,
    trim: true,
    unique: true,
    sparse: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  accentColor: {
    type: String,
    default: '#ff4056',
    match: /^#[0-9a-fA-F]{6}$/,
  },
  textColor: {
    type: String,
    default: '#f4f0ef',
    match: /^#[0-9a-fA-F]{6}$/,
  },
  backgroundColor: {
    type: String,
    default: '#090909',
    match: /^#[0-9a-fA-F]{6}$/,
  },
  profilePicture: {
    type: Buffer, // For binary data like images
  },
  backgroundMedia: {
    type: Buffer, // For binary data like images/videos
  },
  backgroundType: {
    type: String,
    enum: ['image', 'video'], // Restrict to specific types
  },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  totalVisit: {
    type: Number,
    default: 0,
  },
});

// Pre-save Hook for Auto-Incrementing ID
userSchema.pre('save', async function (next) {
  if (!this.id) {
    const highestUser = await mongoose.model('User').collection.findOne(
      { id: { $type: 'number' } },
      { sort: { id: -1 }, projection: { id: 1 } }
    );
    const highestId = typeof highestUser?.id === 'number' ? highestUser.id : 0;

    try {
      await Counter.updateOne(
        { field: 'userId' },
        { $max: { count: highestId } },
        { upsert: true, setDefaultsOnInsert: false }
      );
    } catch (error) {
      if ((error as { code?: number }).code !== 11000) throw error;
    }

    const counter = await Counter.findOneAndUpdate(
      { field: 'userId' },
      { $inc: { count: 1 } },
      { new: true, upsert: true }
    );
    this.id = counter.count;
  }
  this.updatedAt = new Date(); // Update the `updatedAt` timestamp
  next();
});

export const User = mongoose.model('User', userSchema);
