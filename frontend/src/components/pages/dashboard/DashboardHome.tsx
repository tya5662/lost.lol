import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Crown, Eye, Link2, Palette, Settings, Share2, Shield, UserRound, Music2, Boxes } from 'lucide-react';
import { User } from '../../../types';

const cards = [
  { to:'/dashboard/profile', icon:UserRound, title:'Profile', text:'Name, bio, avatar, location and profile details.' },
  { to:'/dashboard/appearance', icon:Palette, title:'Appearance', text:'Colors, layouts, fonts, effects and backgrounds.' },
  { to:'/dashboard/socials', icon:Share2, title:'Socials', text:'Manage your social profiles and connected accounts.' },
  { to:'/dashboard/links', icon:Link2, title:'Links', text:'Create, edit and reorder your profile links.' },
  { to:'/dashboard/music', icon:Music2, title:'Music', text:'Set profile audio, title and playback settings.' },
  { to:'/dashboard/widgets', icon:Boxes, title:'Widgets', text:'Add profile widgets and extra content.' },
  { to:'/dashboard/analytics', icon:BarChart3, title:'Analytics', text:'Track profile visits and growth.' },
  { to:'/dashboard/premium', icon:Crown, title:'Premium', text:'Unlock and manage advanced customization.' },
  { to:'/dashboard/account', icon:Settings, title:'Account', text:'Account settings and security.' },
];

export const DashboardHome: React.FC<{user:User}> = ({user}) => {
  const privileged = ['owner','co-owner','staff'].includes(user.role || '');
  return <div className="min-h-screen bg-[#090909] text-white">
    <header className="border-b border-white/[.08] bg-[#0e0d0f]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
        <div><div className="text-xl font-bold">lost<span className="text-orange-500">.lol</span></div><div className="text-[10px] uppercase tracking-[.2em] text-zinc-500">Control center</div></div>
        <div className="flex items-center gap-2">
          <Link to={`/${user.username}`} target="_blank" className="rounded-xl border border-white/10 px-4 py-2 text-sm hover:bg-white/5"><Eye className="mr-2 inline h-4 w-4"/>View</Link>
          <button onClick={()=>{localStorage.removeItem('token');location.href='/';}} className="rounded-xl bg-white/10 px-4 py-2 text-sm hover:bg-white/15">Logout</button>
        </div>
      </div>
    </header>
    <main className="mx-auto max-w-7xl px-5 py-8">
      <div className="mb-8 rounded-[28px] border border-orange-500/20 bg-gradient-to-br from-orange-950/40 via-[#151014] to-black p-7">
        <div className="flex flex-wrap items-center gap-3"><span className="rounded-full bg-orange-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-orange-400">{user.role || 'member'}</span>{user.premium && <span className="rounded-full bg-amber-400/15 px-3 py-1 text-xs font-bold text-amber-300">PREMIUM</span>}</div>
        <h1 className="mt-3 text-3xl font-bold">Welcome back, {user.username}.</h1>
        <p className="mt-2 max-w-2xl text-zinc-400">Everything is separated into its own workspace so you can build your profile without one giant settings page.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({to,icon:Icon,title,text})=><Link key={to} to={to} className="group rounded-[24px] border border-white/[.08] bg-[#111012] p-5 transition hover:-translate-y-0.5 hover:border-orange-500/30 hover:bg-[#161316]"><div className="mb-5 grid h-11 w-11 place-items-center rounded-2xl bg-orange-500/10 text-orange-400"><Icon className="h-5 w-5"/></div><h2 className="font-semibold">{title}</h2><p className="mt-1 text-sm text-zinc-500">{text}</p></Link>)}
        {privileged && <Link to="/admin" className="group rounded-[24px] border border-red-500/20 bg-red-950/10 p-5 hover:border-red-400/40"><div className="mb-5 grid h-11 w-11 place-items-center rounded-2xl bg-red-500/10 text-red-400"><Shield className="h-5 w-5"/></div><h2 className="font-semibold">Admin Panel</h2><p className="mt-1 text-sm text-zinc-500">Manage roles, premium status and badges.</p></Link>}
      </div>
    </main>
  </div>;
};