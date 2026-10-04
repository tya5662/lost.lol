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
router.get('/badges', isAuthenticated, async (req, res, next) => {
  try {
    const actor = await User.findOne({ id: (req.user as any).id });
    if (!actor) { res.status(401).json({ message: 'Authentication required.' }); return; }
    const holders = await User.find({ badges: { $exists: true, $ne: [] } }).select('badges').lean();
    const existing = [...new Set(holders.flatMap((u: any) => u.badges || []))];
    const builtIn = ['Premium','Explorer','Early'];
    const names = [...new Set([...existing, ...builtIn])];
    const eligible = (name:string) =>
      name === 'Premium' ? !!actor.premium :
      name === 'Explorer' ? (actor.totalVisit || 0) >= 10 :
      name === 'Early' ? !!actor.createdAt && new Date(actor.createdAt).getTime() <= Date.now() : false;
    res.json(names.map(name => ({
      name,
      holders: holders.filter((u:any)=>(u.badges||[]).includes(name)).length,
      claimed: actor.badges.includes(name),
      eligible: eligible(name),
      claimable: builtIn.includes(name)
    })));
  } catch (error) { next(error); }
});
router.post('/badges/claim', isAuthenticated, async (req,res,next)=>{
  try {
    const actor = await User.findOne({ id: (req.user as any).id });
    const badge = typeof req.body?.badge === 'string' ? req.body.badge.trim() : '';
    if (!actor || !['Premium','Explorer','Early'].includes(badge)) {
      res.status(400).json({ message: 'That badge is not self-claimable.' }); return;
    }
    const eligible =
      (badge === 'Premium' && !!actor.premium) ||
      (badge === 'Explorer' && (actor.totalVisit || 0) >= 10) ||
      (badge === 'Early' && !!actor.createdAt);
    if (!eligible) { res.status(403).json({ message: 'You do not meet the eligibility requirements for this badge.' }); return; }
    if (!actor.badges.includes(badge)) actor.badges.push(badge);
    await actor.save();
    res.json({ badges: actor.badges });
  } catch(error){ next(error); }
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