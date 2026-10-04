import React from 'react';
import { Link } from 'react-router-dom';
import { User } from '../../../types';

const descriptions: Record<string,string> = {
 profile:'Manage your public identity, bio, avatar, location and profile visibility.',
 appearance:'Control colors, fonts, layouts, blur, gradients, animations and background effects.',
 socials:'Connect and organize your social profiles.',
 music:'Configure profile audio and the player shown to visitors.',
 widgets:'Manage Discord, media, project and custom profile widgets.',
 analytics:'See profile visits and link performance.',
 premium:'Advanced layouts, effects, widgets, metadata and premium customization.',
 account:'Manage your account preferences and security.'
};

export const DashboardSection: React.FC<{user:User; section:string}> = ({user,section}) => {
 const title = section[0].toUpperCase()+section.slice(1);
 const premiumOnly = ['premium','widgets'].includes(section);
 return <div className="min-h-screen bg-[#090909] text-white">
  <header className="border-b border-white/[.08] bg-[#0e0d0f]"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5"><div><Link to="/dashboard" className="text-xl font-bold">lost<span className="text-orange-500">.lol</span></Link><div className="text-[10px] uppercase tracking-[.2em] text-zinc-500">Dashboard / {section}</div></div><Link to="/dashboard" className="rounded-xl bg-white/10 px-4 py-2 text-sm">Back to dashboard</Link></div></header>
  <main className="mx-auto max-w-6xl px-5 py-8">
   <div className="rounded-[28px] border border-white/[.08] bg-[#111012] p-7">
    <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs uppercase tracking-wider text-orange-400">{title}</span>{premiumOnly && <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs text-amber-300">{user.premium?'Premium enabled':'Premium feature'}</span>}</div>
    <h1 className="mt-4 text-3xl font-bold">{title}</h1><p className="mt-2 max-w-2xl text-zinc-400">{descriptions[section]}</p>
   </div>
   <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {section==='appearance' ? ['Theme colors','Profile layout','Background & blur','Fonts','Username effects','Cursor & animations'].map(x=><Feature title={x} locked={!user.premium && ['Fonts','Username effects','Cursor & animations'].includes(x)}/>) :
     section==='music' ? ['Audio URL','Player title','Autoplay preference','Click sound'].map(x=><Feature title={x}/>) :
     section==='widgets' ? ['Discord presence','YouTube','Spotify','GitHub','Custom widget','Second profile tab'].map(x=><Feature title={x} locked={!user.premium && x!=='Discord presence'}/>) :
     section==='premium' ? ['Advanced layouts','Custom fonts','Typewriter text','Profile effects','Extra widgets','SEO metadata'].map(x=><Feature title={x} locked={!user.premium}/>) :
     ['Profile settings','Public visibility','Connected accounts','Advanced settings'].map(x=><Feature title={x}/>)}
   </div>
  </main>
 </div>
};
const Feature=({title,locked=false}:{title:string;locked?:boolean})=><div className="rounded-2xl border border-white/[.08] bg-black/20 p-5"><div className="flex items-center justify-between"><h2 className="font-semibold">{title}</h2>{locked&&<span className="text-[10px] uppercase tracking-wider text-amber-400">Premium</span>}</div><p className="mt-2 text-sm text-zinc-500">{locked?'This option is available with premium access.':'Configure this section from here.'}</p><button disabled={locked} className="mt-4 rounded-xl bg-white/10 px-4 py-2 text-xs disabled:opacity-40">Configure</button></div>;