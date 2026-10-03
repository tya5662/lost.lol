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
  return jwt.sign({ id, email, username }, secret, { expiresIn: '7d' });
};

router.post('/register', async (req, res, next) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const username = typeof req.body.username === 'string' ? req.body.username.trim().toLowerCase() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ message: 'Enter a valid email address.' });
    return;
  }

  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    res.status(400).json({ message: 'Username must be 3-20 characters using lowercase letters, numbers, or underscores.' });
    return;
  }
  if (reservedUsernames.has(username)) {
    res.status(400).json({ message: 'That username is reserved.' });
    return;
  }

  if (password.length < 12 || password.length > 128) {
    res.status(400).json({ message: 'Password must be between 12 and 128 characters.' });
    return;
  }

  try {
    const existingUser = await User.exists({ $or: [{ email }, { username }] });
    if (existingUser) {
      res.status(409).json({ message: 'That email or username is already in use.' });
      return;
    }

    const user = new User({
      email,
      username,
      name: username,
      passwordHash: await hashPassword(password),
    });
    await user.save();

    res.status(201).json({
      token: issueToken(Number(user.id), user.email, username),
      user: { id: user.id, username, name: user.name, email: user.email },
    });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      res.status(409).json({ message: 'That email or username is already in use.' });
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

  try {
    const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] }).select('+passwordHash');
    if (!user?.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
      res.status(401).json({ message: 'Incorrect email/username or password.' });
      return;
    }

    res.json({
      token: issueToken(Number(user.id), user.email, user.username || ''),
      user: { id: user.id, username: user.username, name: user.name, email: user.email },
    });
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