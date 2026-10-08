import { Router } from 'express';
import { isAuthenticated } from '../middleware/auth';
import { SiteSettings } from '../model/siteSettings';
import { User } from '../model/profiles';

const router = Router();

const defaults = {
  brandName: 'suffer',
  brandTld: '.info',
  heroBadge: 'A profile platform built around you',
  heroTitle: 'Your entire online identity, in one place.',
  heroSubtitle: 'Build a profile that actually feels like yours. Links, socials, music, effects, badges, backgrounds and more — all controlled from one easy dashboard.',
  primaryButton: 'Create your profile',
  secondaryButton: 'Explore the experience',
  accentColor: '#ef4444',
  secondaryColor: '#cbd5e1',
  backgroundColor: '#050506',
  panelColor: '#0d0d0f',
  gridOpacity: 0.12,
  glowOpacity: 0.2,
  particles: true,
  grid: true,
  ghostMode: true,
  featureSection: true,
  mediaLayers: [],
  siteAnimations: [],
  announcement: '',
  showcaseLabel: 'Showcase',
  featuresLabel: 'Features',
  signInLabel: 'Sign in',
  createLabel: 'Create page',
  primaryButtonUrl: '/register',
  secondaryButtonUrl: '#showcase',
  heroAlignment: 'center',
  seoTitle: 'suffer.info',
  seoDescription: 'Create a profile that actually feels like yours.',
  seoImage: '',
  footerText: 'Your page. Your links. Your rules.',
  effectsIntensity: 1,
  navStyle:'glass', heroSize:'fullscreen', heroWidth:'standard', headlineFont:'Inter', headlineWeight:600,
  headlineSize:8, bodySize:1, pageRadius:22, sectionSpacing:28, noise:false, vignette:true, scanlines:false,
  animatedGradient:true, mouseGlow:true, hoverLift:true, buttonStyle:'solid', buttonRadius:16, showTrustBar:true,
  trustText:'Free to start · No design skills needed · Your profile, your rules.',
  showcaseTitle:'Make it yours', showcaseDescription:'One editor for your profile, links, music, badges, effects and media.',
  featuresTitle:'Everything important is one tap away.', featuresDescription:'Powerful controls without making you learn code.',
  featureCards:[],
  customCss:'',
};

router.get('/', async (_req, res, next) => {
  try {
    const settings = await SiteSettings.findOne({ key: 'main' }).lean();
    res.json({ ...defaults, ...(settings || {}) });
  } catch (error) { next(error); }
});

router.patch('/', isAuthenticated, async (req, res, next) => {
  try {
    const actor = await User.findOne({ id: (req.user as any)?.id }).select('role');
    if (!actor || actor.role !== 'owner') {
      res.status(403).json({ message: 'Only the site owner can edit global site settings.' });
      return;
    }

    const allowed = Object.keys(defaults) as Array<keyof typeof defaults>;
    const update: Record<string, unknown> = {};
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) update[key] = req.body[key];
    }

    if (update.mediaLayers !== undefined && !Array.isArray(update.mediaLayers)) { res.status(400).json({ message: 'Media layers must be an array.' }); return; }

    for (const key of ['accentColor','secondaryColor','backgroundColor','panelColor']) {
      if (update[key] !== undefined && (typeof update[key] !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(update[key] as string))) {
        res.status(400).json({ message: 'Colors must be six-digit hex values.' });
        return;
      }
    }

    const settings = await SiteSettings.findOneAndUpdate(
      { key: 'main' },
      { $set: { ...update, updatedAt: new Date() }, $setOnInsert: { key: 'main' } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    res.json({ ...defaults, ...settings });
  } catch (error) { next(error); }
});

export default router;
