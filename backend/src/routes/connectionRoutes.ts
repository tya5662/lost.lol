import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../model/profiles';
import { isAuthenticated } from '../middleware/auth';

const router = Router();
const BACKEND_URL = process.env.BACKEND_URL || 'https://lost-lol.onrender.com';
const FRONTEND_URL = (process.env.FRONTEND_URL || 'https://suffer.info').replace(/\/+$/, '');

router.get('/discord/start', isAuthenticated, (req, res) => {
  const clientId = process.env.DISCORD_CLIENT_ID;
  if (!clientId || !process.env.JWT_SECRET) {
    res.status(503).json({ message: 'Discord connection is not configured yet.' });
    return;
  }
  const state = jwt.sign({ userId: (req.user as any).id, purpose: 'discord-connect' }, process.env.JWT_SECRET, { expiresIn: '10m' });
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: `${process.env.DISCORD_REDIRECT_URI || `${BACKEND_URL}/api/connections/discord/callback`}`,
    scope: 'identify',
    state,
    prompt: 'consent',
  });
  res.redirect(`https://discord.com/oauth2/authorize?${params.toString()}`);
});

router.get('/discord/callback', async (req, res, next) => {
  try {
    const { code, state } = req.query;
    if (typeof code !== 'string' || typeof state !== 'string' || !process.env.JWT_SECRET) {
      res.redirect(`${FRONTEND_URL}/dashboard/connections?discord=error`);
      return;
    }
    const decoded = jwt.verify(state, process.env.JWT_SECRET) as { userId?: number; purpose?: string };
    if (decoded.purpose !== 'discord-connect' || !decoded.userId) throw new Error('Invalid Discord connection state.');
    const clientId = process.env.DISCORD_CLIENT_ID;
    const clientSecret = process.env.DISCORD_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      res.redirect(`${FRONTEND_URL}/dashboard/connections?discord=not_configured`);
      return;
    }
    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.DISCORD_REDIRECT_URI || `${BACKEND_URL}/api/connections/discord/callback`,
    });
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
    const tokenData = await tokenResponse.json() as { access_token?: string };
    if (!tokenResponse.ok || !tokenData.access_token) throw new Error('Discord token exchange failed.');
    const userResponse = await fetch('https://discord.com/api/users/@me', { headers: { Authorization: `Bearer ${tokenData.access_token}` } });
    const discordUser = await userResponse.json() as { id?: string; username?: string; global_name?: string | null; avatar?: string | null };
    if (!userResponse.ok || !discordUser.id) throw new Error('Discord account lookup failed.');
    const user = await User.findOne({ id: decoded.userId });
    if (!user) throw new Error('Suffer account not found.');
    user.discordId = discordUser.id;
    user.discordUsername = discordUser.global_name || discordUser.username || '';
    user.discordAvatar = discordUser.avatar ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png?size=128` : '';
    user.discordConnectedAt = new Date();
    await user.save();
    res.redirect(`${FRONTEND_URL}/dashboard/connections?discord=connected`);
  } catch (error) {
    console.error('Discord OAuth error:', error);
    res.redirect(`${FRONTEND_URL}/dashboard/connections?discord=error`);
  }
});

router.get('/discord/status', isAuthenticated, async (req, res, next) => {
  try {
    const user = await User.findOne({ id: (req.user as any).id }).select('discordId discordUsername discordAvatar discordConnectedAt');
    if (!user) { res.status(404).json({ message: 'Account not found.' }); return; }
    res.json({ connected: !!user.discordId, username: user.discordUsername || '', avatar: user.discordAvatar || '', connectedAt: user.discordConnectedAt || null });
  } catch (error) { next(error); }
});

router.delete('/discord', isAuthenticated, async (req, res, next) => {
  try {
    const user = await User.findOne({ id: (req.user as any).id });
    if (!user) { res.status(404).json({ message: 'Account not found.' }); return; }
    user.discordId = '';
    user.discordUsername = '';
    user.discordAvatar = '';
    user.discordConnectedAt = undefined;
    await user.save();
    res.json({ connected: false });
  } catch (error) { next(error); }
});

export default router;
