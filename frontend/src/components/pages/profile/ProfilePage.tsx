import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowUpRight, AudioLines, Instagram, Youtube, Twitch, Github, Globe, Linkedin, Mail, Play, X, Disc3, BadgeCheck, Eye, MapPin, MessageCircle, Sparkles,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { API_URL } from '@/services/api';
import logo from '../../../../public/p.png'
interface UserProfile {
  id: number; username: string; name: string; description: string | null; profilePicture: string | null;
  accentColor?: string; textColor?: string; backgroundColor?: string; backgroundMedia: string | null;
  backgroundType: 'image' | 'video' | null;
  usernameEffect?: string; backgroundEffect?: string; cursorEffect?: string; syncToBackground?: boolean;
  fontFamily?: string; customFontFamily?: string; customFontUrl?: string; verified?: boolean;
  profileOpacity?: number; profileBlur?: number; backgroundOpacity?: number; cardOpacity?: number; cardBlur?: number;
  audioUrl?: string;
  audioTitle?: string;
  audioAutoplay?: boolean;
  audioCoverUrl?: string;
  totalVisit?: number;
  location?: string;
  showLocation?: boolean;
  showDiscordPresence?: boolean;
  discordUsername?: string;
  badges?: string[];
  aliases?: string[];
  role?: 'owner'|'co-owner'|'staff'|'member'; roleLabel?: string;
  profileLayout?: 'default'|'compact'|'wide'|'minimal'|'split'; cardStyle?: 'glass'|'solid'|'outline'|'floating'; cardRadius?: number;
  linkRadius?: number; linkSpacing?: number; linkOpacity?: number; linkBlur?: number; avatarSize?: number; avatarShape?: 'circle'|'rounded'|'square'; avatarGlow?: boolean; showViews?: boolean; showStatus?: boolean; showBranding?: boolean; accentGlow?: number;
  pageEnterEffect?: 'fade'|'rise'|'zoom'|'blur'|'none'; particleEffect?: 'none'|'dust'|'embers'|'stars'|'ghosts'; typewriterEnabled?: boolean; typewriterTexts?: string[]; typewriterSpeed?: number; typewriterLoop?: boolean; pageEnterText?: string; pageClickSound?: string; metadataTitle?: string; metadataDescription?: string; metadataImage?: string; animatedTitle?: boolean; monochromeIcons?: boolean; customCss?: string;
  links: Array<{ _id?: string; id?: number; title: string; url: string; }>;
}
const normalizeLinkUrl = (rawUrl: string): string | null => {
  const value = rawUrl.trim();
  if (!value) return null;
  if (/^mailto:/i.test(value)) return value;
  if (/^(https?:\/\/)/i.test(value)) {
    try {
      const parsed = new URL(value);
      return ['http:', 'https:'].includes(parsed.protocol) ? parsed.href : null;
    } catch {
      return null;
    }
  }

  const candidate = `https://${value.replace(/^\/\//, '')}`;
  try {
    const parsed = new URL(candidate);
    return ['http:', 'https:'].includes(parsed.protocol) ? parsed.href : null;
  } catch {
    return null;
  }
};
const getLinkIcon = (url: string) => {
  const domain = url.toLowerCase();
  if (domain.includes('x.com')) return X;
  if (domain.includes('instagram.com')) return Instagram;
  if (domain.includes('youtube.com')) return Youtube;
  if (domain.includes('twitch.tv')) return Twitch;
  if (domain.includes('github.com')) return Github;
  if (domain.includes('mailto:')) return Mail;
  if (domain.includes('linkedin')) return Linkedin;
  return Globe;
};
const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [cursorTrail,setCursorTrail] = useState<{x:number;y:number;id:number}[]>([]);
  const [typewriterText,setTypewriterText] = useState('');
  const clickAudioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(()=>{
    if(profile?.cursorEffect !== 'red') { setCursorTrail([]); return; }
    let frame=0; let nextId=0; let points:{x:number;y:number;id:number}[]=[];
    const move=(e:MouseEvent)=>{points=[...points.slice(-10),{x:e.clientX,y:e.clientY,id:nextId++}];};
    const tick=()=>{setCursorTrail(points);frame=requestAnimationFrame(tick);};
    window.addEventListener('mousemove',move,{passive:true}); frame=requestAnimationFrame(tick);
    return()=>{window.removeEventListener('mousemove',move);cancelAnimationFrame(frame);};
  },[profile?.cursorEffect]);
  useEffect(() => {
    if (!profile) return;
    document.title = profile.metadataTitle || `${profile.username} | suffer.info`;
    const desc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (desc) desc.content = profile.metadataDescription || profile.description || '';
    if (profile.metadataImage) {
      let og = document.querySelector('meta[property="og:image"]') as HTMLMetaElement | null;
      if (!og) { og = document.createElement('meta'); og.setAttribute('property','og:image'); document.head.appendChild(og); }
      og.content = profile.metadataImage;
    }
  }, [profile]);
  useEffect(() => {
    if (!profile?.typewriterEnabled || !(profile.typewriterTexts || []).length) { setTypewriterText(''); return; }
    const texts = profile.typewriterTexts || [];
    let index = 0, cancelled = false, timer: number | undefined;
    const run = () => { const target = texts[index] || ''; let pos = 0; setTypewriterText(''); const tick = () => { if (cancelled) return; setTypewriterText(target.slice(0,pos++)); if (pos <= target.length) timer = window.setTimeout(tick, Math.max(20, profile.typewriterSpeed || 70)); else if (profile.typewriterLoop !== false) timer = window.setTimeout(() => { index=(index+1)%texts.length; run(); }, 900); }; tick(); };
    run(); return () => { cancelled=true; if (timer) window.clearTimeout(timer); };
  }, [profile?.typewriterEnabled, profile?.typewriterTexts, profile?.typewriterSpeed, profile?.typewriterLoop]);
  useEffect(() => {
    if (!profile?.pageClickSound) return;
    clickAudioRef.current = new Audio(profile.pageClickSound);
    clickAudioRef.current.volume = .3;
    const onClick = () => { const audio = clickAudioRef.current; if (!audio) return; audio.currentTime=0; void audio.play().catch(()=>{}); };
    window.addEventListener('click', onClick); return () => window.removeEventListener('click', onClick);
  }, [profile?.pageClickSound]);
  useEffect(() => {
    document.title = `${username} | suffer.info`;
    let isCurrent = true;
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_URL}/users/${username}`);
        if (!response.ok) throw new Error('Profile not found');
        const data: UserProfile = await response.json();
        if (isCurrent) setProfile(data);
      } catch {
        if (isCurrent) toast.error('Failed to load profile');
      } finally {
        if (isCurrent) setLoading(false);
      }
    };
    setLoading(true); setProfile(null); void fetchProfile();
    return () => { isCurrent = false; };
  }, [username]);
  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] text-sm text-[#a39b9c]">
      <span className="mr-3 h-2 w-2 animate-pulse rounded-full bg-[#ef3340]" />Loading profile
    </div>
  );
  if (!profile) return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#050505] px-5 text-center text-white">
      <img src={logo} alt="suffer.info" className="mb-5 h-14 w-14 rounded-xl border border-white/10" />
      <h1 className="text-2xl font-bold">This profile isn’t here.</h1>
      <p className="mt-2 text-sm text-[#928a8b]">The username may be unavailable or misspelled.</p>
      <button onClick={() => navigate('/')} className="mt-6 inline-flex h-10 items-center rounded-full border border-[#ef3340]/60 bg-[#ef3340]/15 px-4 text-sm font-semibold text-white transition-colors hover:bg-[#ef3340]/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef3340]">Back to suffer.info</button>
    </div>
  );
  const aliases = (profile.aliases || []).slice(0, 2);
  const cardRadius = Math.max(0, Math.min(48, profile.cardRadius ?? 28));
  const avatarSize = Math.max(64, Math.min(180, profile.avatarSize ?? 104));
  const linkRadius = Math.max(0, Math.min(32, profile.linkRadius ?? 16));
  const linkOpacity = Math.max(0, Math.min(0.2, profile.linkOpacity ?? 0.025));
  const linkBlur = Math.max(0, Math.min(40, profile.linkBlur ?? 0));
  const linkSpacing = Math.max(4, Math.min(28, profile.linkSpacing ?? 12));
  const { profilePicture, backgroundMedia, backgroundType, audioUrl, audioTitle, audioAutoplay = false, audioCoverUrl, name, description, links, username: profileUsername, usernameEffect = 'none', backgroundEffect = 'none', cursorEffect = 'none', fontFamily = 'Inter', customFontFamily = '', customFontUrl = '' } = profile;
  const accentColor = profile.accentColor || '#ef3340';
  const bgOpacity = Math.max(0, Math.min(1, profile.backgroundOpacity ?? 1));
  const cardOpacity = Math.max(0, Math.min(1, profile.cardOpacity ?? profile.profileOpacity ?? 0.92));
  const cardBlur = Math.max(0, Math.min(40, profile.cardBlur ?? profile.profileBlur ?? 0));
  const resolvedFont = customFontFamily || fontFamily || 'Inter';
  const textColor = profile.textColor || '#f4f0ef';
  const syncedMotion = profile.syncToBackground ? (backgroundEffect === 'pulse' || backgroundEffect === 'aurora' || backgroundEffect === 'halo' || backgroundEffect === 'breathe' ? { opacity: [1, .78, 1], scale: [1, 1.015, 1] } : backgroundEffect === 'drift' || backgroundEffect === 'waves' ? { y: [0, -4, 0] } : backgroundEffect === 'orbit' || backgroundEffect === 'radar' ? { rotate: [0, 1.5, -1.5, 0] } : {}) : {};
  const usernameAnimation = profile.syncToBackground ? syncedMotion : usernameEffect === 'pulse' ? { scale: [1, 1.04, 1] } : usernameEffect === 'float' ? { y: [0, -5, 0] } : usernameEffect === 'shake' ? { x: [0, -3, 3, -2, 2, 0] } : usernameEffect === 'glow' ? { textShadow: ['0 0 0px '+accentColor, '0 0 22px '+accentColor, '0 0 0px '+accentColor] } : usernameEffect === 'bounce' ? { y: [0,-10,0,-5,0] } : usernameEffect === 'tilt' ? { rotate: [-2,2,-1,1,0] } : usernameEffect === 'zoom' ? { scale: [1,1.08,1] } : usernameEffect === 'blur' ? { filter: ['blur(0px)','blur(2px)','blur(0px)'] } : usernameEffect === 'flash' ? { opacity: [1,.45,1] } : usernameEffect === 'swing' ? { rotate: [-4,4,-3,3,0] } : usernameEffect === 'jelly' ? { scaleX: [1,1.08,.94,1.04,1], scaleY: [1,.94,1.06,.98,1] } : usernameEffect === 'heartbeat' ? { scale: [1,1.05,1,1.05,1] } : usernameEffect === 'neon' ? { textShadow: ['0 0 4px #fff, 0 0 12px '+accentColor,'0 0 14px '+accentColor+', 0 0 28px '+accentColor,'0 0 4px #fff, 0 0 12px '+accentColor] } : usernameEffect === 'rainbow' ? { filter: ['hue-rotate(0deg)','hue-rotate(180deg)','hue-rotate(360deg)'] } : {};
  const usernameAnimationTransition = usernameEffect === 'none' ? {} : { duration: usernameEffect === 'heartbeat' ? 1.1 : 2.2, repeat: Infinity, ease: 'easeInOut' as const };
  const backgroundClass = backgroundEffect === 'aurora' ? 'animate-pulse' : backgroundEffect === 'pulse' ? 'animate-[pulse_4s_ease-in-out_infinite]' : backgroundEffect === 'scanlines' ? 'opacity-70' : '';
  const backgroundGfx = backgroundEffect === 'grid' ? 'bg-[linear-gradient(rgba(239,51,64,.10)_1px,transparent_1px),linear-gradient(90deg,rgba(239,51,64,.10)_1px,transparent_1px)] bg-[size:42px_42px] animate-[pulse_3s_ease-in-out_infinite]' : backgroundEffect === 'waves' ? 'bg-[radial-gradient(ellipse_at_50%_120%,rgba(239,51,64,.24),transparent_60%)] animate-pulse' : backgroundEffect === 'vignette' ? 'bg-[radial-gradient(circle,transparent_35%,rgba(0,0,0,.72)_100%)]' : backgroundEffect === 'spotlight' ? 'bg-[radial-gradient(circle_at_50%_35%,rgba(239,51,64,.22),transparent_35%)]' : backgroundEffect === 'halo' ? 'bg-[radial-gradient(circle,rgba(239,51,64,.18),transparent_32%)] animate-pulse' : backgroundEffect === 'radar' ? 'bg-[radial-gradient(circle,transparent_0,transparent_24%,rgba(239,51,64,.16)_25%,transparent_26%,transparent_49%,rgba(239,51,64,.12)_50%,transparent_51%)] animate-[spin_10s_linear_infinite]' : backgroundEffect === 'noise' ? 'opacity-20 mix-blend-screen' : '';
  const backgroundGfxStyle = backgroundEffect === 'flicker' ? { animation: 'pulse 1.15s ease-in-out infinite' } : backgroundEffect === 'drift' ? { animation: 'pulse 6s ease-in-out infinite' } : backgroundEffect === 'breathe' ? { animation: 'pulse 4s ease-in-out infinite' } : backgroundEffect === 'orbit' ? { animation: 'spin 14s linear infinite' } : {};
  const validLinks = links.flatMap((link) => {
    const safeUrl = normalizeLinkUrl(link.url);
    return safeUrl ? [{ ...link, safeUrl }] : [];
  });
  return (
    <>
    {customFontUrl && <style>{`@font-face{font-family:'LostCustom';src:url(${JSON.stringify(customFontUrl)}) format('truetype');font-display:swap;}`}</style>}
    <main className={`relative isolate flex min-h-screen ${cursorEffect === 'glow' ? 'cursor-crosshair' : ''} ${cursorEffect === 'red' ? 'cursor-none' : ''} items-center justify-center overflow-hidden px-4 py-16 sm:px-6`} style={{ backgroundColor: profile.backgroundColor || '#050505', color: textColor, fontFamily: resolvedFont }}>
      {cursorEffect === 'red' && cursorTrail.map((p,i)=><span key={p.id} aria-hidden="true" className="pointer-events-none fixed z-[100] h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ef3340] shadow-[0_0_18px_#ef3340] transition-opacity duration-150" style={{left:p.x,top:p.y,opacity:(i+1)/cursorTrail.length,transform:`translate(-50%,-50%) scale(${0.45+(i+1)/cursorTrail.length*.7})`}}/>)}
      {backgroundMedia && backgroundType === 'image' && <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center" style={{ backgroundImage: `url(${backgroundMedia})`, opacity: bgOpacity }} />}
      {backgroundMedia && backgroundType === 'video' && <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"><video autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover" style={{ opacity: bgOpacity }}><source src={backgroundMedia} type="video/mp4" /></video></div>}
      <div aria-hidden="true" className={`pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_20%,rgba(239,51,64,.18),transparent_42%)] ${backgroundClass}`} style={{opacity:bgOpacity}} />
      <div aria-hidden="true" className={`pointer-events-none absolute inset-0 -z-10 ${backgroundGfx}`} style={{...backgroundGfxStyle,opacity:bgOpacity}} />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.018)_1px,transparent_1px)] bg-[size:52px_52px] [mask-image:linear-gradient(to_bottom,black,transparent_82%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ef3340]/[0.07] blur-[100px]" />
      <motion.a href="/" aria-label="suffer.info home" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45 }} className="absolute left-5 top-5 z-10 inline-flex items-center gap-2 text-sm font-bold tracking-tight text-white sm:left-8 sm:top-7">
        <span className="grid h-8 w-8 place-items-center rounded-[10px] border border-[#ef3340]/35 bg-[#ef3340]/10 text-[#ff5b67] shadow-[0_0_25px_rgba(239,51,64,.12)]"><AudioLines size={16} /></span>
        suffer<span className="-ml-2 text-[#ef3340]">.info</span>
      </motion.a>
      
      <motion.section initial={{ opacity: 0, y: 22, scale: .985 }} className="w-full max-w-[560px] overflow-hidden" animate={profile.syncToBackground ? syncedMotion : { opacity: 1, y: 0, scale: 1 }} transition={profile.syncToBackground ? {duration: backgroundEffect === 'flicker' ? 1.15 : 3, repeat: Infinity, ease: 'easeInOut'} : { duration: .55, ease: [0.22, 1, 0.36, 1] }} style={{backgroundColor:profile.cardStyle==='solid'?`rgba(11,11,13,${cardOpacity})`:`rgba(8,8,8,${cardOpacity})`,backdropFilter:cardBlur > 0 ? `blur(${cardBlur}px)` : 'none',borderRadius:cardRadius,border: 'none',boxShadow:cardOpacity > 0 ? '0 35px 120px rgba(0,0,0,.25),0 0 70px rgba(239,51,64,.04)' : 'none'}}>
        <div className="hidden" />
        <div className="px-6 pb-7 pt-9 sm:px-10 sm:pb-9 sm:pt-11">
          <div className="mx-auto flex max-w-[420px] flex-col items-center text-center">
            <motion.div initial={{ opacity: 0, scale: .8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: .08, duration: .5, type: 'spring', stiffness: 170 }} className="relative mb-5" style={{width:avatarSize,height:avatarSize}}>
              
              <img src={profilePicture || '/p.png'} alt={`${name}'s profile`} className="relative h-full w-full border border-white/15 bg-[#120708] object-cover" style={{borderRadius:profile.avatarShape==='square'?'14px':profile.avatarShape==='rounded'?'28%':'9999px'}} />
            </motion.div>
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .2 }} className="text-[11px] font-semibold uppercase tracking-[.2em]" style={{ color: accentColor }}>@{profileUsername}</motion.span>
            <motion.h1 initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0, ...usernameAnimation }} transition={{ delay: .24, ...usernameAnimationTransition }} className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: textColor }}>{name}{profile.verified ? <BadgeCheck size={21} className="ml-2 inline-block align-middle" /> : null}</motion.h1>{typewriterText&&<p className="mt-1 text-xs uppercase tracking-[.18em]" style={{color:accentColor}}>{typewriterText}</p>}{profile.role&&profile.role!=='member'&&<span className="mt-2 inline-flex rounded-full border border-[#ef3340]/25 bg-[#ef3340]/[.07] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.15em]" style={{color:accentColor}}>{profile.roleLabel||profile.role}</span>}
            {aliases.length ? <div className="mt-3 flex flex-wrap justify-center gap-2">{aliases.map(alias=><a key={alias} href={`/${alias}`} className="rounded-full border border-[#ef3340]/20 bg-[#ef3340]/[0.06] px-3 py-1 text-[10px] font-semibold tracking-wide text-zinc-300 transition hover:border-[#ef3340]/45 hover:text-white">@{alias}</a>)}</div> : null}
            
            {description && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .3 }} className="mt-3 max-w-[360px] whitespace-pre-wrap text-sm leading-6" style={{ color: textColor, opacity: 0.72 }}>{description}</motion.p>}
          </div>
          {audioUrl && <div className="mx-auto mt-7 max-w-[420px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#121212] shadow-[0_12px_35px_rgba(0,0,0,.22)]">
  <audio ref={audioRef} preload="metadata" autoPlay={audioAutoplay} src={audioUrl}>Your browser does not support audio playback.</audio>
  <div className="p-3.5 sm:p-4">
    <div className="flex items-center gap-3">
      <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-md bg-[#202020]">{audioCoverUrl?<img src={audioCoverUrl} alt="" className="h-full w-full object-cover"/>:<Disc3 size={25} className="text-zinc-500"/>}</div>
      <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-white">{audioTitle || 'Profile music'}</p><p className="mt-0.5 truncate text-[11px] text-zinc-500">@{profileUsername}</p></div>
      <button type="button" aria-label="Play or pause profile music" onClick={async()=>{const a=audioRef.current;if(!a)return;if(a.paused){try{await a.play();}catch{}}else a.pause();}} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-black transition-transform hover:scale-105"><Play size={17} fill="currentColor"/></button>
    </div>
    <div className="mt-4 h-1 rounded-full bg-[#3a3a3a]"><div className="h-full w-[28%] rounded-full bg-white"/></div>
    <div className="mt-1.5 flex justify-between text-[9px] text-zinc-500"><span>0:00</span><span>—</span></div>
  </div>
</div>}
          <div className="mx-auto mt-4 grid max-w-[420px] grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3 text-left">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.14em] text-zinc-500"><Eye size={13} /> Views</div>
              <div className="mt-1 text-sm font-bold" style={{color:textColor}}>{(profile.totalVisit ?? 0).toLocaleString()}</div>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3 text-left">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.14em] text-zinc-500"><Sparkles size={13} /> Status</div>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-bold" style={{color:textColor}}><span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.7)]" /> Online</div>
            </div>
          </div>
          {(profile.showDiscordPresence || profile.showLocation) && <div className="mx-auto mt-3 max-w-[420px] rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3">
            <div className="flex flex-wrap items-center gap-2">
              {profile.showDiscordPresence && <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-[#5865f2]/20 bg-[#5865f2]/[0.07] px-3 py-2.5">
                <MessageCircle size={17} className="shrink-0 text-[#7289da]" />
                <div className="min-w-0"><div className="text-[10px] font-semibold uppercase tracking-[.12em] text-zinc-500">Discord</div><div className="truncate text-xs font-semibold" style={{color:textColor}}>{profile.discordUsername || 'Connected'}</div></div>
              </div>}
              {profile.showLocation && profile.location && <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-white/[0.08] bg-black/20 px-3 py-2.5">
                <MapPin size={17} className="shrink-0" style={{color:accentColor}} />
                <div className="min-w-0"><div className="text-[10px] font-semibold uppercase tracking-[.12em] text-zinc-500">Location</div><div className="truncate text-xs font-semibold" style={{color:textColor}}>{profile.location}</div></div>
              </div>}
            </div>
          </div>}
          {profile.badges?.length ? <div className="mx-auto mt-3 flex max-w-[420px] flex-wrap justify-center gap-2">{profile.badges.slice(0,8).map(b=><span key={b} className="inline-flex items-center gap-1.5 rounded-full border border-[#ef3340]/20 bg-[#ef3340]/[0.06] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[.08em]" style={{color:textColor}}><BadgeCheck size={12} style={{color:accentColor}} />{b}</span>)}</div> : null}
          <div className="mx-auto mt-8 max-w-[420px]" style={{display:'flex',flexDirection:'column',gap:linkSpacing}}>
            {validLinks.map((link, index) => { const IconComponent = getLinkIcon(link.url); return (
              <motion.a key={link._id || link.id || link.url} href={link.safeUrl} target={link.safeUrl.startsWith('mailto:') ? undefined : '_blank'} rel={link.safeUrl.startsWith('mailto:') ? undefined : 'noopener noreferrer'} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .34 + index * .055, duration: .35 }} whileHover={{ y: -2, scale: 1.012 }} whileTap={{ scale: .965 }} className="group flex min-h-14 items-center gap-3 border border-white/[0.08] bg-white/[0.025] px-4 text-left shadow-[inset_0_1px_rgba(255,255,255,.025)] transition-colors duration-200 hover:border-[#ef3340]/55 hover:bg-[#ef3340]/[0.07] hover:shadow-[0_8px_30px_rgba(239,51,64,.09)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef3340]" style={{borderRadius:linkRadius,backgroundColor:`rgba(255,255,255,${linkOpacity})`,backdropFilter:`blur(${linkBlur}px)`}}>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/[0.08] bg-black/40 transition-all duration-200 group-hover:border-[#ef3340]/30 group-hover:bg-[#ef3340]/10" style={{ color: accentColor }}><IconComponent size={17} /></span>
                <span className="min-w-0 flex-1 truncate text-sm font-semibold" style={{ color: textColor }}>{link.title || 'Open link'}</span>
                <ArrowUpRight size={16} className="shrink-0 text-[#777173] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#ff6872]" />
              </motion.a>
            ); })}
          </div>
          {validLinks.length === 0 && <p className="mt-8 text-center text-xs text-[#746d6e]">No links added yet.</p>}
          <div className="mx-auto mt-8 flex max-w-[420px] items-center justify-between border-t border-white/[0.08] pt-4 text-[10px] font-semibold uppercase tracking-[.14em] text-[#716a6b]"><span>suffer.info/{profileUsername}</span><span>Made with <span style={{ color: accentColor }}>suffer.info</span></span></div>
        </div>
      </motion.section>
    </main>
    </>
  );
};
export default ProfilePage;

// Production refresh marker: keep Vercel's Git deployment in sync with main.
