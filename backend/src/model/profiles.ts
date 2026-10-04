import mongoose from 'mongoose';

// Counter Schema for Auto-Incrementing ID
const counterSchema = new mongoose.Schema({
  field: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
});
const Counter = mongoose.model('Counter', counterSchema);

const userSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  username: { type: String, lowercase: true, trim: true, unique: true, sparse: true },
  name: { type: String, required: true },
  description: { type: String },
  accentColor: { type: String, default: '#ef3340', match: /^#[0-9a-fA-F]{6}$/ },
  textColor: { type: String, default: '#f4f0ef', match: /^#[0-9a-fA-F]{6}$/ },
  backgroundColor: { type: String, default: '#090909', match: /^#[0-9a-fA-F]{6}$/ },
  profilePicture: { type: Buffer },
  backgroundMedia: { type: Buffer },
  backgroundType: { type: String, enum: ['image', 'video'] },
  email: { type: String, unique: true, required: true, lowercase: true, trim: true },
  passwordHash: { type: String, select: false },

  // Platform/team permissions
  role: {
    type: String,
    enum: ['owner', 'co-owner', 'staff', 'member'],
    default: 'member',
  },
  premium: { type: Boolean, default: false },
  premiumSince: { type: Date },
  badges: { type: [String], default: [] },

  // Profile customization
  location: { type: String, default: '' },
  showLocation: { type: Boolean, default: false },
  showDiscordPresence: { type: Boolean, default: false },
  discordUsername: { type: String, default: '' },
  profileOpacity: { type: Number, default: 0.92, min: 0.4, max: 1 },
  profileBlur: { type: Number, default: 18, min: 0, max: 40 },
  profileGradient: { type: Boolean, default: true },
  monochromeIcons: { type: Boolean, default: false },
  animatedTitle: { type: Boolean, default: false },
  usernameEffect: { type: String, default: 'none' },
  backgroundEffect: { type: String, default: 'none' },
  cursorEffect: { type: String, default: 'none' },
  fontFamily: { type: String, default: 'Inter' },
  typewriterEnabled: { type: Boolean, default: false },
  typewriterTexts: { type: [String], default: [] },
  pageEnterText: { type: String, default: '' },
  pageClickSound: { type: String, default: '' },
  audioUrl: { type: String, default: '' },
  audioTitle: { type: String, default: '' },
  audioMedia: { type: Buffer },
  audioMime: { type: String, default: '' },
  layout: { type: String, enum: ['default', 'modern', 'minimal', 'portfolio'], default: 'default' },
  metadataTitle: { type: String, default: '' },
  metadataDescription: { type: String, default: '' },
  metadataImage: { type: String, default: '' },
  aliases: { type: [String], default: [] },
  secondTab: {
    enabled: { type: Boolean, default: false },
    title: { type: String, default: 'More' },
    widgets: { type: [mongoose.Schema.Types.Mixed], default: [] },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  totalVisit: { type: Number, default: 0 },
});

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
  this.updatedAt = new Date();
  next();
});

export const User = mongoose.model('User', userSchema);
