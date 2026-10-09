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
  backgroundMediaUrl: { type: String, default: '' },
  backgroundType: { type: String, enum: ['image', 'video'] },
  email: { type: String, unique: true, required: true, lowercase: true, trim: true },
  passwordHash: { type: String, select: false },
  emailVerified: { type: Boolean, default: false },
  otpHash: { type: String, select: false },
  otpExpiresAt: { type: Date, select: false },
  otpAttempts: { type: Number, default: 0, select: false },

  // Platform/team permissions
  role: {
    type: String,
    enum: ['owner', 'co-owner', 'staff', 'member'],
    default: 'member',
  },
  rootOwner: { type: Boolean, default: false, index: true },
  canBan: { type: Boolean, default: false },
  canDemote: { type: Boolean, default: false },
  canManageRoles: { type: Boolean, default: false },
  canManagePremium: { type: Boolean, default: false },
  canManageBadges: { type: Boolean, default: false },
  canCustomizeUsers: { type: Boolean, default: false },
  banned: { type: Boolean, default: false, index: true },
  banReason: { type: String, default: '', maxlength: 500 },
  bannedAt: { type: Date },
  bannedBy: { type: Number },
  premium: { type: Boolean, default: false },
  premiumSince: { type: Date },
  badges: { type: [String], default: [] },
  verified: { type: Boolean, default: false },
  customEmojis: {
    type: [{
      name: { type: String, trim: true, maxlength: 24 },
      value: { type: String, trim: true, maxlength: 32 },
    }],
    default: [],
  },
  customFontFamily: { type: String, default: '' },
  customFontName: { type: String, default: '' },
  customFontMime: { type: String, default: '' },
  customFontMedia: { type: Buffer },

  // Profile customization
  location: { type: String, default: '' },
  showLocation: { type: Boolean, default: false },
  showDiscordPresence: { type: Boolean, default: false },
  discordUsername: { type: String, default: '' },
  discordId: { type: String, default: '', index: true },
  discordAvatar: { type: String, default: '' },
  discordConnectedAt: { type: Date },
  profileOpacity: { type: Number, default: 0.92, min: 0, max: 1 },
  backgroundOpacity: { type: Number, default: 1, min: 0.25, max: 1 },
  cardOpacity: { type: Number, default: 0.92, min: 0, max: 1 },
  cardBlur: { type: Number, default: 18, min: 0, max: 40 },
  profileBlur: { type: Number, default: 18, min: 0, max: 40 },
  profileGradient: { type: Boolean, default: true },
  monochromeIcons: { type: Boolean, default: false },
  animatedTitle: { type: Boolean, default: false },
  tabTitle: { type: String, default: '' },
  nameTooltip: { type: String, default: '' },
  avatarDecoration: { type: String, default: '' },
  customCursorHotspot: { type: String, default: '0 0' },
  cardTiltIntensity: { type: Number, default: 15, min: 0, max: 25 },
  cardTiltPerspective: { type: Number, default: 1000, min: 400, max: 1600 },
  usernameEffect: { type: String, default: 'none' },
  backgroundEffect: { type: String, default: 'none' },
  syncToBackground: { type: Boolean, default: false },
  cursorEffect: { type: String, default: 'none' },
  fontFamily: { type: String, default: 'Inter' },
  typewriterEnabled: { type: Boolean, default: false },
  typewriterTexts: { type: [String], default: [] },
  pageEnterText: { type: String, default: '' },
  pageEnterSymbol: { type: String, default: '⛧' }
  pageClickSound: { type: String, default: '' },
  audioUrl: { type: String, default: '' },
  audioTitle: { type: String, default: '' },
  audioAutoplay: { type: Boolean, default: false },
  audioCoverUrl: { type: String, default: '' },
  audioMedia: { type: Buffer },
  audioMime: { type: String, default: '' },
  layout: { type: String, enum: ['default', 'modern', 'minimal', 'portfolio'], default: 'default' },
  metadataTitle: { type: String, default: '' },
  metadataDescription: { type: String, default: '' },
  metadataImage: { type: String, default: '' },
  aliases: { type: [String], default: [], validate: { validator: (value: string[]) => value.length <= 2, message: 'A premium profile can have at most 2 extra aliases.' } },
  secondTab: {
    enabled: { type: Boolean, default: false },
    title: { type: String, default: 'More' },
    widgets: { type: [mongoose.Schema.Types.Mixed], default: [] },
  },

  // Deep customization shared by Free and Premium profiles.
  roleLabel: { type: String, default: '' },
  profileLayout: { type: String, enum: ['default','compact','wide','minimal','split'], default: 'default' },
  cardStyle: { type: String, enum: ['glass','solid','outline','floating'], default: 'glass' },
  cardRadius: { type: Number, default: 28, min: 0, max: 48 },
  linkStyle: { type: String, enum: ['glass','solid','outline','minimal','pill'], default: 'glass' },
  linkRadius: { type: Number, default: 16, min: 0, max: 32 },
  linkOpacity: { type: Number, default: 0.08, min: 0, max: 1 },
  linkBlur: { type: Number, default: 0, min: 0, max: 30 },
  linkSpacing: { type: Number, default: 12, min: 4, max: 28 },
  avatarSize: { type: Number, default: 104, min: 64, max: 180 },
  avatarShape: { type: String, enum: ['circle','rounded','square'], default: 'circle' },
  avatarGlow: { type: Boolean, default: true },
  showViews: { type: Boolean, default: true },
  showStatus: { type: Boolean, default: true },
  showBranding: { type: Boolean, default: true },
  accentGlow: { type: Number, default: 0.18, min: 0, max: 1 },
  pageEnterEffect: { type: String, enum: ['fade','rise','zoom','blur','none'], default: 'rise' },
  clickEffect: { type: String, enum: ['ripple','flash','scale','none'], default: 'scale' },
  cursorTrailSize: { type: Number, default: 3, min: 1, max: 12 },
  cursorTrailCount: { type: Number, default: 3, min: 1, max: 8 },
  cursorTrailGlow: { type: Number, default: 10, min: 0, max: 24 },
  backgroundIntensity: { type: Number, default: 1, min: 0, max: 1 },
  particleEffect: { type: String, enum: ['none','dust','rain','embers','stars','ghosts'], default: 'none' },
  particleColor: { type: String, default: '#b31f1f' },
  particleCount: { type: Number, default: 70, min: 0, max: 180 },
  typewriterSpeed: { type: Number, default: 70, min: 20, max: 200 },
  typewriterLoop: { type: Boolean, default: true },
  socialLinks: { type: [mongoose.Schema.Types.Mixed], default: [] },
  customCss: { type: String, default: '', maxlength: 12000 },

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
