import { Router } from 'express';
import { createUser, getUserByUsername, updateUser, deleteUser, setUsername, updatePreferences } from '../controllers/userController';
import { upload } from '../middleware/uploadMiddleware';
import { isAuthenticated } from '../middleware/auth';
import { User } from '../model/profiles';

const router = Router();

router.post('/', isAuthenticated, upload.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'backgroundMedia', maxCount: 1 }
]), createUser);
router.get('/badges', isAuthenticated, async (_req, res, next) => {
  try {
    const users = await User.find({ badges: { $exists: true, $ne: [] } }).select('badges').lean();
    const names = [...new Set(users.flatMap((u: any) => u.badges || []))];
    res.json(names.map(name => ({ name, holders: users.filter((u: any) => (u.badges || []).includes(name)).length })));
  } catch (error) { next(error); }
});
router.get('/:username', getUserByUsername);
router.put('/:username', isAuthenticated, upload.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'backgroundMedia', maxCount: 1 }
]), updateUser);
router.patch('/:username/preferences', isAuthenticated, updatePreferences);
router.post('/:username/media', isAuthenticated, upload.fields([
  { name: 'audioFile', maxCount: 1 },
  { name: 'backgroundMedia', maxCount: 1 }
]), updateUser);
router.delete('/:username', isAuthenticated, deleteUser);
router.post('/username' , isAuthenticated , setUsername)
// router.get('/username' , )

export default router;