import { Router } from 'express';
import { isAuthenticated } from '../middleware/auth';
import { User } from '../model/profiles';
import { CommunityTemplate } from '../model/communityTemplate';

const router = Router();
const allowedSettings = new Set([
  'accentColor','textColor','backgroundColor','fontFamily','usernameEffect','backgroundEffect','cursorEffect',
  'syncToBackground','backgroundOpacity','cardOpacity','cardBlur','profileLayout','cardStyle','cardRadius',
  'linkStyle','linkRadius','linkSpacing','accentGlow','avatarShape','avatarGlow','showViews','showStatus',
  'showBranding','pageEnterEffect','clickEffect','cursorTrailSize','particleEffect','typewriterEnabled',
  'typewriterTexts','typewriterLoop','typewriterSpeed','pageEnterText','typewriterTexts'
]);
const safeSettings = (input: unknown) => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (allowedSettings.has(key)) result[key] = value;
  }
  return Object.keys(result).length ? result : null;
};

router.get('/', async (_req, res, next) => {
  try {
    const templates = await CommunityTemplate.find({}).sort({ createdAt: -1 }).limit(100).lean();
    res.json(templates);
  } catch (error) { next(error); }
});

router.post('/', isAuthenticated, async (req, res, next) => {
  try {
    const actor = await User.findOne({ id: (req.user as any)?.id }).select('id username');
    if (!actor) { res.status(401).json({ message: 'Sign in to publish a template.' }); return; }
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    const description = typeof req.body?.description === 'string' ? req.body.description.trim() : '';
    const previewImage = typeof req.body?.previewImage === 'string' ? req.body.previewImage.trim() : '';
    const settings = safeSettings(req.body?.settings);
    if (name.length < 2 || name.length > 48) { res.status(400).json({ message: 'Template name must be 2–48 characters.' }); return; }
    if (description.length > 240) { res.status(400).json({ message: 'Description must be 240 characters or fewer.' }); return; }
    if (previewImage && !/^https:\/\//i.test(previewImage)) { res.status(400).json({ message: 'Preview image must use an HTTPS URL.' }); return; }
    if (!settings) { res.status(400).json({ message: 'Save some profile styling before publishing a template.' }); return; }
    const template = await CommunityTemplate.create({ name, description, previewImage, settings, authorId: actor.id, authorUsername: actor.username });
    res.status(201).json(template);
  } catch (error) { next(error); }
});

router.delete('/:id', isAuthenticated, async (req, res, next) => {
  try {
    const actor = await User.findOne({ id: (req.user as any)?.id }).select('id role');
    if (!actor) { res.status(401).json({ message: 'Authentication required.' }); return; }
    const query: Record<string, unknown> = { _id: req.params.id };
    if (actor.role !== 'owner') query.authorId = actor.id;
    const removed = await CommunityTemplate.findOneAndDelete(query);
    if (!removed) { res.status(404).json({ message: 'Template not found or you cannot remove it.' }); return; }
    res.json({ success: true });
  } catch (error) { next(error); }
});
export default router;
