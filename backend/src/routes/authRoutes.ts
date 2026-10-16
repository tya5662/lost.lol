import { Router } from 'express';
import { createHmac, randomBytes, randomInt, scrypt, timingSafeEqual } from 'crypto';
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

const currentIpHash = (ip: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET environment variable is required');
  return createHmac('sha256', secret).update(ip || 'unknown').digest('hex');
};

const createOtp = (): string => String(randomInt(0, 1_000_000)).padStart(6, '0');
const hashOtp = (email: string, code: string): string => createHmac('sha256', process.env.JWT_SECRET || 'missing-secret').update(`${email}:${code}`).digest('hex');

const sendOtpEmail = async (email: string, code: string, reason: 'verify your email' | 'sign in from a new location'): Promise<boolean> => {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    console.error('OTP email unavailable: configure RESEND_API_KEY and RESEND_FROM_EMAIL on the backend.');
    return false;
  }
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [email],
        subject: 'Your suffer.info verification code',
        text: `Your suffer.info code is ${code}. Use it to ${reason}. It expires in 10 minutes. If you did not request this, you can ignore this email.`,
        html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:28px;background:#101010;color:#f4f0ef;border-radius:16px"><h1 style="margin-top:0">suffer.info</h1><p>Your verification code to ${reason}:</p><p style="font-size:32px;letter-spacing:8px;font-weight:700">${code}</p><p>This code expires in 10 minutes. If you did not request this, you can ignore this email.</p></div>`,
      }),
    });
    if (!response.ok) console.error('OTP email provider rejected request:', response.status, (await response.text()).slice(0, 300));
    return response.ok;
  } catch (error) {
    console.error('OTP email request failed:', error instanceof Error ? error.message : 'unknown error');
    return false;
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
  if (!/^[a-z0-9._]{3}$/.test(username)) {
    res.status(400).json({ message: 'Username must be exactly 3 characters using lowercase letters, numbers, periods, or underscores.' });
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
    res.status(503).json({ message: 'Sign-up is temporarily unavailable. The server administrator must configure JWT_SECRET.' });
    return;
  }
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
    res.status(503).json({ message: 'Email verification is not configured yet. Please try again later.' });
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

    const code = createOtp();
    const user = new User({
      email, username, name: username,
      passwordHash: await hashPassword(password),
      emailVerified: false,
      otpHash: hashOtp(email, code),
      otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      otpAttempts: 0,
      trustedIpHashes: [],
    });
    await user.save();
    const sent = await sendOtpEmail(email, code, 'verify your email');
    if (!sent) {
      await User.deleteOne({ _id: user._id });
      res.status(502).json({ message: 'We could not send your verification email. Please try again later.' });
      return;
    }
    res.status(200).json({ otpRequired: true, email, message: 'Check your email for a 6-digit verification code.' });
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
    res.status(503).json({ message: 'Sign-in is temporarily unavailable. The server administrator must configure JWT_SECRET.' });
    return;
  }

  try {
    const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] }).select('+passwordHash +otpHash +otpExpiresAt +otpAttempts');
    if (!user?.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
      res.status(401).json({ message: 'Incorrect email/username or password.' });
      return;
    }
    if (user.username === 'pain') {
      let changed = false;
      if (user.role !== 'owner') { user.role = 'owner'; changed = true; }
      if (!user.rootOwner) { user.rootOwner = true; changed = true; }
      if (!user.premium) { user.premium = true; user.premiumSince = user.premiumSince || new Date(); changed = true; }
      if (changed) await user.save();
    }

    const ipHash = currentIpHash(req.ip || '');
    const trusted = Array.isArray(user.trustedIpHashes) && user.trustedIpHashes.includes(ipHash);
    if (!user.emailVerified || !trusted) {
      if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
        res.status(503).json({ message: 'Email verification is not configured yet. Please try again later.' });
        return;
      }
      const code = createOtp();
      user.otpHash = hashOtp(user.email, code);
      user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
      user.otpAttempts = 0;
      await user.save();
      const sent = await sendOtpEmail(user.email, code, user.emailVerified ? 'sign in from a new location' : 'verify your email');
      if (!sent) {
        res.status(502).json({ message: 'We could not send your verification email. Please try again later.' });
        return;
      }
      res.json({ otpRequired: true, email: user.email, message: user.emailVerified ? 'New location detected. Check your email for a sign-in code.' : 'Verify your email to finish signing in.' });
      return;
    }

    res.json({ token: issueToken(Number(user.id), user.email, user.username || ''), sessionDays: 30, user: { id: user.id, username: user.username, name: user.name, email: user.email } });
  } catch (error) {
    next(error);
  }
});

router.post('/verify-otp', async (req, res, next) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const code = typeof req.body.code === 'string' ? req.body.code.trim() : '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\d{6}$/.test(code)) {
    res.status(400).json({ message: 'Enter the email address and 6-digit code.' });
    return;
  }
  try {
    const user = await User.findOne({ email }).select('+otpHash +otpExpiresAt +otpAttempts');
    if (!user || !user.otpHash || !user.otpExpiresAt || user.otpExpiresAt.getTime() < Date.now()) {
      res.status(400).json({ message: 'That code expired. Sign in or register again to get a new one.' });
      return;
    }
    if ((user.otpAttempts || 0) >= 5) {
      res.status(429).json({ message: 'Too many incorrect codes. Request a new code by signing in again.' });
      return;
    }
    const supplied = Buffer.from(hashOtp(email, code), 'hex');
    const expected = Buffer.from(user.otpHash, 'hex');
    if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      await user.save();
      res.status(400).json({ message: 'That verification code is incorrect.' });
      return;
    }
    user.emailVerified = true;
    user.otpHash = undefined;
    user.otpExpiresAt = undefined;
    user.otpAttempts = 0;
    const ipHash = currentIpHash(req.ip || '');
    const trusted = Array.isArray(user.trustedIpHashes) ? user.trustedIpHashes.filter((value: string) => value !== ipHash) : [];
    user.trustedIpHashes = [...trusted, ipHash].slice(-10);
    await user.save();
    res.json({ token: issueToken(Number(user.id), user.email, user.username || ''), sessionDays: 30, user: { id: user.id, username: user.username, name: user.name, email: user.email } });
  } catch (error) {
    next(error);
  }
});

router.get('/me', isAuthenticated, async (req, res, next) => {
  try {


    const id = (req.user as any).id;
    // console.log( 'username' , id)

    const user = await User.findOne({id: id});

    if(user && user.username === 'pain' && !user.rootOwner){ user.rootOwner = true; user.role = 'owner'; user.premium = true; user.premiumSince = user.premiumSince || new Date(); await user.save(); }

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