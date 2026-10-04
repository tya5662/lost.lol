import { Router } from 'express';
import { isAuthenticated } from '../middleware/auth';
import { User } from '../model/profiles';

const router = Router();
const privilegedRoles = new Set(['owner', 'co-owner', 'staff']);

router.use(isAuthenticated);

router.use(async (req, res, next) => {
  try {
    const id = (req.user as any).id;
    const actor = await User.findOne({ id });
    if (!actor || !privilegedRoles.has(actor.role)) {
      res.status(403).json({ message: 'You do not have permission to access the admin panel.' });
      return;
    }
    (req as any).actor = actor;
    next();
  } catch (error) {
    next(error);
  }
});

router.get('/users', async (_req, res, next) => {
  try {
    const users = await User.find({})
      .select('id username name email role premium premiumSince badges createdAt totalVisit')
      .sort({ createdAt: -1 })
      .lean();
    res.json(users);
  } catch (error) {
    next(error);
  }
});

router.patch('/users/:id', async (req, res, next) => {
  try {
    const actor = (req as any).actor;
    const targetId = Number(req.params.id);
    const target = await User.findOne({ id: targetId });

    if (!target) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    const requestedRole = typeof req.body.role === 'string' ? req.body.role : undefined;
    const premium = typeof req.body.premium === 'boolean' ? req.body.premium : undefined;

    if (requestedRole && !['owner', 'co-owner', 'staff', 'member'].includes(requestedRole)) {
      res.status(400).json({ message: 'Invalid role.' });
      return;
    }

    if (actor.role !== 'owner' && requestedRole === 'owner') {
      res.status(403).json({ message: 'Only the owner can create another owner.' });
      return;
    }

    if (actor.id === target.id && requestedRole && requestedRole !== actor.role) {
      res.status(400).json({ message: 'You cannot change your own role.' });
      return;
    }

    if (actor.role === 'staff' && (requestedRole || premium !== undefined)) {
      res.status(403).json({ message: 'Staff accounts cannot change team roles or premium status.' });
      return;
    }

    if (requestedRole) target.role = requestedRole;
    if (premium !== undefined) {
      target.premium = premium;
      target.premiumSince = premium ? (target.premiumSince || new Date()) : undefined;
    }

    await target.save();

    res.json({
      id: target.id,
      username: target.username,
      role: target.role,
      premium: target.premium,
      premiumSince: target.premiumSince,
      badges: target.badges,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/users/:id/badges', async (req, res, next) => {
  try {
    const actor = (req as any).actor;
    if (actor.role === 'staff') {
      res.status(403).json({ message: 'Staff accounts cannot manage badges.' });
      return;
    }

    const target = await User.findOne({ id: Number(req.params.id) });
    const badge = typeof req.body.badge === 'string' ? req.body.badge.trim().slice(0, 32) : '';

    if (!target || !badge) {
      res.status(400).json({ message: 'A valid user and badge are required.' });
      return;
    }

    if (!target.badges.includes(badge)) target.badges.push(badge);
    await target.save();
    res.json({ badges: target.badges });
  } catch (error) {
    next(error);
  }
});

export default router;
