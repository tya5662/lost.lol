import { Router } from 'express';
import { isAuthenticated } from '../middleware/auth';
import { User } from '../model/profiles';
import { Badge } from '../model/badges';
import { Link } from '../model/link';
import { ProfileComment } from '../model/profileComment';
import { AdminRole } from '../model/adminRole';

const router = Router();
router.use(isAuthenticated);

router.use(async (req, res, next) => {
  try {
    const id = (req.user as any).id;
    const actor = await User.findOne({ id }).select('+adminRoleId');
    if (!actor) { res.status(403).json({ message: 'Admin account not found.' }); return; }
    const assignedRole: any = actor.adminRoleId ? await AdminRole.findById(actor.adminRoleId).lean() as any : null;
    const legacyPermissions = actor.role === 'owner' ? ['view_dashboard','manage_users','ban_users','manage_roles','manage_premium','manage_badges','customize_users','manage_site','manage_homepage','manage_comments','view_analytics'] : ['view_dashboard', ...(actor.canBan?['ban_users']:[]), ...(actor.canDemote||actor.canManageRoles?['manage_roles']:[]), ...(actor.canManagePremium?['manage_premium']:[]), ...(actor.canManageBadges?['manage_badges']:[]), ...(actor.canCustomizeUsers?['customize_users']:[])];
    const permissions = actor.rootOwner ? ['*'] : (assignedRole?.permissions || (['owner','co-owner','staff'].includes(actor.role) ? legacyPermissions : []));
    if (!actor.rootOwner && permissions.length === 0) {
      res.status(403).json({ message: 'You do not have permission to access the admin panel.' });
      return;
    }
    const has = (permission: string) => actor.rootOwner || permissions.includes('*') || permissions.includes(permission);
    (actor as any).adminPermissions = permissions;
    (actor as any).adminRoleName = assignedRole?.name || (actor.rootOwner ? 'Primary Owner' : actor.role);
    (actor as any).adminRoleLevel = assignedRole?.level || (actor.rootOwner ? 100 : 0);
    (actor as any).canBan = has('ban_users');
    (actor as any).canDemote = has('manage_roles');
    (actor as any).canManageRoles = has('manage_roles');
    (actor as any).canManagePremium = has('manage_premium');
    (actor as any).canManageBadges = has('manage_badges');
    (actor as any).canCustomizeUsers = has('customize_users');
    (req as any).actor = actor;
    next();
  } catch (error) {
    next(error);
  }
});


const ADMIN_PERMISSION_KEYS = ['view_dashboard','manage_users','ban_users','manage_roles','manage_premium','manage_badges','customize_users','manage_site','manage_homepage','manage_comments','view_analytics','manage_admins'] as const;

router.get('/me', async (req,res) => {
  const actor=(req as any).actor;
  res.json({ id:actor.id, username:actor.username, rootOwner:!!actor.rootOwner, role:actor.role, roleName:actor.adminRoleName, roleLevel:actor.adminRoleLevel, permissions:actor.adminPermissions });
});

router.get('/roles', async (_req,res,next) => {
  try { res.json(await AdminRole.find({}).sort({level:-1,name:1}).lean()); } catch(error){ next(error); }
});

router.post('/roles', async (req,res,next) => {
  try {
    const actor=(req as any).actor;
    if(!actor.rootOwner && !(actor.adminPermissions||[]).includes('manage_admins')){res.status(403).json({message:'You do not have permission to manage admin ranks.'});return;}
    const body=req.body||{};
    const name=typeof body.name==='string'?body.name.trim().slice(0,32):'';
    const key=typeof body.key==='string'?body.key.toLowerCase().trim().replace(/[^a-z0-9-]/g,'-').replace(/-+/g,'-').slice(0,40):'';
    const level=Number.isFinite(body.level)?Math.max(1,Math.min(99,Math.floor(body.level))):10;
    const color=typeof body.color==='string'?body.color:'#a1a1aa';
    if(!name||!key||!/^#[0-9a-fA-F]{6}$/.test(color)){res.status(400).json({message:'Enter a rank name, valid rank key, and six-digit hex color.'});return;}
    if(!actor.rootOwner && level >= Number(actor.adminRoleLevel||0)){res.status(403).json({message:'You can only create ranks below your own level.'});return;}
    const permissions=Array.isArray(body.permissions)?[...new Set(body.permissions.filter((p:string)=>ADMIN_PERMISSION_KEYS.includes(p as any)))]:[];
    const role=await AdminRole.findOneAndUpdate({key},{name,key,level,color,permissions,description:typeof body.description==='string'?body.description.slice(0,180):''},{new:true,upsert:true,setDefaultsOnInsert:true});
    res.json(role);
  }catch(error){next(error);}
});

router.delete('/roles/:id', async(req,res,next)=>{
  try{
    const actor=(req as any).actor;
    if(!actor.rootOwner && !(actor.adminPermissions||[]).includes('manage_admins')){res.status(403).json({message:'You do not have permission to manage admin ranks.'});return;}
    const role=await AdminRole.findById(req.params.id);
    if(!role){res.status(404).json({message:'Rank not found.'});return;}
    if(!actor.rootOwner && Number(role.level)>=Number(actor.adminRoleLevel||0)){res.status(403).json({message:'You can only delete ranks below your own level.'});return;}
    const assigned=await User.countDocuments({adminRoleId:role._id});
    if(assigned){res.status(409).json({message:'Reassign all administrators before deleting this rank.'});return;}
    await role.deleteOne();res.json({success:true});
  }catch(error){next(error);}
});

router.patch('/users/:id/admin-role', async(req,res,next)=>{
  try{
    const actor=(req as any).actor;
    if(!actor.rootOwner && !(actor.adminPermissions||[]).includes('manage_admins')){res.status(403).json({message:'You do not have permission to manage administrators.'});return;}
    const target=await User.findOne({id:Number(req.params.id)});
    if(!target){res.status(404).json({message:'User not found.'});return;}
    if(target.rootOwner){res.status(400).json({message:'The primary owner rank cannot be changed.'});return;}
    const roleId=typeof req.body?.roleId==='string'?req.body.roleId:'';
    if(!roleId){target.adminRoleId=null;target.role='member';await target.save();res.json({id:target.id,role:target.role,adminRoleId:null});return;}
    const role=await AdminRole.findById(roleId);
    if(!role){res.status(404).json({message:'Admin rank not found.'});return;}
    if(!actor.rootOwner){const actorLevel=Number((actor as any).adminRoleLevel||0);if(Number(role.level)>=actorLevel||target.rootOwner){res.status(403).json({message:'You can only assign ranks below your own level.'});return;}}
    target.adminRoleId=role._id as any;target.role=role.key;
    await target.save();
    res.json({id:target.id,role:target.role,adminRoleId:String(role._id),roleName:role.name,permissions:role.permissions});
  }catch(error){next(error);}
});

router.get('/users', async (req, res, next) => {
  try {
    const actor=(req as any).actor;
    if(!actor.rootOwner && !(actor.adminPermissions||[]).some((p:string)=>['view_dashboard','manage_users','manage_admins'].includes(p))){res.status(403).json({message:'You do not have permission to view user accounts.'});return;}
    const users = await User.find({})
      .select('id username name email role adminRoleId rootOwner canBan canDemote canManageRoles canManagePremium canManageBadges canCustomizeUsers banned banReason bannedAt premium premiumSince badges verified customEmojis accentColor textColor backgroundColor fontFamily customFontFamily profileOpacity profileBlur usernameEffect backgroundEffect cursorEffect layout createdAt totalVisit')
      .sort({ createdAt: -1 })
      .lean();
    res.json(users);
  } catch (error) {
    next(error);
  }
});

router.delete('/users/:id/account', async (req, res, next) => {
  try {
    const actor = (req as any).actor;
    if (!actor.rootOwner) {
      res.status(403).json({ message: 'Only the primary owner can permanently delete accounts.' });
      return;
    }
    const targetId = Number(req.params.id);
    if (!Number.isSafeInteger(targetId)) {
      res.status(400).json({ message: 'Invalid user ID.' });
      return;
    }
    const target = await User.findOne({ id: targetId });
    if (!target) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }
    if (target.rootOwner || target.id === actor.id) {
      res.status(403).json({ message: 'The primary owner account cannot be deleted.' });
      return;
    }
    await User.deleteOne({ id: targetId });
    res.json({ success: true, id: targetId, username: target.username });
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

    if (target.rootOwner && actor.id !== target.id) {
      res.status(403).json({ message: 'The primary owner account cannot be modified by delegated staff.' });
      return;
    }

    if (requestedRole) {
      const rank: Record<string, number> = { member: 0, staff: 1, 'co-owner': 2, owner: 3 };
      const currentRank = rank[target.role] ?? 0;
      const requestedRank = rank[requestedRole] ?? 0;
      const isDemotion = requestedRank < currentRank;
      const isPromotion = requestedRank > currentRank;
      if (actor.rootOwner) {
        // Primary owner may manage every role except their own account.
      } else if (isDemotion) {
        if (!actor.canDemote) {
          res.status(403).json({ message: 'You do not have demotion permission.' });
          return;
        }
        if (target.role === 'owner' || target.role === 'co-owner' || requestedRole === 'owner') {
          res.status(403).json({ message: 'Only the primary owner can change owner/co-owner roles.' });
          return;
        }
      } else if (isPromotion) {
        if (!actor.canManageRoles) {
          res.status(403).json({ message: 'You do not have role-management permission.' });
          return;
        }
        if (requestedRank >= (rank[actor.role] ?? 0)) {
          res.status(403).json({ message: 'You cannot promote an account to your own level or higher.' });
          return;
        }
      }
    }

    if (premium !== undefined) {
      if (!actor.rootOwner && !actor.canManagePremium) {
        res.status(403).json({ message: 'You do not have premium-management permission.' });
        return;
      }
      if (!actor.rootOwner && ['owner','co-owner'].includes(target.role)) {
        res.status(403).json({ message: 'Delegated staff cannot change premium status for owners or co-owners.' });
        return;
      }
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

    if (!actor.rootOwner && !actor.canCustomizeUsers) {
      res.status(403).json({ message: 'You do not have user-customization permission.' });
      return;
    }
    if (!actor.rootOwner && actor.role === 'staff' && target.role !== 'member') {
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

router.post('/users/:id/badges', async (req, res, next) => {
  try {
    const actor = (req as any).actor;
    if (!actor.rootOwner && !actor.canManageBadges) {
      res.status(403).json({ message: 'You do not have badge-management permission.' });
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
    if (!actor.rootOwner && !actor.canManageBadges) { res.status(403).json({ message: 'You do not have badge-management permission.' }); return; }
    const target = await User.findOne({ id: Number(req.params.id) });
    if (!target) { res.status(404).json({ message: 'User not found.' }); return; }
    const badge = decodeURIComponent(req.params.badge);
    target.badges = target.badges.filter((item: string) => item !== badge);
    await target.save();
    res.json({ badges: target.badges });
  } catch (error) { next(error); }
});

router.patch('/users/:id/permissions', async (req,res,next)=>{
  try{
    const actor=(req as any).actor;
    if(!actor.rootOwner){res.status(403).json({message:'Only the primary owner can grant moderation permissions.'});return;}
    const target=await User.findOne({id:Number(req.params.id)});
    if(!target){res.status(404).json({message:'User not found.'});return;}
    if(target.rootOwner){res.status(400).json({message:'The primary owner already has every permission.'});return;}
    const allowed=['canBan','canDemote','canManageRoles','canManagePremium','canManageBadges','canCustomizeUsers'] as const;
    for(const key of allowed) if(typeof req.body?.[key]==='boolean') (target as any)[key]=req.body[key];
    await target.save();
    res.json({id:target.id,username:target.username,rootOwner:target.rootOwner,canBan:target.canBan,canDemote:target.canDemote,canManageRoles:target.canManageRoles,canManagePremium:target.canManagePremium,canManageBadges:target.canManageBadges,canCustomizeUsers:target.canCustomizeUsers});
  }catch(error){next(error);}
});

const canModerateTarget=(actor:any,target:any,kind:'ban'|'unban')=>{
  if(target.rootOwner) return 'The primary owner account cannot be moderated.';
  if(actor.rootOwner) return null;
  if(kind==='ban'&&!actor.canBan) return 'You do not have ban permission.';
  if(kind==='unban'&&!actor.canBan) return 'You do not have ban permission.';
  const rank:Record<string,number>={member:0,staff:1,'co-owner':2,owner:3};
  if((rank[target.role]??0)>=(rank[actor.role]??0)) return 'You can only moderate accounts below your role.';
  return null;
};

router.post('/users/:id/ban', async(req,res,next)=>{
  try{
    const actor=(req as any).actor; const target=await User.findOne({id:Number(req.params.id)});
    if(!target){res.status(404).json({message:'User not found.'});return;}
    const denial=canModerateTarget(actor,target,'ban'); if(denial){res.status(403).json({message:denial});return;}
    const releasedUsername=target.username;
    target.banned=true; target.banReason=typeof req.body?.reason==='string'?req.body.reason.trim().slice(0,500):''; target.bannedAt=new Date(); target.bannedBy=actor.id;
    (target as any).bannedUsername=releasedUsername;
    (target as any).username=undefined;
    target.aliases=[];
    target.badges=[];
    await Promise.all([Link.deleteMany({userId:target._id}),ProfileComment.deleteMany({profileUserId:target._id})]);
    await target.save(); res.json({id:target.id,username:releasedUsername,banned:true,usernameReleased:true,banReason:target.banReason});
  }catch(error){next(error);}
});

router.delete('/users/:id/ban', async(req,res,next)=>{
  try{
    const actor=(req as any).actor; const target=await User.findOne({id:Number(req.params.id)}).select('+bannedUsername');
    if(!target){res.status(404).json({message:'User not found.'});return;}
    const denial=canModerateTarget(actor,target,'unban'); if(denial){res.status(403).json({message:denial});return;}
    const priorUsername=(target as any).bannedUsername as string|undefined;
    let restoredUsername='';
    if(priorUsername){const conflict=await User.findOne({$or:[{username:priorUsername},{aliases:priorUsername}],_id:{$ne:target._id}}).select('_id');if(!conflict){target.username=priorUsername;restoredUsername=priorUsername;}}
    target.banned=false; target.banReason=''; target.bannedAt=undefined; target.bannedBy=undefined; (target as any).bannedUsername=undefined;
    await target.save(); res.json({id:target.id,username:restoredUsername,banned:false,usernameNeedsAssignment:!restoredUsername});
  }catch(error){next(error);}
});

router.get('/badge-definitions', async (_req,res,next)=>{
  try { res.json(await Badge.find({}).sort({name:1}).lean()); } catch(error){ next(error); }
});

router.post('/badge-definitions', async (req,res,next)=>{
  try {
    const actor=(req as any).actor;
    if(actor.role!=='owner'){res.status(403).json({message:'Only the owner can create badge definitions.'});return;}
    const body=req.body||{};
    const name=typeof body.name==='string'?body.name.trim().slice(0,32):'';
    if(!name){res.status(400).json({message:'Badge name is required.'});return;}
    const image=typeof body.image==='string'?body.image.slice(0,200000):'';
    const fontFamily=typeof body.fontFamily==='string'?body.fontFamily.trim().slice(0,80)||'Inter':'Inter';
    const textColor=typeof body.textColor==='string'?body.textColor:'#f4f0ef';
    const accentColor=typeof body.accentColor==='string'?body.accentColor:'#ef3340';
    const animation=['none','pulse','float','spin','bounce','glow'].includes(body.animation)?body.animation:'none';
    if(!/^#[0-9a-fA-F]{6}$/.test(textColor)||!/^#[0-9a-fA-F]{6}$/.test(accentColor)){res.status(400).json({message:'Badge colors must be six-digit hex values.'});return;}
    const badge=await Badge.findOneAndUpdate({name},{name,image,fontFamily,textColor,accentColor,animation,description:typeof body.description==='string'?body.description.slice(0,160):'',selfClaimable:body.selfClaimable===true,available:body.available!==false,showOnProfiles:body.showOnProfiles!==false,requiredPremium:body.requiredPremium===true,requiredRole:['member','staff','co-owner','owner'].includes(body.requiredRole)?body.requiredRole:'member',maxHolders:typeof body.maxHolders==='number'?Math.min(1000000,Math.max(0,Math.floor(body.maxHolders))):0},{new:true,upsert:true,setDefaultsOnInsert:true});
    res.json(badge);
  } catch(error){next(error);}
});

router.delete('/badge-definitions/:name', async (req,res,next)=>{
  try {
    const actor=(req as any).actor;
    if(actor.role!=='owner'){res.status(403).json({message:'Only the owner can delete badge definitions.'});return;}
    await Badge.deleteOne({name:decodeURIComponent(req.params.name)});
    res.json({message:'Badge definition deleted.'});
  } catch(error){next(error);}
});

router.get('/badges', async (_req,res,next)=>{try{const users=await User.find({badges:{$exists:true,$ne:[]}}).select('username badges').lean();const names=[...new Set(users.flatMap((u:any)=>u.badges||[]))];res.json(names.map(name=>({name,holders:users.filter((u:any)=>(u.badges||[]).includes(name)).length})));}catch(error){next(error)}});

export default router;
