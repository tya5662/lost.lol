import mongoose from 'mongoose';

const siteSettingsSchema = new mongoose.Schema({
  key: { type: String, unique: true, default: 'main' },
  brandName: { type: String, default: 'lost' },
  brandTld: { type: String, default: '.lol' },
  heroBadge: { type: String, default: 'A profile platform built around you' },
  heroTitle: { type: String, default: 'Your entire online identity, in one place.' },
  heroSubtitle: { type: String, default: 'Build a profile that actually feels like yours. Links, socials, music, effects, badges, backgrounds and more — all controlled from one easy dashboard.' },
  primaryButton: { type: String, default: 'Create your profile' },
  secondaryButton: { type: String, default: 'Explore the experience' },
  accentColor: { type: String, default: '#ef4444', match: /^#[0-9a-fA-F]{6}$/ },
  secondaryColor: { type: String, default: '#cbd5e1', match: /^#[0-9a-fA-F]{6}$/ },
  backgroundColor: { type: String, default: '#050506', match: /^#[0-9a-fA-F]{6}$/ },
  panelColor: { type: String, default: '#0d0d0f', match: /^#[0-9a-fA-F]{6}$/ },
  gridOpacity: { type: Number, default: 0.12, min: 0, max: 1 },
  glowOpacity: { type: Number, default: 0.2, min: 0, max: 1 },
  particles: { type: Boolean, default: true },
  grid: { type: Boolean, default: true },
  ghostMode: { type: Boolean, default: true },
  featureSection: { type: Boolean, default: true },
  mediaLayers: { type: [mongoose.Schema.Types.Mixed], default: [] },
  updatedAt: { type: Date, default: Date.now },
});

export const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);
