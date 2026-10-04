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
      .select('id username name email role premium premiumSince badges verified customEmojis accentColor textColor backgroundColor fontFamily customFontFamily profileOpacity profileBlur usernameEffect backgroundEffect cursorEffect layout createdAt totalVisit')
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
    const target = await User.findOne({ id: Number(req.params.id) });
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

    // Role changes are isolated to the selected account. Never cascade a role
    // change to another user, even when the target is a subordinate.
    if (actor.id === target.id && requestedRole && requestedRole !== actor.role) {
      res.status(400).json({ message: 'You cannot change your own role.' });
      return;
    }

    if (requestedRole) {
      const rank: Record<string, number> = { member: 0, staff: 1, 'co-owner': 2, owner: 3 };
      if (actor.role === 'staff') {
        res.status(403).json({ message: 'Staff accounts cannot change team roles.' });
        return;
      }
      if (actor.role === 'co-owner' && (target.role === 'owner' || target.role === 'co-owner')) {
        res.status(403).json({ message: 'Co-owners can only manage staff and member roles.' });
        return;
      }
      if (requestedRole === 'owner' && actor.role !== 'owner') {
        res.status(403).json({ message: 'Only the owner can create another owner.' });
        return;
      }
      if (actor.role !== 'owner' && rank[requestedRole] >= rank[actor.role]) {
        res.status(403).json({ message: 'You cannot promote an account to your own level or higher.' });
        return;
      }
    }

    if (premium !== undefined && actor.role === 'staff') {
      res.status(403).json({ message: 'Staff accounts cannot change premium status.' });
      return;
    }
    if (premium !== undefined && actor.role === 'co-owner' && ['owner', 'co-owner'].includes(target.role)) {
      res.status(403).json({ message: 'Co-owners cannot change premium status for owners or co-owners.' });
      return;
    }

    if (requestedRole) target.role = requestedRole;
    if (premium !== undefined) {
      target.premium = premium;
      target.premiumSince = premium ? (target.premiumSince || new Date()) : undefined;
    }

    await target.save();
    res.json({
      id: target.id, username: target.username, role: target.role,
      premium: target.premium, premiumSince: target.premiumSince, badges: target.badges,
      verified: target.verified, customEmojis: target.customEmojis,
    });
  } catch (error) { next(error); }
});

router.patch('/users/:id/customization', async (req, res, next) => {
  try {
    const actor = (req as any).actor;
    const target = await User.findOne({ id: Number(req.params.id) });
    if (!target) { res.status(404).json({ message: 'User not found.' }); return; }

    if (actor.role === 'staff' && target.role !== 'member') {
      res.status(403).json({ message: 'Staff can only customize member accounts.' });
      return;
    }
    if (actor.role === 'co-owner' && ['owner', 'co-owner'].includes(target.role)) {
      res.status(403).json({ message: 'Co-owners cannot customize owner or co-owner accounts.' });
      return;
    }

    const body = req.body || {};
    const hex = (value: unknown) => typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value);
    for (const key of ['accentColor','textColor','backgroundColor']) {
      if (body[key] !== undefined && !hex(body[key])) {
        res.status(400).json({ message: 'Colors must be six-digit hex values.' });
        return;
      }
    }

    const text = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : '';
    const number = (value: unknown, min: number, max: number, fallback: number) =>
      typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;

    if (hex(body.accentColor)) target.accentColor = body.accentColor;
    if (hex(body.textColor)) target.textColor = body.textColor;
    if (hex(body.backgroundColor)) target.backgroundColor = body.backgroundColor;
    if (body.fontFamily !== undefined) target.fontFamily = text(body.fontFamily, 80) || 'Inter';
    if (body.customFontFamily !== undefined) target.customFontFamily = text(body.customFontFamily, 80);
    if (body.profileOpacity !== undefined) target.profileOpacity = number(body.profileOpacity, .4, 1, target.profileOpacity);
    if (body.profileBlur !== undefined) target.profileBlur = number(body.profileBlur, 0, 40, target.profileBlur);
    for (const key of ['usernameEffect','backgroundEffect','cursorEffect','layout'] as const) {
      if (body[key] !== undefined) (target as any)[key] = text(body[key], 32);
    }
    if (body.verified !== undefined) target.verified = Boolean(body.verified);

    if (Array.isArray(body.customEmojis)) {
      target.customEmojis = body.customEmojis
        .slice(0, 40)
        .map((item: any) => ({ name: text(item?.name, 24), value: text(item?.value, 32) }))
        .filter((item: {name:string;value:string}) => item.name && item.value);
    }

    await target.save();
    res.json({
      id: target.id, username: target.username, role: target.role,
      premium: target.premium, verified: target.verified, badges: target.badges,
      accentColor: target.accentColor, textColor: target.textColor, backgroundColor: target.backgroundColor,
      fontFamily: target.fontFamily, customFontFamily: target.customFontFamily,
      profileOpacity: target.profileOpacity, profileBlur: target.profileBlur,
      usernameEffect: target.usernameEffect, backgroundEffect: target.backgroundEffect,
      cursorEffect: target.cursorEffect, layout: target.layout, customEmojis: target.customEmojis,
    });
  } catch (error) { next(error); }
});

router.post('/users/:id/badges', async (req, res, next) =>
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

router.delete('/users/:id/badges/:badge', async (req, res, next) => {
  try {
    const actor = (req as any).actor;
    if (actor.role === 'staff') { res.status(403).json({ message: 'Staff accounts cannot manage badges.' }); return; }
    const target = await User.findOne({ id: Number(req.params.id) });
    if (!target) { res.status(404).json({ message: 'User not found.' }); return; }
    const badge = decodeURIComponent(req.params.badge);
    target.badges = target.badges.filter((item: string) => item !== badge);
    await target.save();
    res.json({ badges: target.badges });
  } catch (error) { next(error); }
});

router.get('/badges', async (_req,res,next)=>{try{const users=await User.find({badges:{$exists:true,$ne:[]}}).select('username badges').lean();const names=[...new Set(users.flatMap((u:any)=>u.badges||[]))];res.json(names.map(name=>({name,holders:users.filter((u:any)=>(u.badges||[]).includes(name)).length})));}catch(error){next(error)}});

export default router;
