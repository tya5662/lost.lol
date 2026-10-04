import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowUpRight, AudioLines, Instagram, Youtube, Twitch, Github, Globe, Linkedin, Mail, Pause, Play, X, Disc3, BadgeCheck,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { API_URL } from '@/services/api';
import logo from '../../../../public/p.png'
interface UserProfile {
  id: number; username: string; name: string; description: string | null; profilePicture: string | null;
  accentColor?: string; textColor?: string; backgroundColor?: string; backgroundMedia: string | null;
  backgroundType: 'image' | 'video' | null;
  usernameEffect?: string; backgroundEffect?: string; cursorEffect?: string;
  fontFamily?: string; customFontFamily?: string; verified?: boolean;
  customEmojis?: Array<{name:string;value:string}>;
  profileOpacity?: number; backgroundOpacity?: number; cardOpacity?: number; cardBlur?: number;
  audioUrl?: string;
  audioTitle?: string;
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
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [musicBlocked, setMusicBlocked] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cursorTrail,setCursorTrail] = useState<{x:number;y:number;id:number}[]>([]);
  useEffect(()=>{
    if(profile?.cursorEffect !== 'red') { setCursorTrail([]); return; }
    let frame=0; let nextId=0; let points:{x:number;y:number;id:number}[]=[];
    const move=(e:MouseEvent)=>{points=[...points.slice(-10),{x:e.clientX,y:e.clientY,id:nextId++}];};
    const tick=()=>{setCursorTrail(points);frame=requestAnimationFrame(tick);};
    window.addEventListener('mousemove',move,{passive:true}); frame=requestAnimationFrame(tick);
    return()=>{window.removeEventListener('mousemove',move);cancelAnimationFrame(frame);};
  },[profile?.cursorEffect]);
  useEffect(() => {
    document.title = `${username} | lost.lol`;
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
      <img src={logo} alt="lost.lol" className="mb-5 h-14 w-14 rounded-xl border border-white/10" />
      <h1 className="text-2xl font-bold">This profile isn’t here.</h1>
      <p className="mt-2 text-sm text-[#928a8b]">The username may be unavailable or misspelled.</p>
      <button onClick={() => navigate('/')} className="mt-6 inline-flex h-10 items-center rounded-full border border-[#ef3340]/60 bg-[#ef3340]/15 px-4 text-sm font-semibold text-white transition-colors hover:bg-[#ef3340]/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef3340]">Back to lost.lol</button>
    </div>
  );
  const { profilePicture, backgroundMedia, backgroundType, audioUrl, audioTitle, name, description, links, username: profileUsername, usernameEffect = 'none', backgroundEffect = 'none', cursorEffect = 'none', fontFamily = 'Inter', customFontFamily = '', verified = false, customEmojis = [] } = profile;
  const accentColor = profile.accentColor || '#ef3340';
  const bgOpacity = Math.max(0.25, Math.min(1, profile.backgroundOpacity ?? 1));
  const cardOpacity = Math.max(0.25, Math.min(1, profile.cardOpacity ?? profile.profileOpacity ?? 0.92));
  const cardBlur = Math.max(0, Math.min(40, profile.cardBlur ?? profile.profileBlur ?? 18));
  const resolvedFont = customFontFamily || fontFamily || 'Inter';
  const textColor = profile.textColor || '#f4f0ef';
  const usernameAnimation = usernameEffect === 'pulse' ? { scale: [1, 1.035, 1] } : usernameEffect === 'float' ? { y: [0, -4, 0] } : usernameEffect === 'shake' ? { x: [0, -2, 2, -2, 0] } : usernameEffect === 'glow' ? { textShadow: [`0 0 0px ${accentColor}`, `0 0 18px ${accentColor}`, `0 0 0px ${accentColor}`] } : {};
  const usernameAnimationTransition = usernameEffect === 'none' ? {} : { duration: 2.2, repeat: Infinity, ease: 'easeInOut' as const };
  const backgroundClass = backgroundEffect === 'aurora' ? 'animate-pulse' : backgroundEffect === 'pulse' ? 'animate-[pulse_4s_ease-in-out_infinite]' : backgroundEffect === 'scanlines' ? 'opacity-70' : '';
  const toggleVideo = async () => {
    const video = videoRef.current; if (!video) return;
    if (video.paused) { try { await video.play(); setIsVideoPlaying(true); } catch { setIsVideoPlaying(false); } }
    else { video.pause(); setIsVideoPlaying(false); }
  };
  const validLinks = links.flatMap((link) => {
    const safeUrl = normalizeLinkUrl(link.url);
    return safeUrl ? [{ ...link, safeUrl }] : [];
  });
  return (
    <main className={`relative isolate flex min-h-screen ${cursorEffect === 'glow' ? 'cursor-crosshair' : ''} ${cursorEffect === 'red' ? 'cursor-none' : ''} items-center justify-center overflow-hidden px-4 py-16 sm:px-6`} style={{ backgroundColor: profile.backgroundColor || '#050505', color: textColor, fontFamily: resolvedFont }}>
      {cursorEffect === 'red' && cursorTrail.map((p,i)=><span key={p.id} aria-hidden="true" className="pointer-events-none fixed z-[100] h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ef3340] shadow-[0_0_18px_#ef3340] transition-opacity duration-150" style={{left:p.x,top:p.y,opacity:(i+1)/cursorTrail.length,transform:`translate(-50%,-50%) scale(${0.45+(i+1)/cursorTrail.length*.7})`}}/>)}
      {backgroundMedia && backgroundType === 'image' && <div aria-hidden="true" className="absolute inset-0 -z-10 scale-110 bg-cover bg-center opacity-25 blur-3xl" style={{ backgroundImage: `url(${backgroundMedia})` }} />}
      {backgroundMedia && backgroundType === 'video' && <div className="absolute inset-0 -z-10 overflow-hidden"><video ref={videoRef} autoPlay loop playsInline onPlay={() => setIsVideoPlaying(true)} onPause={() => setIsVideoPlaying(false)} className="absolute inset-0 h-full w-full scale-105 object-cover opacity-25 blur-xl"><source src={backgroundMedia} type="video/mp4" /></video></div>}
      <div aria-hidden="true" className={`pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_20%,rgba(239,51,64,.18),transparent_42%)] ${backgroundClass}`} style={{opacity:bgOpacity}} />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.018)_1px,transparent_1px)] bg-[size:52px_52px] [mask-image:linear-gradient(to_bottom,black,transparent_82%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ef3340]/[0.07] blur-[100px]" />
      <motion.a href="/" aria-label="lost.lol home" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45 }} className="absolute left-5 top-5 z-10 inline-flex items-center gap-2 text-sm font-bold tracking-tight text-white sm:left-8 sm:top-7">
        <span className="grid h-8 w-8 place-items-center rounded-[10px] border border-[#ef3340]/35 bg-[#ef3340]/10 text-[#ff5b67] shadow-[0_0_25px_rgba(239,51,64,.12)]"><AudioLines size={16} /></span>
        lost<span className="-ml-2 text-[#ef3340]">.lol</span>
      </motion.a>
      {backgroundType === 'video' && backgroundMedia && <motion.button whileTap={{ scale: .94 }} onClick={toggleVideo} aria-label={isVideoPlaying ? 'Pause background video' : 'Play background video'} className="absolute right-5 top-5 z-10 inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-black/55 px-3 text-xs font-semibold text-white backdrop-blur-xl transition-all hover:border-[#ef3340]/50 hover:bg-[#170a0c] hover:shadow-[0_0_25px_rgba(239,51,64,.14)] sm:right-8 sm:top-7">
        {isVideoPlaying ? <Pause size={14} /> : <Play size={14} />}{isVideoPlaying ? 'Pause motion' : 'Play motion'}
      </motion.button>}
      <motion.section initial={{ opacity: 0, y: 22, scale: .985 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: .55, ease: [0.22, 1, 0.36, 1] }} className="w-full max-w-[560px] overflow-hidden rounded-[28px] border border-white/[0.10] bg-[#080808]/90 shadow-[0_35px_120px_rgba(0,0,0,.72),0_0_70px_rgba(239,51,64,.08)] backdrop-blur-2xl">
        <div className="h-[3px] w-full bg-gradient-to-r from-[#8d1721] via-[#ef3340] to-[#ff6670]" />
        <div className="px-6 pb-7 pt-9 sm:px-10 sm:pb-9 sm:pt-11">
          <div className="mx-auto flex max-w-[420px] flex-col items-center text-center">
            <motion.div initial={{ opacity: 0, scale: .8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: .08, duration: .5, type: 'spring', stiffness: 170 }} className="relative mb-5 h-[104px] w-[104px]">
              <span aria-hidden="true" className="absolute -inset-2 rounded-full border border-[#ef3340]/45 shadow-[0_0_35px_rgba(239,51,64,.18)]" /><span aria-hidden="true" className="absolute -inset-4 rounded-full border border-[#ef3340]/10" />
              <img src={profilePicture || '/p.png'} alt={`${name}'s profile`} className="relative h-full w-full rounded-full border border-white/15 bg-[#120708] object-cover" />
            </motion.div>
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .2 }} className="text-[11px] font-semibold uppercase tracking-[.2em]" style={{ color: accentColor }}>@{profileUsername}</motion.span>
            <motion.h1 initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0, ...usernameAnimation }} transition={{ delay: .24, ...usernameAnimationTransition }} className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: textColor }}>{name}{profile.verified ? <BadgeCheck size={21} className="ml-2 inline-block align-middle" /> : null}</motion.h1>
            {profile.customEmojis?.length ? <div className="mt-3 flex flex-wrap justify-center gap-1.5">{profile.customEmojis.slice(0,12).map(e=><span key={e.name} title={`:${e.name}:`} className="rounded-full border border-white/10 bg-white/[.04] px-2 py-1 text-xs transition-transform hover:scale-110">{e.value}</span>)}</div> : null}
            {description && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .3 }} className="mt-3 max-w-[360px] whitespace-pre-wrap text-sm leading-6" style={{ color: textColor, opacity: 0.72 }}>{description}</motion.p>}
          </div>
          {audioUrl && <div className="mx-auto mt-7 max-w-[420px] rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3"><div className="mb-2 flex items-center gap-2 text-xs font-semibold text-zinc-400"><AudioLines size={14} style={{color:accentColor}} />{audioTitle || "Profile music"}</div><audio controls preload="metadata" className="h-9 w-full" src={audioUrl}>Your browser does not support audio playback.</audio></div>}
          <div className="mx-auto mt-8 max-w-[420px] space-y-3">
            {validLinks.map((link, index) => { const IconComponent = getLinkIcon(link.url); return (
              <motion.a key={link._id || link.id || link.url} href={link.safeUrl} target={link.safeUrl.startsWith('mailto:') ? undefined : '_blank'} rel={link.safeUrl.startsWith('mailto:') ? undefined : 'noopener noreferrer'} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .34 + index * .055, duration: .35 }} whileHover={{ y: -2, scale: 1.012 }} whileTap={{ scale: .965 }} className="group flex min-h-14 items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.025] px-4 text-left shadow-[inset_0_1px_rgba(255,255,255,.025)] transition-colors duration-200 hover:border-[#ef3340]/55 hover:bg-[#ef3340]/[0.07] hover:shadow-[0_8px_30px_rgba(239,51,64,.09)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef3340]">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/[0.08] bg-black/40 transition-all duration-200 group-hover:border-[#ef3340]/30 group-hover:bg-[#ef3340]/10" style={{ color: accentColor }}><IconComponent size={17} /></span>
                <span className="min-w-0 flex-1 truncate text-sm font-semibold" style={{ color: textColor }}>{link.title || 'Open link'}</span>
                <ArrowUpRight size={16} className="shrink-0 text-[#777173] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#ff6872]" />
              </motion.a>
            ); })}
          </div>
          {validLinks.length === 0 && <p className="mt-8 text-center text-xs text-[#746d6e]">No links added yet.</p>}
          <div className="mx-auto mt-8 flex max-w-[420px] items-center justify-between border-t border-white/[0.08] pt-4 text-[10px] font-semibold uppercase tracking-[.14em] text-[#716a6b]"><span>lost.lol/{profileUsername}</span><span>Made with <span style={{ color: accentColor }}>lost.lol</span></span></div>
        </div>
      </motion.section>
    </main>
  );
};
export default ProfilePage;
