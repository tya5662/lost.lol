import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, BadgeCheck, BarChart3, Check, CirclePlay, Disc3, Globe2, Link2, Menu, Palette, Sparkles, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const themes = [
  { name: 'Crimson', accent: '#ef4444', glow: 'rgba(239,68,68,.24)' },
  { name: 'Violet', accent: '#a855f7', glow: 'rgba(168,85,247,.22)' },
  { name: 'Ice', accent: '#60a5fa', glow: 'rgba(96,165,250,.20)' },
];

export const HomePage: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(0);
  const [playing, setPlaying] = useState(false);
  const active = themes[theme];
  const particles = useMemo(() => Array.from({ length: 28 }, (_, i) => ({
    left: (i * 41) % 100, top: (i * 67) % 72, delay: (i % 8) * .35,
  })), []);

  return (
    <main className="min-h-screen overflow-hidden bg-[#050506] text-white">
      <section className="relative isolate min-h-[940px] overflow-hidden border-b border-white/[.06] sm:min-h-[1060px]">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_50%_-5%,rgba(239,68,68,.20),transparent_35%),radial-gradient(circle_at_8%_40%,rgba(116,44,131,.14),transparent_30%),linear-gradient(180deg,#151014,#09090b_52%,#050506)]" />
        <div className="absolute inset-0 -z-10 opacity-[.12] [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:68px_68px] [mask-image:linear-gradient(to_bottom,black,transparent_74%)]" />
        {particles.map((p,i)=><motion.span key={i} className="absolute -z-10 h-1 w-1 rounded-full bg-white/50" style={{left:`${p.left}%`,top:`${p.top}%`}} animate={{y:[-8,10,-8],opacity:[.05,.45,.05]}} transition={{duration:4+(i%5),repeat:Infinity,delay:p.delay}} />)}

        <header className="relative z-30 mx-auto max-w-[1320px] px-4 pt-4 sm:px-8 sm:pt-7">
          <nav className="flex h-[70px] items-center justify-between rounded-[22px] border border-white/[.09] bg-black/45 px-4 shadow-[0_20px_80px_rgba(0,0,0,.35)] backdrop-blur-2xl sm:h-[78px] sm:px-6">
            <Link to="/" className="flex items-center gap-2 text-[22px] font-semibold tracking-[-.06em] sm:text-[25px]">
              <span className="grid h-8 w-8 place-items-center rounded-[10px] border border-red-400/30 bg-red-500/10"><span className="h-2 w-2 rounded-full bg-red-400 shadow-[0_0_18px_#ef4444]" /></span>
              lost<span className="text-red-400">.lol</span>
            </Link>
            <div className="hidden items-center gap-1 sm:flex">
              <a href="#showcase" className="rounded-xl px-4 py-2.5 text-sm text-zinc-400 hover:bg-white/[.04] hover:text-white">Showcase</a>
              <a href="#features" className="rounded-xl px-4 py-2.5 text-sm text-zinc-400 hover:bg-white/[.04] hover:text-white">Features</a>
              <Link to="/login" className="rounded-xl px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/[.04] hover:text-white">Sign in</Link>
              <Link to="/register" className="rounded-xl border border-red-400/40 bg-red-500/15 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_28px_rgba(239,68,68,.10)] hover:bg-red-500/25">Create page</Link>
            </div>
            <button type="button" aria-label={menuOpen?'Close menu':'Open menu'} aria-expanded={menuOpen} onClick={()=>setMenuOpen(v=>!v)} className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[.03] text-red-300 sm:hidden">{menuOpen?<X size={20}/>:<Menu size={20}/>}</button>
          </nav>
          {menuOpen&&<div className="absolute left-4 right-4 top-[calc(100%+8px)] grid gap-1 rounded-2xl border border-white/10 bg-[#0e0e10] p-2 shadow-2xl sm:hidden">
            <a href="#showcase" onClick={()=>setMenuOpen(false)} className="rounded-xl px-4 py-3 text-sm text-zinc-300 hover:bg-white/[.05]">Showcase</a>
            <a href="#features" onClick={()=>setMenuOpen(false)} className="rounded-xl px-4 py-3 text-sm text-zinc-300 hover:bg-white/[.05]">Features</a>
            <Link to="/login" onClick={()=>setMenuOpen(false)} className="rounded-xl px-4 py-3 text-sm text-zinc-300 hover:bg-white/[.05]">Sign in</Link>
            <Link to="/register" onClick={()=>setMenuOpen(false)} className="rounded-xl bg-red-500/15 px-4 py-3 text-sm font-semibold text-red-100">Create page</Link>
          </div>}
        </header>

        <div className="relative z-10 mx-auto max-w-5xl px-5 pt-20 text-center sm:pt-28">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-500/[.06] px-4 py-2 text-[10px] font-semibold uppercase tracking-[.2em] text-red-200 sm:text-xs"><Sparkles size={13}/> A profile platform built around you</div>
          <h1 className="mx-auto mt-7 max-w-5xl text-[clamp(3.2rem,8vw,7.4rem)] font-semibold leading-[.91] tracking-[-.075em]">Your entire online<br/><span className="bg-gradient-to-r from-white via-red-100 to-red-300 bg-clip-text text-transparent">identity, in one place.</span></h1>
          <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-zinc-400 sm:text-xl sm:leading-8">Build a profile that actually feels like yours. Links, socials, music, effects, badges, backgrounds and more — all controlled from one easy dashboard.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/register" className="group inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-red-400/40 bg-red-500/15 px-7 text-sm font-semibold shadow-[0_0_40px_rgba(239,68,68,.12)] hover:-translate-y-0.5 hover:bg-red-500/25">Create your profile <ArrowRight size={17} className="transition-transform group-hover:translate-x-1"/></Link>
            <a href="#showcase" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[.03] px-7 text-sm font-medium text-zinc-200 hover:bg-white/[.06]">Explore the experience <ArrowUpRight size={17}/></a>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-zinc-600"><span className="inline-flex items-center gap-1.5"><Check size={13} className="text-emerald-400"/> Free to start</span><span>•</span><span>No design skills needed</span><span>•</span><span>Your profile, your rules</span></div>
        </div>

        <div id="showcase" className="relative mx-auto mt-16 h-[440px] max-w-[1120px] px-4 sm:mt-20 sm:h-[500px]">
          <div className="absolute left-1/2 top-12 hidden w-[290px] -translate-x-[82%] rotate-[-8deg] rounded-[28px] border border-white/10 bg-[#101012] p-4 opacity-55 shadow-2xl sm:block">
            <div className="h-32 rounded-2xl bg-[linear-gradient(135deg,#241317,#17141b,#24212c)]"/><div className="mx-auto -mt-8 h-16 w-16 rounded-full border-4 border-[#101012] bg-[#302327]"/><p className="mt-3 text-center text-sm font-semibold">nightshift</p><div className="mt-5 space-y-2">{['Portfolio','Socials','Contact'].map(x=><div key={x} className="rounded-xl border border-white/5 bg-white/[.03] p-3 text-center text-xs text-zinc-400">{x}</div>)}</div>
          </div>
          <div className="absolute left-1/2 top-20 hidden w-[310px] -translate-x-[18%] rotate-[7deg] rounded-[28px] border border-white/10 bg-[#111113] p-4 opacity-70 shadow-2xl sm:block">
            <div className="h-32 rounded-2xl bg-[linear-gradient(135deg,#211b2d,#16171d,#1d202a)]"/><div className="mx-auto -mt-8 h-16 w-16 rounded-full border-4 border-[#111113] bg-[#282334]"/><p className="mt-3 text-center text-sm font-semibold">violet.fm</p><p className="mt-1 text-center text-[10px] text-zinc-500">music / art / late nights</p><div className="mt-5 rounded-xl border border-white/5 bg-white/[.03] p-3 text-xs text-zinc-400">Currently listening</div>
          </div>

          <motion.div initial={{y:35,opacity:0}} whileInView={{y:0,opacity:1}} viewport={{once:true}} transition={{duration:.65}} className="absolute left-1/2 top-2 w-[min(94vw,430px)] -translate-x-1/2 rounded-[30px] border border-white/[.12] bg-[#0b0b0d]/95 p-4 shadow-[0_35px_110px_rgba(0,0,0,.8),0_0_70px_rgba(239,68,68,.08)] backdrop-blur-xl sm:top-0 sm:w-[430px] sm:p-5">
            <div className="h-32 rounded-2xl bg-[radial-gradient(circle_at_70%_30%,rgba(239,68,68,.25),transparent_30%),linear-gradient(135deg,#241114,#121216_60%,#1b1519)]"/>
            <div className="mx-auto -mt-10 h-20 w-20 rounded-full border-4 border-[#0b0b0d] bg-[radial-gradient(circle_at_30%_25%,#694047,#20181d)] shadow-[0_0_30px_rgba(239,68,68,.15)]"/>
            <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-[.18em] text-red-300"><span className="h-1.5 w-1.5 rounded-full bg-red-400"/> @afterhours <BadgeCheck size={12}/></div>
            <h2 className="mt-1 text-center text-2xl font-bold tracking-[-.04em]">Alex Morgan</h2>
            <p className="mx-auto mt-2 max-w-[300px] text-center text-xs leading-5 text-zinc-500">Designer, playlist maker, and collector of good links.</p>

            <div className="mt-5 rounded-2xl border border-white/[.08] bg-white/[.025] p-3">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-red-500/30 to-black ring-1 ring-white/10"><Disc3 size={20} className={playing?'animate-spin text-red-300':'text-zinc-400'}/></div>
                <div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">afterhours.mp3</p><p className="mt-0.5 text-[10px] text-zinc-500">Alex Morgan • Profile music</p></div>
                <button type="button" onClick={()=>setPlaying(v=>!v)} aria-label={playing?'Pause music preview':'Play music preview'} className="grid h-9 w-9 place-items-center rounded-full bg-white text-black hover:scale-105">{playing?<span className="text-xs">Ⅱ</span>:<CirclePlay size={19}/>}</button>
              </div>
              <div className="mt-3 h-1 rounded-full bg-white/10"><div className="h-full w-[38%] rounded-full bg-red-400"/></div>
              <div className="mt-1 flex justify-between text-[9px] text-zinc-600"><span>1:24</span><span>3:42</span></div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              {['Socials','Projects','Contact'].map((x,i)=><div key={x} className="rounded-xl border border-white/[.07] bg-white/[.025] p-2.5 text-center text-[10px] text-zinc-300"><span className="block text-[9px] text-zinc-600">0{i+1}</span>{x}</div>)}
            </div>
          </motion.div>
        </div>
      </section>

      <section id="features" className="border-b border-white/[.06] bg-[#080809] px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl"><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-red-300">Built for profiles, not templates</p><h2 className="mt-4 text-3xl font-semibold tracking-[-.06em] sm:text-5xl">Everything important is one tap away.</h2><p className="mt-4 text-sm leading-6 text-zinc-500 sm:text-base">The dashboard is organized into simple sections, so you can customize one thing without digging through a giant settings page.</p></div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [Link2,'Links','Add, reorder and manage the links people actually need.'],
              [Palette,'Appearance','Backgrounds, fonts, effects, colors and card styling.'],
              [Disc3,'Music','A polished player that only plays when you allow it.'],
              [BarChart3,'Analytics','See visits and understand how your profile is doing.'],
            ].map(([Icon,title,text],i)=>{const C=Icon as typeof Link2;return <article key={String(title)} className="group rounded-[24px] border border-white/[.07] bg-[#0d0d0f] p-6 transition-all hover:-translate-y-1 hover:border-red-400/20 hover:bg-[#101012]"><div className="flex items-center justify-between"><span className="grid h-11 w-11 place-items-center rounded-xl border border-red-400/15 bg-red-500/[.06] text-red-300"><C size={19}/></span><span className="text-[10px] text-zinc-700">0{i+1}</span></div><h3 className="mt-7 font-semibold">{String(title)}</h3><p className="mt-2 text-sm leading-6 text-zinc-500">{String(text)}</p></article>})}
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
            <div className="rounded-[26px] border border-white/[.07] bg-[#0d0d0f] p-6 sm:p-8">
              <p className="text-[10px] uppercase tracking-[.18em] text-red-300">Live customization preview</p>
              <h3 className="mt-3 text-2xl font-semibold tracking-[-.04em]">Change the feel without touching code.</h3>
              <div className="mt-7 flex flex-wrap gap-2">{themes.map((t,i)=><button key={t.name} type="button" onClick={()=>setTheme(i)} className={`rounded-full border px-3 py-2 text-xs ${theme===i?'border-white/20 bg-white/[.08] text-white':'border-white/8 text-zinc-500 hover:text-zinc-200'}`}><span className="mr-2 inline-block h-2 w-2 rounded-full" style={{background:t.accent}}/>{t.name}</button>)}</div>
              <div className="relative mt-6 overflow-hidden rounded-2xl border border-white/10 p-5" style={{background:`radial-gradient(circle at 75% 15%,${active.glow},transparent 34%),#09090b`}}>
                <div className="absolute right-5 top-5 h-20 w-20 rounded-full blur-3xl" style={{background:active.accent,opacity:.18}}/>
                <div className="relative flex items-center gap-4"><div className="h-14 w-14 rounded-full border border-white/10 bg-[#211619]"/><div><p className="font-semibold">yourname <span style={{color:active.accent}}>✦</span></p><p className="text-xs text-zinc-500">A page that changes with you.</p></div></div>
                <div className="relative mt-5 grid gap-2 sm:grid-cols-2"><div className="rounded-xl border border-white/7 bg-white/[.03] p-3 text-xs text-zinc-300">Custom links</div><div className="rounded-xl border border-white/7 bg-white/[.03] p-3 text-xs text-zinc-300">Socials</div></div>
              </div>
            </div>
            <div className="rounded-[26px] border border-white/[.07] bg-[radial-gradient(circle_at_80%_20%,rgba(239,68,68,.10),transparent_32%),#0d0d0f] p-6 sm:p-8">
              <p className="text-[10px] uppercase tracking-[.18em] text-red-300">Your profile, your control</p>
              <div className="mt-5 space-y-3">
                {['Choose exactly what appears publicly','Keep music off until you enable it','Use your own custom assets and effects','Preview changes before sharing'].map((x)=><div key={x} className="flex gap-3 rounded-xl border border-white/[.06] bg-white/[.02] p-3 text-sm text-zinc-300"><Check size={16} className="mt-0.5 shrink-0 text-emerald-400"/>{x}</div>)}
              </div>
              <Link to="/register" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-red-300 hover:text-red-200">Start building <ArrowRight size={15}/></Link>
            </div>
          </div>

          <div className="mt-16 flex flex-col items-center justify-between gap-5 rounded-[26px] border border-red-400/10 bg-[radial-gradient(ellipse_at_50%_120%,rgba(239,68,68,.12),transparent_65%),#0d0d0f] px-6 py-9 text-center sm:flex-row sm:px-10 sm:text-left"><div><p className="text-[10px] uppercase tracking-[.18em] text-red-300">Ready when you are</p><h2 className="mt-2 text-2xl font-semibold tracking-[-.04em]">Make your corner of the internet.</h2></div><Link to="/register" className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-red-400/30 bg-red-500/15 px-5 text-sm font-semibold hover:bg-red-500/25">Create free profile <ArrowRight size={16}/></Link></div>
        </div>
      </section>
      <footer className="bg-[#050506] px-5 py-8 sm:px-8"><div className="mx-auto flex max-w-6xl flex-col gap-3 text-xs text-zinc-600 sm:flex-row sm:items-center sm:justify-between"><Link to="/" className="text-base font-semibold text-white">lost<span className="text-red-400">.lol</span></Link><span>Your page. Your links. Your rules.</span><Link to="/login" className="text-zinc-400 hover:text-white">Member sign in <ArrowUpRight size={12} className="inline"/></Link></div></footer>
    </main>
  );
};
