import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Boxes, Crown, Link2, Music2, Palette, Save, Settings, Share2, UserRound, Shield } from 'lucide-react';
import { User, Link as LinkType } from '../../../types';
import { apiService } from '../../../services/api';

const nav=[
  ['Overview','/dashboard',BarChart3],['Analytics','/dashboard/analytics',BarChart3],['Badges','/dashboard/badges',Crown],
  ['Settings','/dashboard/settings',Settings],['Customize','/dashboard/appearance',Palette],['Links','/dashboard/links',Link2],
  ['Socials','/dashboard/socials',Share2],['Music','/dashboard/music',Music2],['Widgets','/dashboard/widgets',Boxes],['Profile','/dashboard/profile',UserRound]
] as const;

export const DashboardSection:React.FC<{user:User;section:string}>=({user,section})=>{
 const location=useLocation();
 const [local,setLocal]=React.useState<User>(user);
 const [links,setLinks]=React.useState<LinkType[]>([]);
 const [message,setMessage]=React.useState('');
 const [saving,setSaving]=React.useState(false);

 React.useEffect(()=>{setLocal(user);},[user]);
 React.useEffect(()=>{if(section==='links')apiService.getUserLinks(user._id).then(setLinks).catch(()=>setLinks([]));},[section,user.id]);

 const save=async(body:Record<string,unknown>)=>{
   setSaving(true);setMessage('');
   try{const updated=await apiService.updateProfilePreferences(user.username,body);setLocal(updated);setMessage('Saved successfully.');}
   catch(e){setMessage(e instanceof Error?e.message:'Could not save changes.');}
   finally{setSaving(false);}
 };

 const update=(key:string,value:unknown)=>setLocal(prev=>({...prev,[key]:value}));
 const title=section==='premium-layout'?'Layout Settings':section==='premium-metadata'?'Profile Metadata':section[0].toUpperCase()+section.slice(1);

 const music=section==='music';
 const widgets=section==='widgets';
 const analytics=section==='analytics';
 const linksPage=section==='links';

 return <div className="min-h-screen bg-[#080809] text-white lg:flex">
  <aside className="hidden w-[250px] shrink-0 border-r border-white/[.07] bg-[#0b0b0c] p-4 lg:block">
   <Link to="/dashboard" className="block px-3 pb-6 text-xl font-black">lost<span className="text-orange-500">.lol</span></Link>
   <nav className="space-y-1">{nav.map(([label,to,Icon])=><Link key={to} to={to} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${location.pathname===to?'bg-white/[.08] text-white':'text-zinc-500 hover:bg-white/[.04] hover:text-white'}`}><Icon size={17}/>{label}</Link>)}</nav>
   <div className="my-5 border-t border-white/[.06] pt-4 text-[10px] uppercase tracking-[.18em] text-zinc-600">Premium</div>
   {['owner','co-owner','staff'].includes(user.role||'')&&<Link to="/admin" className="mb-3 flex items-center gap-3 rounded-xl border border-red-500/10 bg-red-500/[.04] px-3 py-2.5 text-sm text-red-300"><Shield size={17}/>Admin Panel</Link>}
   <nav className="space-y-1"><Link to="/dashboard/premium" className="flex gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-400 hover:bg-white/[.04]"><Crown size={17}/>General</Link><Link to="/dashboard/premium/layout" className="flex gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-400 hover:bg-white/[.04]"><Boxes size={17}/>Layout Settings</Link><Link to="/dashboard/premium/metadata" className="flex gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-400 hover:bg-white/[.04]"><Save size={17}/>Profile Metadata</Link></nav>
  </aside>
  <main className="min-w-0 flex-1">
   <header className="border-b border-white/[.07] px-5 py-4 sm:px-8"><div className="mx-auto flex max-w-5xl items-center justify-between"><div><p className="text-[10px] uppercase tracking-[.2em] text-zinc-600">Dashboard</p><h1 className="mt-1 text-2xl font-bold">{title}</h1></div><Link to={`/${user.username}`} target="_blank" className="rounded-xl border border-white/[.08] px-3 py-2 text-xs text-zinc-400 hover:text-white">View profile</Link></div></header>
   <div className="mx-auto max-w-5xl px-5 py-7 sm:px-8">
    {message&&<div className="mb-4 rounded-xl border border-orange-500/20 bg-orange-500/5 px-4 py-3 text-sm text-orange-300">{message}</div>}

    {linksPage?<LinksEditor user={user} links={links} setLinks={setLinks}/>:
    analytics?<section className="grid gap-4 sm:grid-cols-3"><Stat title="Profile views" value={(user.totalVisit||0).toLocaleString()}/><Stat title="Links" value={links.length.toString()}/><Stat title="Account" value={user.role||'member'}/><div className="sm:col-span-3 rounded-2xl border border-white/[.07] bg-[#0e0e10] p-5"><h2 className="font-semibold">Profile performance</h2><p className="mt-2 text-sm text-zinc-500">Your profile has {user.totalVisit||0} recorded visits. Link-level analytics can be added here without requiring premium.</p></div></section>:
    music?<Editor title="Music" text="Audio is available to every account."><Field label="Audio URL" value={local.audioUrl||''} onChange={v=>update('audioUrl',v)}/><Field label="Player title" value={local.audioTitle||''} onChange={v=>update('audioTitle',v)}/><SaveButton saving={saving} onClick={()=>save({audioUrl:local.audioUrl||'',audioTitle:local.audioTitle||''})}/></Editor>:
    widgets?<Editor title="Widgets" text="All widgets are available without premium."><Toggle label="Discord presence" value={!!local.showDiscordPresence} onChange={v=>update('showDiscordPresence',v)}/><Field label="Discord username" value={local.discordUsername||''} onChange={v=>update('discordUsername',v)}/><Toggle label="Second profile tab" value={!!local.secondTab?.enabled} onChange={v=>update('secondTab',{...(local.secondTab||{}),enabled:v})}/><SaveButton saving={saving} onClick={()=>save({showDiscordPresence:!!local.showDiscordPresence,discordUsername:local.discordUsername||'',secondTab:local.secondTab||{}})}/></Editor>:
    section==='appearance'?<Editor title="Customize" text="Appearance controls are available here."><Field label="Font family" value={local.fontFamily||''} onChange={v=>update('fontFamily',v)}/><Field label="Username effect" value={local.usernameEffect||''} onChange={v=>update('usernameEffect',v)}/><Field label="Background effect" value={local.backgroundEffect||''} onChange={v=>update('backgroundEffect',v)}/><SaveButton saving={saving} onClick={()=>save({fontFamily:local.fontFamily||'',usernameEffect:local.usernameEffect||'',backgroundEffect:local.backgroundEffect||''})}/></Editor>:
    section==='profile'||section==='socials'||section==='settings'?<Editor title={title} text="Changes save directly to your profile."><Field label="Location" value={local.location||''} onChange={v=>update('location',v)}/><Toggle label="Show location" value={!!local.showLocation} onChange={v=>update('showLocation',v)}/><SaveButton saving={saving} onClick={()=>save({location:local.location||'',showLocation:!!local.showLocation})}/></Editor>:
    <Editor title={title} text="Configure this section from the dashboard."><p className="text-sm text-zinc-500">This panel is ready for configuration.</p></Editor>}
   </div>
  </main>
 </div>
};

const LinksEditor=({user,links,setLinks}:{user:User;links:LinkType[];setLinks:React.Dispatch<React.SetStateAction<LinkType[]>>})=>{
 const [title,setTitle]=React.useState('');const [url,setUrl]=React.useState('');const [saving,setSaving]=React.useState(false);
 const add=async()=>{if(!title||!url)return;setSaving(true);try{const x=await apiService.createLink({userId:user.id,title,url});setLinks(v=>[...v,x]);setTitle('');setUrl('');}finally{setSaving(false);}};
 return <section className="space-y-4"><div className="rounded-2xl border border-white/[.07] bg-[#0e0e10] p-5"><h2 className="font-semibold">Links</h2><p className="mt-1 text-sm text-zinc-500">Manage your profile links here — this is the new dashboard panel.</p><div className="mt-4 grid gap-3 sm:grid-cols-2"><Field label="Title" value={title} onChange={setTitle}/><Field label="URL" value={url} onChange={setUrl}/></div><button onClick={add} disabled={saving} className="mt-4 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-black disabled:opacity-50">{saving?'Adding…':'Add link'}</button></div><div className="space-y-2">{links.map(l=><div key={l.id} className="flex items-center justify-between rounded-xl border border-white/[.07] bg-[#0e0e10] p-4"><div><p className="font-medium">{l.title}</p><p className="text-xs text-zinc-600">{l.url}</p></div><button onClick={async()=>{await apiService.deleteLink(l.id);setLinks(v=>v.filter(x=>x.id!==l.id));}} className="text-xs text-red-400">Delete</button></div>)}</div></section>
};

const Editor=({title,text,children}:{title:string;text:string;children:React.ReactNode})=><section className="rounded-2xl border border-white/[.07] bg-[#0e0e10] p-6"><h2 className="text-lg font-semibold">{title}</h2><p className="mt-1 text-sm text-zinc-500">{text}</p><div className="mt-6 space-y-4">{children}</div></section>;
const Field=({label,value,onChange}:{label:string;value:string;onChange:(v:string)=>void})=><label className="block"><span className="mb-2 block text-xs text-zinc-500">{label}</span><input value={value} onChange={e=>onChange(e.target.value)} className="h-11 w-full rounded-xl border border-white/[.08] bg-black/20 px-3 text-sm outline-none focus:border-orange-500/50"/></label>;
const Toggle=({label,value,onChange}:{label:string;value:boolean;onChange:(v:boolean)=>void})=><label className="flex items-center justify-between rounded-xl border border-white/[.08] bg-black/20 px-4 py-3 text-sm"><span>{label}</span><input type="checkbox" checked={value} onChange={e=>onChange(e.target.checked)}/></label>;
const SaveButton=({saving,onClick}:{saving:boolean;onClick:()=>void})=><button onClick={onClick} className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-black disabled:opacity-50" disabled={saving}>{saving?'Saving…':'Save changes'}</button>;
const Stat=({title,value}:{title:string;value:string})=><div className="rounded-2xl border border-white/[.07] bg-[#0e0e10] p-5"><p className="text-xs text-zinc-500">{title}</p><p className="mt-3 text-2xl font-bold">{value}</p></div>;
