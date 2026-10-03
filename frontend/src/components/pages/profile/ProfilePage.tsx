import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowUpRight,
  AudioLines,
  Instagram,
  Youtube,
  Twitch,
  Github,
  Globe,
  Linkedin,
  Mail,
  Pause,
  Play,
  X,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { API_URL } from '@/services/api';
import logo from '../../../../public/p.png'
interface UserProfile {
  id: number;
  username: string;
  name: string;
  description: string | null;
  profilePicture: string | null;
  backgroundMedia: string | null;
  backgroundType: 'image' | 'video' | null;
  links: Array<{
    _id?: string;
    id?: number;
    title: string;
    url: string;
  }>;
}

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
  const navigate = useNavigate()
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

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

    setLoading(true);
    setProfile(null);
    void fetchProfile();
    return () => {
      isCurrent = false;
    };
  }, [username]);

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-[#090909] text-sm text-[#a39b9c]">
      <span className="mr-3 h-2 w-2 animate-pulse rounded-full bg-[#ff4056]" />Loading profile
    </div>
  );

  if (!profile) return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#090909] px-5 text-center text-white">
      <img src={logo} alt="lost.lol" className="mb-5 h-14 w-14 rounded-xl border border-white/10" />
      <h1 className="text-2xl font-bold">This profile isn’t here.</h1>
      <p className="mt-2 text-sm text-[#928a8b]">The username may be unavailable or misspelled.</p>
      <button
            onClick={() => navigate('/')}
            className="mt-6 inline-flex h-10 items-center rounded-lg border border-[#ff4056]/30 bg-[#e62940] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#ff3c53] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7a88]"
          >
           Back to lost.lol
          </button>
    </div>
  );

  const { profilePicture, backgroundMedia, backgroundType, name, description, links, username: profileUsername } = profile;

  const toggleVideo = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      try {
        await video.play();
        setIsVideoPlaying(true);
      } catch {
        setIsVideoPlaying(false);
      }
    } else {
      video.pause();
      setIsVideoPlaying(false);
    }
  };

  const validLinks = links.flatMap((link) => {
    try {
      const parsed = new URL(link.url, window.location.origin);
      if (!['http:', 'https:', 'mailto:'].includes(parsed.protocol)) return [];
      return [{ ...link, safeUrl: parsed.href }];
    } catch {
      return [];
    }
  });

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#090909] px-4 py-16 text-[#f4f0ef] sm:px-6">
      {backgroundMedia && backgroundType === 'image' && (
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 scale-105 bg-cover bg-center opacity-30 blur-2xl"
          style={{
            backgroundImage: `url(${backgroundMedia})`,
          }}
        />
      )}

      {backgroundMedia && backgroundType === 'video' && (
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            onPlay={() => setIsVideoPlaying(true)}
            onPause={() => setIsVideoPlaying(false)}
            className="absolute inset-0 h-full w-full scale-105 object-cover opacity-30 blur-xl"
          >
            <source src={backgroundMedia} type="video/mp4" />
          </video>
        </div>
      )}

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.018)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_0%,rgba(123,18,32,.18),transparent_58%)]" />

      <a href="/" aria-label="lost.lol home" className="absolute left-5 top-5 z-10 inline-flex items-center gap-2 text-sm font-bold tracking-tight text-white sm:left-8 sm:top-7">
        <span className="grid h-8 w-8 place-items-center rounded-[9px] border border-[#ff3047]/35 bg-[#ff3047]/10 text-[#ff5265]"><AudioLines size={16} /></span>
        lost<span className="-ml-2 text-[#ff4056]">.lol</span>
      </a>

      {backgroundType === 'video' && backgroundMedia && (
        <button onClick={toggleVideo} aria-label={isVideoPlaying ? 'Pause background video' : 'Play background video'} className="absolute right-5 top-5 z-10 inline-flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-black/55 px-3 text-xs font-semibold text-white backdrop-blur transition-colors hover:border-[#ff4056]/40 hover:bg-[#171010] sm:right-8 sm:top-7">
          {isVideoPlaying ? <Pause size={14} /> : <Play size={14} />}
          {isVideoPlaying ? 'Pause motion' : 'Play motion'}
        </button>
      )}

      <section className="w-full max-w-[560px] overflow-hidden rounded-2xl border border-white/[0.11] bg-[#0d0c0c]/90 shadow-[0_35px_120px_rgba(0,0,0,.58)] backdrop-blur-xl">
        <div className="h-[3px] w-full bg-gradient-to-r from-[#721321] via-[#ff4056] to-[#721321]" />
        <div className="px-6 pb-7 pt-9 sm:px-10 sm:pb-9 sm:pt-11">
          <div className="mx-auto flex max-w-[420px] flex-col items-center text-center">
            <div className="relative mb-5 h-[100px] w-[100px]">
              <span aria-hidden="true" className="absolute -inset-1 rounded-full border border-[#ff4056]/45" />
              <img
                src={profilePicture || '/p.png'}
                alt={`${name}'s profile`}
                className="h-full w-full rounded-full border border-white/15 bg-[#1b1113] object-cover"
              />
            </div>

            <span className="text-[11px] font-semibold uppercase tracking-[.18em] text-[#ff596b]">@{profileUsername}</span>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">{name}</h1>
            {description && <p className="mt-3 max-w-[360px] whitespace-pre-wrap text-sm leading-6 text-[#aaa2a3]">{description}</p>}
          </div>

          <div className="mx-auto mt-8 max-w-[420px] space-y-2.5">
            {validLinks.map((link) => {
              const IconComponent = getLinkIcon(link.url);
              return (
                <a
                  key={link._id || link.id || link.url}
                  href={link.safeUrl}
                  target={link.safeUrl.startsWith('mailto:') ? undefined : '_blank'}
                  rel={link.safeUrl.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                  className="group flex min-h-14 items-center gap-3 rounded-lg border border-white/[0.09] bg-white/[0.025] px-3.5 text-left transition-all duration-200 hover:-translate-y-px hover:border-[#ff4056]/40 hover:bg-[#ff3047]/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff596b]"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-white/[0.08] bg-black/30 text-[#ff596b] transition-colors group-hover:border-[#ff4056]/25 group-hover:bg-[#ff3047]/10">
                    <IconComponent size={17} />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[#ece7e7]">{link.title || 'Open link'}</span>
                  <ArrowUpRight size={16} className="shrink-0 text-[#777173] transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#ff596b]" />
                </a>
              );
            })}
          </div>

          {validLinks.length === 0 && <p className="mt-8 text-center text-xs text-[#746d6e]">No links added yet.</p>}

          <div className="mx-auto mt-8 flex max-w-[420px] items-center justify-between border-t border-white/[0.08] pt-4 text-[10px] font-semibold uppercase tracking-[.14em] text-[#716a6b]">
            <span>lost.lol/{profileUsername}</span>
            <span>Made with <span className="text-[#ff596b]">lost.lol</span></span>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ProfilePage;
