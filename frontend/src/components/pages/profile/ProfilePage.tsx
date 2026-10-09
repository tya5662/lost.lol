import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowUpRight, AudioLines, Instagram, Youtube, Twitch, Github, Globe, Linkedin, Mail, X, Disc3, BadgeCheck, Eye, MapPin, MessageCircle, Sparkles ,
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
  discordActivity?: string;
  discordAvatar?: string;
  discordPresenceStatus?: 'online'|'idle'|'dnd'|'offline';
  nameTooltip?: string;
  avatarDecoration?: string;
  badges?: string[];
  aliases?: string[];
  role?: 'owner'|'co-owner'|'staff'|'member'; roleLabel?: string;
  profileLayout?: 'default'|'compact'|'wide'|'minimal'|'split'; cardStyle?: 'glass'|'solid'|'outline'|'floating'; cardRadius?: number;
  linkRadius?: number; linkSpacing?: number; linkOpacity?: number; linkBlur?: number; avatarSize?: number; avatarShape?: 'circle'|'rounded'|'square'; avatarGlow?: boolean; showViews?: boolean; showStatus?: boolean; showBranding?: boolean; accentGlow?: number;
  pageEnterEffect?: 'fade'|'rise'|'zoom'|'blur'|'none'; particleEffect?: 'none'|'dust'|'rain'|'embers'|'stars'|'ghosts'; typewriterEnabled?: boolean; typewriterTexts?: string[]; typewriterSpeed?: number; typewriterLoop?: boolean; pageEnterText?: string; pageClickSound?: string; metadataTitle?: string; metadataDescription?: string; metadataImage?: string; animatedTitle?: boolean; monochromeIcons?: boolean; customCss?: string;
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
const getTemplateBadge = (label: string): { src: string; title: string } | null => {
  const value = label.trim().toLowerCase().replace(/[_-]+/g, ' ');
  const base = '/gunslol-template/assets/badges/';
  if (value === 'owner' || value === 'founder') return { src: base + 'owner.png', title: 'Owner' };
  if (value === 'verified' || value === 'verification') return { src: base + 'verified.png', title: 'Verified' };
  if (value === 'partner' || value === 'partnered') return { src: base + 'partner.png', title: 'Partner' };
  if (value === 'hate') return { src: base + 'hate.gif', title: 'hate' };
  return null;
};
const getTemplateSocialIcon = (url: string): string | null => {
  const value = url.toLowerCase();
  const base = '/gunslol-template/assets/icons/';
  if (value.includes('instagram.com')) return base + 'instagram.png';
  if (value.includes('spotify.com')) return base + 'spotify.png';
  if (value.includes('tiktok.com')) return base + 'tiktok.png';
  if (value.includes('github.com')) return base + 'github.png';
  if (value.includes('onlyfans.com')) return base + 'onlyfans.png';
  return null;
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
  const backgroundVideoRef = useRef<HTMLVideoElement | null>(null);
  const [cursorTrail,setCursorTrail] = useState<{x:number;y:number;id:number}[]>([]);
  const [typewriterText,setTypewriterText] = useState('');
  const [cardTilt,setCardTilt] = useState({x:0,y:0});
  const backgroundCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cursorCanvasRef = useRef<HTMLCanvasElement | null>(null);
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
    const baseTitle = profile.metadataTitle || `${profile.username} | suffer.info`;
    document.title = baseTitle;
    let titleTimer: number | undefined;
    if (profile.animatedTitle) {
      let position = 0, deleting = false;
      const tick = () => {
        if (!deleting) { position++; if (position >= baseTitle.length) { position = baseTitle.length; deleting = true; titleTimer = window.setTimeout(tick, 1100); return; } }
        else { position--; if (position <= 0) { position = 0; deleting = false; } }
        document.title = baseTitle.slice(0, position) || 'suffer.info';
        titleTimer = window.setTimeout(tick, deleting ? 55 : 95);
      };
      titleTimer = window.setTimeout(tick, 350);
    }
    const desc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (desc) desc.content = profile.metadataDescription || profile.description || '';
    if (profile.metadataImage) {
      let og = document.querySelector('meta[property="og:image"]') as HTMLMetaElement | null;
      if (!og) { og = document.createElement('meta'); og.setAttribute('property','og:image'); document.head.appendChild(og); }
      og.content = profile.metadataImage;
    }
    return () => { if (titleTimer) window.clearTimeout(titleTimer); };
  }, [profile]);
  useEffect(() => {
    const audio = audioRef.current;
    const video = backgroundVideoRef.current;
    if (audio && profile?.audioUrl) {
      audio.loop = true;
      audio.autoplay = true;
    }
    const attemptMediaPlayback = () => {
      if (audio && profile?.audioUrl) void audio.play().catch(() => {});
      if (video && profile?.backgroundType === 'video') {
        video.muted = false;
        void video.play().catch(() => { video.muted = true; });
      }
    };
    if (audio && profile?.audioUrl) {
      void audio.play().catch(() => {});
      audio.addEventListener('canplay', attemptMediaPlayback);
    }
    // Browsers block audible autoplay in some cases. Resume automatically on the
    // first ordinary visitor interaction; no play/stop control is shown.
    window.addEventListener('pointerdown', attemptMediaPlayback, { passive: true });
    window.addEventListener('keydown', attemptMediaPlayback);
    return () => {
      if (audio) audio.removeEventListener('canplay', attemptMediaPlayback);
      window.removeEventListener('pointerdown', attemptMediaPlayback);
      window.removeEventListener('keydown', attemptMediaPlayback);
    };
  }, [profile?.audioUrl, profile?.backgroundType, profile?.backgroundMedia]);

  useEffect(() => {
    if (!profile?.typewriterEnabled || !(profile.typewriterTexts || []).length) { setTypewriterText(''); return; }
    const texts = profile.typewriterTexts || [];
    let index = 0, cancelled = false, timer: number | undefined;
    const run = () => { const target = texts[index] || ''; let pos = 0; setTypewriterText(''); const tick = () => { if (cancelled) return; setTypewriterText(target.slice(0,pos++)); if (pos <= target.length) timer = window.setTimeout(tick, Math.max(20, profile.typewriterSpeed || 70)); else if (profile.typewriterLoop !== false) timer = window.setTimeout(() => { index=(index+1)%texts.length; run(); }, 900); }; tick(); };
    run(); return () => { cancelled=true; if (timer) window.clearTimeout(timer); };
  }, [profile?.typewriterEnabled, profile?.typewriterTexts, profile?.typewriterSpeed, profile?.typewriterLoop]);
  useEffect(() => {
    if (!profile) return;
    const canvas = backgroundCanvasRef.current;
    if (!canvas || profile.particleEffect === 'none') return;
    const context = canvas.getContext('2d');
    if (!context) return;
    let frame = 0;
    let width = 0, height = 0;
    const accent = profile.accentColor || '#ef3340';
    const amount = profile.particleEffect === 'embers' ? 46 : profile.particleEffect === 'stars' ? 60 : profile.particleEffect === 'ghosts' ? 22 : profile.particleEffect === 'rain' ? 90 : 54;
    const particles = Array.from({length: amount}, () => ({x:Math.random()*window.innerWidth,y:Math.random()*window.innerHeight,r:profile.particleEffect==='stars'?Math.random()*1.8+.3:Math.random()*2+0.6,v:Math.random()*.65+.2,a:Math.random()*.65+.2,phase:Math.random()*Math.PI*2}));
    let pointerX = 0, pointerY = 0;
    const movePointer = (event: MouseEvent) => { pointerX = (event.clientX / Math.max(1, window.innerWidth) - .5) * 24; pointerY = (event.clientY / Math.max(1, window.innerHeight) - .5) * 24; };
    const resize = () => { const dpr = Math.min(window.devicePixelRatio || 1, 2); width = window.innerWidth; height = window.innerHeight; canvas.width = Math.floor(width*dpr); canvas.height = Math.floor(height*dpr); canvas.style.width = `${width}px`; canvas.style.height = `${height}px`; context.setTransform(dpr,0,0,dpr,0,0); };
    const draw = () => { context.clearRect(0,0,width,height); particles.forEach(p => { p.y += p.v; p.x += Math.sin(performance.now()*.0006+p.phase)*.22; if(p.y>height+8){p.y=-8;p.x=Math.random()*width;} if(p.x>width+8)p.x=-8; if(p.x< -8)p.x=width+8; const px=p.x+pointerX*(p.y/Math.max(1,height))*.08; const py=p.y+pointerY*(p.y/Math.max(1,height))*.08; context.globalAlpha=p.a*(.65+.35*Math.sin(performance.now()*.002+p.phase)); context.fillStyle=accent; context.strokeStyle=accent; context.shadowColor=accent; context.shadowBlur=profile.particleEffect==='embers'?12:6; context.beginPath(); if(profile.particleEffect==='rain'){context.moveTo(px,py);context.lineTo(px-2,py+Math.max(8,p.r*8));context.lineWidth=Math.max(.5,p.r*.55);context.stroke();} else if(profile.particleEffect==='ghosts'){context.arc(px,py,p.r*2.2,0,Math.PI*2);context.fill();} else {context.arc(px,py,p.r,0,Math.PI*2);context.fill();} }); context.globalAlpha=1; context.shadowBlur=0; frame=requestAnimationFrame(draw); };
    resize(); window.addEventListener('resize',resize); window.addEventListener('mousemove',movePointer,{passive:true}); frame=requestAnimationFrame(draw);
    return()=>{cancelAnimationFrame(frame);window.removeEventListener('resize',resize);window.removeEventListener('mousemove',movePointer);context.clearRect(0,0,width,height);};
  },[profile?.particleEffect,profile?.accentColor]);
  useEffect(() => {
    const canvas = cursorCanvasRef.current;
    if (!canvas || profile?.cursorEffect !== 'sparkle') return;
    const context = canvas.getContext('2d');
    if (!context) return;
    let frame = 0, width = 0, height = 0;
    let mouseX = -999, mouseY = -999, lastX = -999, lastY = -999;
    const accent = profile.accentColor || '#ef3340';
    let sparks: {x:number;y:number;vx:number;vy:number;life:number;size:number;rotation:number;spin:number}[] = [];
    const resize=()=>{const dpr=Math.min(window.devicePixelRatio||1,2);width=window.innerWidth;height=window.innerHeight;canvas.width=Math.floor(width*dpr);canvas.height=Math.floor(height*dpr);canvas.style.width=`${width}px`;canvas.style.height=`${height}px`;context.setTransform(dpr,0,0,dpr,0,0);};
    const move=(event:MouseEvent)=>{mouseX=event.clientX;mouseY=event.clientY;};
    const draw=()=>{context.clearRect(0,0,width,height);if(mouseX!==lastX||mouseY!==lastY){for(let i=0;i<3;i++)sparks.push({x:mouseX,y:mouseY,vx:(Math.random()-.5)*1.4,vy:(Math.random()-.5)*1.4,life:1,size:2+Math.random()*3,rotation:Math.random()*Math.PI,spin:(Math.random()-.5)*.12});lastX=mouseX;lastY=mouseY;}sparks.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vx*=.97;p.vy*=.97;p.life-=.035;p.rotation+=p.spin;context.save();context.translate(p.x,p.y);context.rotate(p.rotation);context.globalAlpha=Math.max(0,p.life);context.fillStyle=accent;context.shadowColor=accent;context.shadowBlur=10;context.beginPath();context.moveTo(0,-p.size);context.lineTo(p.size*.35,0);context.lineTo(0,p.size);context.lineTo(-p.size*.35,0);context.closePath();context.fill();context.restore();});sparks=sparks.filter(p=>p.life>0);frame=requestAnimationFrame(draw);};
    resize();window.addEventListener('resize',resize);window.addEventListener('mousemove',move,{passive:true});frame=requestAnimationFrame(draw);
    return()=>{cancelAnimationFrame(frame);window.removeEventListener('resize',resize);window.removeEventListener('mousemove',move);context.clearRect(0,0,width,height);};
  },[profile?.cursorEffect,profile?.accentColor]);
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
  const { profilePicture, backgroundMedia, backgroundType, audioUrl, audioTitle, audioCoverUrl, name, description, links, username: profileUsername, usernameEffect = 'none', backgroundEffect = 'none', cursorEffect = 'none', fontFamily = 'Inter', customFontFamily = '', customFontUrl = '' } = profile;
  const accentColor = profile.accentColor || '#ef3340';
  const bgOpacity = Math.max(0, Math.min(1, profile.backgroundOpacity ?? 1));
  const cardOpacity = Math.max(0, Math.min(1, profile.cardOpacity ?? profile.profileOpacity ?? 0.92));
  const cardBlur = Math.max(0, Math.min(40, profile.cardBlur ?? profile.profileBlur ?? 0));
  const resolvedFont = customFontFamily || (fontFamily === 'template' || fontFamily === 'fuente' ? 'LostCustom' : fontFamily) || 'Inter';
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
    {(customFontUrl || fontFamily === 'template' || fontFamily === 'fuente') && <style>{`@font-face{font-family:'LostCustom';src:url(${JSON.stringify(customFontUrl || '/gunslol-template/assets/fonts/fuente.otf')});font-display:swap;}`}</style>}
    <main className={`suffer-template-profile relative isolate flex min-h-screen ${cursorEffect === 'glow' ? 'cursor-crosshair' : ''} ${cursorEffect === 'red' ? 'cursor-none' : ''} items-center justify-center overflow-hidden px-4 py-16 sm:px-6`} style={{ backgroundColor: profile.backgroundColor || '#050505', color: textColor, fontFamily: resolvedFont, cursor: cursorEffect === 'template' || cursorEffect === 'custom' ? "url('/gunslol-template/assets/cursor.png') 0 0, auto" : undefined }}>
      <style>{`
@keyframes suffer-aurora{0%,100%{filter:hue-rotate(0deg);transform:scale(1)}50%{filter:hue-rotate(35deg);transform:scale(1.08)}}
@keyframes suffer-drift{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(22px,-16px,0)}}
@keyframes suffer-orbit{from{transform:rotate(0deg) scale(1.15)}to{transform:rotate(360deg) scale(1.15)}}
@keyframes suffer-flicker{0%,18%,22%,62%,64%,100%{opacity:1}20%,63%{opacity:.45}}
@keyframes suffer-wave{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
@keyframes suffer-radar{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes suffer-name-noise{0%,100%{text-shadow:0 0 0 transparent;transform:translateX(0)}20%{text-shadow:-2px 0 rgba(239,51,64,.9),2px 0 rgba(255,255,255,.35);transform:translateX(-.5px)}40%{text-shadow:2px 0 rgba(239,51,64,.8),-1px 0 rgba(255,255,255,.35);transform:translateX(.5px)}60%{text-shadow:0 0 9px rgba(239,51,64,.7);transform:translateX(0)}80%{text-shadow:-1px 0 rgba(255,255,255,.35),1px 0 rgba(239,51,64,.8)}}
.suffer-name-noise{animation:suffer-name-noise .22s steps(2,end) infinite;}
.suffer-bg-effect-aurora{background:linear-gradient(125deg,rgba(239,51,64,.20),rgba(92,40,130,.12),rgba(20,90,120,.13),rgba(239,51,64,.18));background-size:250% 250%;animation:suffer-wave 9s ease-in-out infinite,suffer-aurora 12s ease-in-out infinite}
.suffer-bg-effect-pulse{animation:pulse 4s ease-in-out infinite}
.suffer-bg-effect-scanlines{background:repeating-linear-gradient(to bottom,rgba(255,255,255,.055) 0px,rgba(255,255,255,.055) 1px,transparent 2px,transparent 5px);mix-blend-mode:screen}
.suffer-bg-effect-vignette{background:radial-gradient(circle,transparent 30%,rgba(0,0,0,.78) 100%)}
.suffer-bg-effect-spotlight{background:radial-gradient(circle at 50% 35%,rgba(239,51,64,.30),transparent 42%)}
.suffer-bg-effect-breathe{animation:pulse 4s ease-in-out infinite}
.suffer-bg-effect-flicker{animation:suffer-flicker 3.2s steps(1,end) infinite}
.suffer-bg-effect-drift{animation:suffer-drift 9s ease-in-out infinite}
.suffer-bg-effect-orbit{animation:suffer-orbit 18s linear infinite}
.suffer-bg-effect-waves{background:linear-gradient(120deg,rgba(239,51,64,.18),transparent 35%,rgba(239,51,64,.13),transparent 75%);background-size:250% 250%;animation:suffer-wave 8s ease-in-out infinite}
.suffer-bg-effect-halo{background:radial-gradient(circle,rgba(239,51,64,.24),transparent 40%);animation:pulse 4s ease-in-out infinite}
.suffer-bg-effect-radar{background:repeating-radial-gradient(circle,transparent 0 32px,rgba(239,51,64,.15) 33px 34px,transparent 35px 62px);animation:suffer-radar 18s linear infinite}
.suffer-bg-effect-noise{background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.18'/%3E%3C/svg%3E");mix-blend-mode:soft-light}
`}</style>
      {cursorEffect === 'red' && cursorTrail.map((p,i)=><span key={p.id} aria-hidden="true" className="pointer-events-none fixed z-[100] h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ef3340] shadow-[0_0_18px_#ef3340] transition-opacity duration-150" style={{left:p.x,top:p.y,opacity:(i+1)/cursorTrail.length,transform:`translate(-50%,-50%) scale(${0.45+(i+1)/cursorTrail.length*.7})`}}/>)}
      {backgroundMedia && backgroundType === 'image' && <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url(${backgroundMedia})`, opacity: bgOpacity }} />}
      {backgroundMedia && backgroundType === 'video' && <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden"><video ref={backgroundVideoRef} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover" style={{ opacity: bgOpacity }}><source src={backgroundMedia} /></video></div>}
      <div aria-hidden="true" className={`pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_20%,rgba(239,51,64,.18),transparent_42%)] ${backgroundClass}`} style={{opacity:bgOpacity}} />
      <div aria-hidden="true" className={`pointer-events-none absolute inset-0 z-0 suffer-bg-effect-${backgroundEffect} ${backgroundGfx}`} style={{...backgroundGfxStyle,opacity:bgOpacity}} />
      <canvas ref={backgroundCanvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[1]" style={{opacity:bgOpacity}} />
      {cursorEffect === 'sparkle' && <canvas ref={cursorCanvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[100]" />}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.018)_1px,transparent_1px)] bg-[size:52px_52px] [mask-image:linear-gradient(to_bottom,black,transparent_82%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ef3340]/[0.07] blur-[100px]" />
      <motion.a href="/" aria-label="suffer.info home" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45 }} className="absolute left-5 top-5 z-20 inline-flex items-center gap-2 text-sm font-bold tracking-tight text-white sm:left-8 sm:top-7">
        <span className="grid h-8 w-8 place-items-center rounded-[10px] border border-[#ef3340]/35 bg-[#ef3340]/10 text-[#ff5b67] shadow-[0_0_25px_rgba(239,51,64,.12)]"><AudioLines size={16} /></span>
        suffer<span className="-ml-2 text-[#ef3340]">.info</span>
      </motion.a>
      
      <motion.section initial={{ opacity: 0, y: 22, scale: .985 }} onPointerMove={(event)=>{const rect=event.currentTarget.getBoundingClientRect();setCardTilt({x:-((event.clientY-rect.top)/rect.height-.5)*10,y:((event.clientX-rect.left)/rect.width-.5)*10});}} onPointerLeave={()=>setCardTilt({x:0,y:0})} className={`suffer-template-card relative z-10 w-full max-w-[704px] overflow-hidden ${cardOpacity <= 0 ? 'profile-card-transparent' : ''}`} animate={profile.syncToBackground ? syncedMotion : { opacity: 1, y: 0, scale: 1 }} transition={profile.syncToBackground ? {duration: backgroundEffect === 'flicker' ? 1.15 : 3, repeat: Infinity, ease: 'easeInOut'} : { duration: .55, ease: [0.22, 1, 0.36, 1] }} style={{backgroundColor:profile.cardStyle==='solid'?`rgba(11,11,13,${cardOpacity})`:`rgba(8,8,8,${cardOpacity})`,backdropFilter:cardOpacity > 0 && cardBlur > 0 ? `blur(${cardBlur}px)` : 'none',borderRadius:cardRadius,border: 'none',boxShadow:cardOpacity > 0 ? '0 35px 120px rgba(0,0,0,.25),0 0 70px rgba(239,51,64,.04)' : 'none',transform:`perspective(1000px) rotateX(${cardTilt.x}deg) rotateY(${cardTilt.y}deg)`,transition:'transform 180ms ease-out, background-color 250ms ease, box-shadow 250ms ease'}}>
        {cardOpacity <= 0 && <style>{`.profile-card-transparent [class*="bg-"] { background: transparent !important; background-color: transparent !important; }
.profile-card-transparent [class*="border-"] { border-color: transparent !important; }
.profile-card-transparent [class*="shadow-"] { box-shadow: none !important; }
.profile-card-transparent [style*="background-color"] { background-color: transparent !important; }
.profile-card-transparent [style*="backdrop-filter"] { backdrop-filter: none !important; }`}</style>}
        <div className="hidden" />
        <style>{'.suffer-template-profile .suffer-template-card:not(.profile-card-transparent){box-shadow:0 28px 100px rgba(0,0,0,.32),0 0 70px rgba(239,51,64,.055)!important;transition:background-color .25s ease,box-shadow .25s ease}.suffer-template-profile .suffer-template-card a{transition:transform .18s ease,border-color .18s ease,background-color .18s ease,box-shadow .18s ease}.suffer-template-profile .suffer-template-card a:focus-visible{outline:2px solid #ef3340;outline-offset:3px}.suffer-template-profile .suffer-template-card a:hover{box-shadow:0 8px 28px rgba(239,51,64,.10)}.suffer-template-profile .suffer-template-card img{image-rendering:auto}@media(max-width:640px){.suffer-template-profile{padding-left:14px;padding-right:14px;padding-top:72px;padding-bottom:32px}.suffer-template-profile .suffer-template-card{border-radius:24px!important}.suffer-template-profile .suffer-template-card [class*=px-6]{padding-left:18px;padding-right:18px}}'} </style><div className="px-6 pb-7 pt-9 sm:px-10 sm:pb-9 sm:pt-11">
          <div className="mx-auto flex max-w-[560px] flex-col items-center gap-5 text-center sm:flex-row sm:items-center sm:text-left">
            <motion.div initial={{ opacity: 0, scale: .8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: .08, duration: .5, type: 'spring', stiffness: 170 }} className="relative mb-1 shrink-0 sm:mb-0" style={{width:avatarSize,height:avatarSize}}>
              
              <img src={profilePicture || '/p.png'} alt={`${name}'s profile`} className="relative h-full w-full border border-white/15 bg-[#120708] object-cover" style={{borderRadius:profile.avatarShape==='square'?'14px':profile.avatarShape==='rounded'?'28%':'9999px'}} />{profile.avatarDecoration && <img src={profile.avatarDecoration} alt="" aria-hidden="true" className="pointer-events-none absolute -inset-[12%] h-[124%] w-[124%] object-contain" />}
            </motion.div>
            <div className="min-w-0 flex-1 text-center sm:text-left">
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .2 }} className="text-[11px] font-semibold uppercase tracking-[.2em]" style={{ color: accentColor }}>@{profileUsername}</motion.span>
            <motion.h1 initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0, ...usernameAnimation }} transition={{ delay: .24, ...usernameAnimationTransition }} className={`mt-2 text-3xl font-bold tracking-tight sm:text-4xl ${usernameEffect === 'noise' || usernameEffect === 'glitch' ? 'suffer-name-noise' : ''}`} style={{ color: textColor }}>{name}{profile.verified ? <BadgeCheck size={21} className="ml-2 inline-block align-middle" /> : null}{profile.nameTooltip ? <span title={profile.nameTooltip} aria-label={profile.nameTooltip} className="ml-2 inline-flex align-middle cursor-help text-xs font-medium opacity-55">ⓘ</span> : null}</motion.h1>{typewriterText&&<p className="mt-1 text-xs uppercase tracking-[.18em]" style={{color:accentColor}}>{typewriterText}</p>}{profile.role&&profile.role!=='member'&&<span className="mt-2 inline-flex rounded-full border border-[#ef3340]/25 bg-[#ef3340]/[.07] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.15em]" style={{color:accentColor}}>{profile.roleLabel||profile.role}</span>}
            {aliases.length ? <div className="mt-3 flex flex-wrap justify-center gap-2">{aliases.map(alias=><a key={alias} href={`/${alias}`} className="rounded-full border border-[#ef3340]/20 bg-[#ef3340]/[0.06] px-3 py-1 text-[10px] font-semibold tracking-wide text-zinc-300 transition hover:border-[#ef3340]/45 hover:text-white">@{alias}</a>)}</div> : null}
            
            {description && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .3 }} className="mt-3 max-w-[480px] whitespace-pre-wrap text-sm leading-6" style={{ color: textColor, opacity: 0.72 }}>{description}</motion.p>}
            </div>
          </div>
          {audioUrl && <div className="mx-auto mt-7 max-w-[560px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#121212] shadow-[0_12px_35px_rgba(0,0,0,.22)]">
  <audio ref={audioRef} preload="auto" autoPlay loop src={audioUrl}>Your browser does not support audio playback.</audio>
  <div className="p-3.5 sm:p-4">
    <div className="flex items-center gap-3">
      <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-md bg-[#202020]">{audioCoverUrl?<img src={audioCoverUrl} alt="" className="h-full w-full object-cover"/>:<Disc3 size={25} className="text-zinc-500"/>}</div>
      <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-white">{audioTitle || 'Profile music'}</p><p className="mt-0.5 truncate text-[11px] text-zinc-500">@{profileUsername}</p></div>
      
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
                <div className="relative h-9 w-9 shrink-0">
                  {profile.discordAvatar ? <img src={profile.discordAvatar} alt="" loading="lazy" className="h-9 w-9 rounded-full object-cover" /> : <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#5865f2]/15"><MessageCircle size={17} className="text-[#7289da]" /></div>}
                  <img title={profile.discordPresenceStatus || 'offline'} alt={profile.discordPresenceStatus || 'offline'} src={`/gunslol-template/assets/icons/status/${profile.discordPresenceStatus==='online'?'online':profile.discordPresenceStatus==='idle'?'inactive':profile.discordPresenceStatus==='dnd'?'busy':'offline'}.png`} className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#101012] object-contain" loading="lazy" />
                </div>
                <div className="min-w-0"><div className="text-[10px] font-semibold uppercase tracking-[.12em] text-zinc-500">Discord</div><div className="truncate text-xs font-semibold" style={{color:textColor}}>{profile.discordUsername || 'Connected'}{profile.discordActivity ? <div className="truncate text-[10px] text-zinc-400">{profile.discordActivity}</div> : null}</div></div>
              </div>}
              {profile.showLocation && profile.location && <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-white/[0.08] bg-black/20 px-3 py-2.5">
                <MapPin size={17} className="shrink-0" style={{color:accentColor}} />
                <div className="min-w-0"><div className="text-[10px] font-semibold uppercase tracking-[.12em] text-zinc-500">Location</div><div className="truncate text-xs font-semibold" style={{color:textColor}}>{profile.location}</div></div>
              </div>}
            </div>
          </div>}
          {profile.badges?.length ? <div className="mx-auto mt-3 flex max-w-[420px] flex-wrap justify-center gap-2">{profile.badges.slice(0,8).map(b=>{const isImage=/^https?:\/\//i.test(b)&&/\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(b);const templateBadge=getTemplateBadge(b);const badgeImage=isImage?b:templateBadge?.src;const badgeTitle=isImage?"Custom badge":(templateBadge?.title||b);return <span key={b} title={badgeTitle} className="inline-flex items-center gap-1.5 rounded-full border border-[#ef3340]/20 bg-[#ef3340]/[0.06] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[.08em] transition-transform duration-200 hover:-translate-y-0.5 hover:border-[#ef3340]/50" style={{color:textColor}}>{badgeImage?<img src={badgeImage} alt={badgeTitle} loading="lazy" className="h-5 w-5 rounded object-contain" />:<><BadgeCheck size={12} style={{color:accentColor}} />{b}</>}</span>})}</div> : null}
          <div className="mx-auto mt-8 max-w-[420px]" style={{display:'flex',flexDirection:'column',gap:linkSpacing}}>
            {validLinks.map((link, index) => { const IconComponent = getLinkIcon(link.url); return (
              <motion.a key={link._id || link.id || link.url} href={link.safeUrl} target={link.safeUrl.startsWith('mailto:') ? undefined : '_blank'} rel={link.safeUrl.startsWith('mailto:') ? undefined : 'noopener noreferrer'} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .34 + index * .055, duration: .35 }} whileHover={{ y: -2, scale: 1.012 }} whileTap={{ scale: .965 }} className="group flex min-h-14 items-center gap-3 border border-white/[0.08] bg-white/[0.025] px-4 text-left shadow-[inset_0_1px_rgba(255,255,255,.025)] transition-colors duration-200 hover:border-[#ef3340]/55 hover:bg-[#ef3340]/[0.07] hover:shadow-[0_8px_30px_rgba(239,51,64,.09)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef3340]" style={{borderRadius:linkRadius,backgroundColor:`rgba(255,255,255,${linkOpacity})`,backdropFilter:`blur(${linkBlur}px)`}}>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/[0.08] bg-black/40 transition-all duration-200 group-hover:border-[#ef3340]/30 group-hover:bg-[#ef3340]/10" style={{ color: accentColor }}>{getTemplateSocialIcon(link.url) ? <img src={getTemplateSocialIcon(link.url)!} alt="" loading="lazy" className="h-5 w-5 object-contain transition-transform duration-200 group-hover:scale-110" /> : <IconComponent size={17} />}</span>
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
