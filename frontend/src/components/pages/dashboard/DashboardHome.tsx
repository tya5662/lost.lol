import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Crown, Eye, Link2, Palette, Settings, Share2, Shield, UserRound, Music2, Boxes, Award, Search, Menu, X as XIcon, Sparkles } from 'lucide-react';
import { User } from '../../../types';

const nav = [
  { label:'Overview', to:'/dashboard', icon:BarChart3 },
  { label:'Analytics', to:'/dashboard/analytics', icon:BarChart3 },
  { label:'Badges', to:'/dashboard/badges', icon:Award },
  { label:'Settings', to:'/dashboard/settings', icon:Settings },
  { label:'Customize', to:'/dashboard/appearance', icon:Palette },
  { label:'Links', to:'/dashboard/links', icon:Link2 },
];
const premium = [
  { label:'General', to:'/dashboard/premium', icon:Crown },
  { label:'Layout Settings', to:'/dashboard/premium/layout', icon:Boxes },
  { label:'Profile Metadata', to:'/dashboard/premium/metadata', icon:Search },
];

export const DashboardHome: React.FC<{user:User}> = ({user}) => {
  const [open,setOpen]=React.useState(false);
  const location=useLocation();
  const privileged=['owner','co-owner','staff'].includes(user.role||'');
  const Sidebar=()=> <aside className={`fixed inset-y-0 left-0 z-50 flex max-h-screen w-[270px] flex-col overflow-y-auto overscroll-contain border-r border-white/[.07] bg-[#0b0b0c] px-4 py-5 transition-transform duration-200 lg:static lg:translate-x-0 ${open?'translate-x-0':'-translate-x-full'}`}>
    <div className="flex items-center justify-between px-3 pb-7">
      <Link to="/dashboard" className="text-xl font-black tracking-tight">suffer<span className="text-[#ef3340]">.info</span></Link>
      <button className="lg:hidden rounded-lg p-2 hover:bg-white/5" onClick={()=>setOpen(false)}><XIcon size={18}/></button>
    </div>
    <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-zinc-600">Account</div>
    <nav className="space-y-1">{nav.map(({label,to,icon:Icon})=><Link key={to} onClick={()=>setOpen(false)} to={to} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${location.pathname===to?'bg-white/[.07] text-white':'text-zinc-500 hover:bg-white/[.04] hover:text-zinc-200'}`}><Icon size={17}/><span>{label}</span></Link>)}</nav>
    <div className="my-6 h-px bg-white/[.06]"/>
    <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-zinc-600">Workspace</div>
    <nav className="space-y-1">{[
      {label:'Socials',to:'/dashboard/socials',icon:Share2},{label:'Music',to:'/dashboard/music',icon:Music2},{label:'Widgets',to:'/dashboard/widgets',icon:Boxes},{label:'Profile',to:'/dashboard/profile',icon:UserRound}
    ].map(({label,to,icon:Icon})=><Link key={to} onClick={()=>setOpen(false)} to={to} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${location.pathname===to?'bg-white/[.07] text-white':'text-zinc-500 hover:bg-white/[.04] hover:text-zinc-200'}`}><Icon size={17}/>{label}</Link>)}</nav>
    <div className="my-6 h-px bg-white/[.06]"/>
    <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-zinc-600">Premium</div>
    <nav className="space-y-1">{premium.map(({label,to,icon:Icon})=><Link key={to} onClick={()=>setOpen(false)} to={to} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-500 hover:bg-white/[.04] hover:text-zinc-200"><Icon size={17}/>{label}{label!=='General'&&<span className="ml-auto rounded-full bg-amber-400/10 px-1.5 py-0.5 text-[8px] uppercase text-amber-400">Pro</span>}</Link>)}</nav>
    {privileged&&<Link to="/admin" className="mt-6 flex items-center gap-3 rounded-xl border border-red-500/10 bg-red-500/[.04] px-3 py-2.5 text-sm text-red-300"><Shield size={17}/>Admin Panel</Link>}
    <div className="sticky bottom-0 mt-auto bg-[#0b0b0c] pt-4"><Link to={`/${user.username}`} target="_blank" className="flex items-center justify-center gap-2 rounded-xl border border-white/[.08] bg-white/[.03] px-3 py-2.5 text-sm hover:bg-white/[.06]"><Eye size={16}/>View profile</Link></div>
  </aside>;
  return <div className="min-h-screen bg-[#080809] text-white lg:flex">
    {open&&<button aria-label="Close menu" onClick={()=>setOpen(false)} className="fixed inset-0 z-40 bg-black/60 lg:hidden"/>}<Sidebar/>
    <section className="min-w-0 flex-1">
      <header className="sticky top-0 z-30 border-b border-white/[.06] bg-[#080809]/90 backdrop-blur-xl"><div className="flex h-16 items-center justify-between px-4 sm:px-7">
        <div className="flex items-center gap-3"><button onClick={()=>setOpen(true)} className="rounded-xl border border-white/[.08] p-2 lg:hidden"><Menu size={18}/></button><div className="relative hidden w-72 md:block"><Search size={15} className="absolute left-3 top-2.5 text-zinc-600"/><input placeholder="Search features...     Ctrl K" className="h-9 w-full rounded-xl border border-white/[.07] bg-white/[.025] pl-9 pr-3 text-xs text-zinc-300 outline-none placeholder:text-zinc-600"/></div><span className="text-sm font-semibold lg:hidden">Overview</span></div>
        <div className="flex items-center gap-2"><span className="hidden rounded-full bg-[#ef3340]/10 px-2.5 py-1 text-[10px] font-bold uppercase text-[#ef3340] sm:block">{user.role||'member'}</span>{user.premium&&<Crown size={16} className="text-amber-400"/>}<button onClick={()=>{localStorage.removeItem('token');window.location.href='/';}} className="rounded-xl px-3 py-2 text-xs text-zinc-500 hover:bg-white/5 hover:text-white">Logout</button></div>
      </div></header>
      <main className="mx-auto max-w-6xl px-4 py-7 sm:px-7">
        <div className="mb-7"><p className="text-xs font-semibold uppercase tracking-[.18em] text-zinc-600">Account</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Overview</h1><p className="mt-2 text-sm text-zinc-500">Your profile at a glance.</p></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link to="/dashboard/analytics" className="group rounded-2xl border border-white/[.07] bg-[#0e0e10] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#ef3340]/30"><div className="mb-5 grid h-11 w-11 place-items-center rounded-xl bg-[#ef3340]/10 text-[#ef3340] transition-transform duration-300 group-hover:scale-110"><BarChart3 size={19}/></div><h2 className="text-base font-semibold">Views</h2><p className="mt-2 text-sm text-zinc-600">See profile views and performance.</p></Link>
          <Link to="/dashboard/premium" className="group rounded-2xl border border-white/[.07] bg-[#0e0e10] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#ef3340]/30"><div className="mb-5 grid h-11 w-11 place-items-center rounded-xl bg-[#ef3340]/10 text-[#ef3340] transition-transform duration-300 group-hover:scale-110"><Crown size={19}/></div><h2 className="text-base font-semibold">Statistics</h2><p className="mt-2 text-sm text-zinc-600">View your profile statistics.</p></Link>
          {user.premium&&<Link to="/dashboard/aliases" className="group rounded-2xl border border-amber-500/15 bg-amber-500/[.03] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/30"><div className="mb-5 grid h-11 w-11 place-items-center rounded-xl bg-amber-400/10 text-amber-300 transition-transform duration-300 group-hover:scale-110"><Sparkles size={19}/></div><h2 className="text-base font-semibold">Aliases</h2><p className="mt-2 text-sm text-zinc-600">Manage alternate names like list or mourn.</p></Link>}
        </div>
      </main>
    </section>
  </div>;
};