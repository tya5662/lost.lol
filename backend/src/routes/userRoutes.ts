import { Router } from 'express';
import { createUser, getUserByUsername, updateUser, deleteUser, setUsername, updatePreferences } from '../controllers/userController';
import { upload } from '../middleware/uploadMiddleware';
import { isAuthenticated } from '../middleware/auth';
import { User } from '../model/profiles';
import { Badge } from '../model/badges';
import { ProfileComment } from '../model/profileComment';

const router = Router();

router.post('/', isAuthenticated, upload.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'backgroundMedia', maxCount: 1 }
]), createUser);
router.get('/badges', isAuthenticated, async (req, res, next) => {
  try {
    const actor = await User.findOne({ id: (req.user as any).id });
    if (!actor) { res.status(401).json({ message: 'Authentication required.' }); return; }
    const definitions = await Badge.find({available:true}).sort({name:1}).lean();
    const holders = await User.find({ badges: { $exists: true, $ne: [] } }).select('badges').lean();
    const rank:Record<string,number>={member:0,staff:1,'co-owner':2,owner:3};
    res.json(definitions.map((b:any)=>({
      ...b,
      holders: holders.filter((u:any)=>(u.badges||[]).includes(b.name)).length,
      claimed: actor.badges.includes(b.name),
      eligible: (!b.requiredPremium || !!actor.premium) && (rank[actor.role]??0)>=(rank[b.requiredRole||'member']??0),
      claimable: !!b.selfClaimable
    })));
  } catch (error) { next(error); }
});
router.post('/badges/claim', isAuthenticated, async (req,res,next)=>{
  try {
    const actor = await User.findOne({ id: (req.user as any).id });
    const badgeName = typeof req.body?.badge === 'string' ? req.body.badge.trim() : '';
    const badge:any = await Badge.findOne({name:badgeName,available:true}).lean();
    if (!actor || !badge || !badge.selfClaimable) { res.status(400).json({message:'That badge is not self-claimable.'}); return; }
    const rank:Record<string,number>={member:0,staff:1,'co-owner':2,owner:3};
    const eligible=(!badge.requiredPremium||!!actor.premium)&&(rank[actor.role]??0)>=(rank[badge.requiredRole||'member']??0);
    if(!eligible){res.status(403).json({message:'You do not meet this badge eligibility requirement.'});return;}
    const holders=await User.countDocuments({badges:badge.name});
    if(badge.maxHolders>0&&holders>=badge.maxHolders&&!actor.badges.includes(badge.name)){res.status(409).json({message:'This badge has reached its holder limit.'});return;}
    if(!actor.badges.includes(badge.name)) actor.badges.push(badge.name);
    await actor.save();
    res.json({badges:actor.badges});
  } catch(error){next(error);}
});

// Public profile comments. Only authenticated accounts can post; each comment is limited to 500 characters.
router.get('/:username/comments', async (req, res, next) => {
  try {
    const target = await User.findOne({ $or: [{ username: req.params.username }, { aliases: req.params.username }] }).select('_id');
    if (!target) { res.status(404).json({ message: 'Profile not found.' }); return; }
    const comments = await ProfileComment.find({ profileUserId: target._id }).sort({ createdAt: -1 }).limit(100).lean();
    res.json(comments);
  } catch (error) { next(error); }
});
router.post('/:username/comments', isAuthenticated, async (req, res, next) => {
  try {
    const actor = await User.findOne({ id: (req.user as any).id }).select('_id username name banned');
    const target = await User.findOne({ $or: [{ username: req.params.username }, { aliases: req.params.username }] }).select('_id');
    const body = typeof req.body?.body === 'string' ? req.body.body.trim() : '';
    if (!actor || !target) { res.status(404).json({ message: 'Profile not found.' }); return; }
    if (actor.banned) { res.status(403).json({ message: 'This account cannot comment.' }); return; }
    if (!body || body.length > 500) { res.status(400).json({ message: 'Comments must be between 1 and 500 characters.' }); return; }
    const comment = await ProfileComment.create({ profileUserId: target._id, authorUserId: actor._id, authorUsername: actor.username, authorName: actor.name, body });
    res.status(201).json(comment);
  } catch (error) { next(error); }
});
router.delete('/:username/comments/:commentId', isAuthenticated, async (req, res, next) => {
  try {
    const actor = await User.findOne({ id: (req.user as any).id }).select('_id role');
    const comment = await ProfileComment.findById(req.params.commentId);
    if (!actor || !comment) { res.status(404).json({ message: 'Comment not found.' }); return; }
    const owner = await User.findOne({ $or: [{ username: req.params.username }, { aliases: req.params.username }] }).select('_id');
    if (!owner || !comment.profileUserId.equals(owner._id) || (!comment.authorUserId.equals(actor._id) && !['owner','co-owner','staff'].includes(actor.role))) {
      res.status(403).json({ message: 'You cannot delete this comment.' }); return;
    }
    await comment.deleteOne();
    res.json({ success: true });
  } catch (error) { next(error); }
});

router.get('/:username', getUserByUsername);
router.put('/:username', isAuthenticated, upload.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'backgroundMedia', maxCount: 1 },
  { name: 'fontFile', maxCount: 1 }
]), updateUser);
router.patch('/:username/preferences', isAuthenticated, updatePreferences);
router.post('/:username/media', isAuthenticated, upload.fields([
  { name: 'audioFile', maxCount: 1 },
  { name: 'profilePicture', maxCount: 1 },
  { name: 'backgroundMedia', maxCount: 1 }
]), updateUser);
router.delete('/:username', isAuthenticated, deleteUser);
router.post('/username' , isAuthenticated , setUsername)
// router.get('/username' , )

export default router;