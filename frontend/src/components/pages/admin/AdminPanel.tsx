import React,{useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {apiService} from '../../../services/api';
import {UserRole} from '../../../types';

type AdminUser={
 id:number;username:string;name?:string;email:string;role:UserRole;premium:boolean;badges:string[];
 totalVisit?:number;verified?:boolean;accentColor?:string;textColor?:string;backgroundColor?:string;
 fontFamily?:string;customFontFamily?:string;profileOpacity?:number;profileBlur?:number;
 usernameEffect?:string;backgroundEffect?:string;cursorEffect?:string;layout?:string;
 customEmojis?:{name:string;value:string}[];
};

const Field=({label,value,onChange,placeholder}:{label:string;value:string;onChange:(v:string)=>void;placeholder?:string})=>
<label className="block"><span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{label}</span>
<input value={value} placeholder={placeholder} onChange={e=>onChange(e.target.value)} className="h-10 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm outline-none focus:border-red-500/50"/></label>;

const Select=({label,value,onChange,options}:{label:string;value:string;onChange:(v:string)=>void;options:string[]})=>
<label className="block"><span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{label}</span>
<select value={value} onChange={e=>onChange(e.target.value)} className="h-10 w-full rounded-xl border border-white/10 bg-[#151315] px-3 text-sm">{options.map(x=><option key={x}>{x}</option>)}</select></label>;

export const AdminPanel:React.FC=()=>{
 const [users,setUsers]=useState<AdminUser[]>([]); const [error,setError]=useState(''); const [loading,setLoading]=useState(true);
 const [query,setQuery]=useState(''); const [selected,setSelected]=useState<number|null>(null);
 const [badge,setBadge]=useState(''); const [emojiName,setEmojiName]=useState(''); const [emojiValue,setEmojiValue]=useState('');
 const [saving,setSaving]=useState(false); const [badgeDefs,setBadgeDefs]=useState<any[]>([]); const [newBadge,setNewBadge]=useState({name:'',image:'',fontFamily:'Inter',textColor:'#f4f0ef',accentColor:'#ef3340',animation:'glow',description:''});
 const load=async()=>{try{setUsers(await apiService.getAdminUsers() as AdminUser[])}catch(e){setError(e instanceof Error?e.message:'Unable to load admin panel')}finally{setLoading(false)}};
 useEffect(()=>{load(); apiService.getAdminBadgeDefinitions().then(setBadgeDefs).catch(()=>setBadgeDefs([]));},[]);
 const target=users.find(u=>u.id===selected)||null;
 const update=async(id:number,body:{role?:UserRole;premium?:boolean})=>{setError('');try{await apiService.updateAdminUser(id,body);await load()}catch(e){setError(e instanceof Error?e.message:'Update failed')}};
 const customize=async(body:Record<string,unknown>)=>{if(!target)return;setSaving(true);setError('');try{await apiService.updateAdminCustomization(target.id,body);await load()}catch(e){setError(e instanceof Error?e.message:'Customization update failed')}finally{setSaving(false)}};
 const addBadge=async()=>{if(!target||!badge.trim())return;try{await apiService.addAdminBadge(target.id,badge.trim());setBadge('');await load()}catch(e){setError(e instanceof Error?e.message:'Badge update failed')}};
 const saveBadgeDefinition=async()=>{if(!newBadge.name.trim())return;setSaving(true);setError('');try{const saved=await apiService.saveAdminBadgeDefinition(newBadge);setBadgeDefs(prev=>[...prev.filter(x=>x.name!==saved.name),saved]);setNewBadge({name:'',image:'',fontFamily:'Inter',textColor:'#f4f0ef',accentColor:'#ef3340',animation:'glow',description:''});}catch(e){setError(e instanceof Error?e.message:'Badge definition save failed')}finally{setSaving(false)}};
 const deleteBadgeDefinition=async(name:string)=>{try{await apiService.deleteAdminBadgeDefinition(name);setBadgeDefs(prev=>prev.filter(x=>x.name!==name));}catch(e){setError(e instanceof Error?e.message:'Badge definition delete failed')}};
 const readBadgeImage=(file:File)=>{const reader=new FileReader();reader.onload=()=>setNewBadge(v=>({...v,image:String(reader.result||'')}));reader.readAsDataURL(file)};
 const removeBadge=async(b:string)=>{if(!target)return;try{await apiService.removeAdminBadge(target.id,b);await load()}catch(e){setError(e instanceof Error?e.message:'Badge removal failed')}};
 const addEmoji=async()=>{if(!target||!emojiName.trim()||!emojiValue.trim())return;const next=[...(target.customEmojis||[]),{name:emojiName.trim(),value:emojiValue.trim()}];await customize({customEmojis:next});setEmojiName('');setEmojiValue('')};
 const filtered=users.filter(u=>`${u.username} ${u.email} ${u.name||''}`.toLowerCase().includes(query.toLowerCase()));
 const color=(v?:string)=>v||'#ef3340';
 return <div className="min-h-screen bg-[#070707] text-white">
  <header className="sticky top-0 z-30 border-b border-white/[.08] bg-[#0b0b0c]/95 backdrop-blur-xl"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
   <div><Link to="/dashboard" className="text-xl font-black">lost<span className="text-red-500">.lol</span></Link><div className="text-[10px] uppercase tracking-[.2em] text-zinc-500">Admin control center</div></div>
   <Link to="/dashboard" className="rounded-xl border border-white/10 px-4 py-2 text-sm hover:bg-white/5">Dashboard</Link>
  </div></header>
  <main className="mx-auto max-w-7xl px-5 py-7">
   <div className="mb-6 grid gap-3 sm:grid-cols-4">
    {[['Accounts',users.length],['Premium',users.filter(u=>u.premium).length],['Team',users.filter(u=>u.role!=='member').length],['Verified',users.filter(u=>u.verified).length]].map(([k,v])=><div key={String(k)} className="rounded-2xl border border-white/[.07] bg-[#0d0d0f] p-5"><p className="text-xs text-zinc-500">{k}</p><p className="mt-2 text-2xl font-bold">{v}</p></div>)}
   </div>
   {error&&<div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</div>}
   <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
    <section className="overflow-hidden rounded-2xl border border-white/[.08] bg-[#0c0c0e]">
     <div className="border-b border-white/[.07] p-4"><Field label="Search accounts" value={query} onChange={setQuery} placeholder="username, email, or display name"/></div>
     {loading?<div className="p-6 text-zinc-500">Loading users...</div>:<div className="divide-y divide-white/[.06]">{filtered.map(u=><button key={u.id} onClick={()=>setSelected(u.id)} className={`block w-full p-4 text-left transition-colors hover:bg-white/[.03] ${selected===u.id?'bg-red-500/[.06]':''}`}>
       <div className="flex items-center justify-between gap-3"><div className="min-w-0"><div className="truncate font-semibold">{u.username} {u.verified&&<span className="text-red-400">✓</span>}</div><div className="truncate text-xs text-zinc-500">{u.email}</div></div><span className="rounded-full bg-white/5 px-2 py-1 text-[10px] text-zinc-400">{u.role}</span></div>
       <div className="mt-3 flex flex-wrap gap-2"><span className="text-[10px] text-zinc-600">{u.totalVisit||0} views</span>{u.premium&&<span className="text-[10px] text-amber-300">premium</span>}{(u.badges||[]).map(b=><span key={b} className="rounded-full bg-red-500/10 px-2 py-1 text-[10px] text-red-300">{b}</span>)}</div>
     </button>)}</div>}
    </section>
    <section className="space-y-4">
     {!target?<div className="rounded-2xl border border-white/[.08] bg-[#0c0c0e] p-6 text-sm text-zinc-500">Select an account to manage roles, premium access, verification, colors, fonts, effects, badges, and custom emojis.</div>:
     <>
      <div className="rounded-2xl border border-white/[.08] bg-[#0c0c0e] p-5"><h2 className="font-semibold">{target.username}</h2><p className="mt-1 text-xs text-zinc-500">{target.email}</p>
       <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Select label="Role" value={target.role} onChange={v=>update(target.id,{role:v as UserRole})} options={['member','staff','co-owner','owner']}/>
        <div><span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Premium</span><button onClick={()=>update(target.id,{premium:!target.premium})} className={`h-10 w-full rounded-xl ${target.premium?'bg-amber-500/20 text-amber-200':'bg-white/10 text-zinc-400'}`}>{target.premium?'Enabled':'Disabled'}</button></div>
       </div>
       <label className="mt-3 flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm"><span>Verified badge</span><input type="checkbox" checked={!!target.verified} onChange={e=>customize({verified:e.target.checked})}/></label>
      </div>
      <div className="rounded-2xl border border-white/[.08] bg-[#0c0c0e] p-5"><h3 className="font-semibold">Colors & fonts</h3><div className="mt-4 grid gap-3 sm:grid-cols-2">
       <Field label="Accent" value={color(target.accentColor)} onChange={v=>customize({accentColor:v})}/><Field label="Text" value={color(target.textColor)} onChange={v=>customize({textColor:v})}/><Field label="Background" value={color(target.backgroundColor)} onChange={v=>customize({backgroundColor:v})}/><Field label="Font family" value={target.fontFamily||'Inter'} onChange={v=>customize({fontFamily:v})}/><Field label="Custom font family" value={target.customFontFamily||''} onChange={v=>customize({customFontFamily:v})}/>
       </div></div>
      <div className="rounded-2xl border border-white/[.08] bg-[#0c0c0e] p-5"><h3 className="font-semibold">Effects & layout</h3><div className="mt-4 grid gap-3 sm:grid-cols-2">
       <Select label="Username effect" value={target.usernameEffect||'none'} onChange={v=>customize({usernameEffect:v})} options={['none','pulse','float','shake','glow']}/>
       <Select label="Background effect" value={target.backgroundEffect||'none'} onChange={v=>customize({backgroundEffect:v})} options={['none','pulse','aurora','scanlines']}/>
       <Select label="Cursor effect" value={target.cursorEffect||'none'} onChange={v=>customize({cursorEffect:v})} options={['none','glow','red']}/>
       <Select label="Layout" value={target.layout||'default'} onChange={v=>customize({layout:v})} options={['default','compact','wide','card']}/>
       <Field label="Opacity (0.4–1)" value={String(target.profileOpacity??1)} onChange={v=>customize({profileOpacity:Number(v)})}/>
       <Field label="Blur (0–40)" value={String(target.profileBlur??0)} onChange={v=>customize({profileBlur:Number(v)})}/>
      </div></div>
      <div className="rounded-2xl border border-white/[.08] bg-[#0c0c0e] p-5"><div className="flex items-center justify-between"><div><h3 className="font-semibold">Badge studio</h3><p className="mt-1 text-xs text-zinc-500">Create reusable badges with their own image, typography, colors and animation.</p></div><span className="rounded-full bg-red-500/10 px-2 py-1 text-[10px] text-red-300">{badgeDefs.length} definitions</span></div>
       <div className="mt-4 grid gap-3 sm:grid-cols-2"><Field label="Badge name" value={newBadge.name} onChange={v=>setNewBadge(s=>({...s,name:v}))}/><Field label="Font family" value={newBadge.fontFamily} onChange={v=>setNewBadge(s=>({...s,fontFamily:v}))}/><Field label="Description" value={newBadge.description} onChange={v=>setNewBadge(s=>({...s,description:v}))}/><Select label="Animation" value={newBadge.animation} onChange={v=>setNewBadge(s=>({...s,animation:v}))} options={['none','pulse','float','spin','bounce','glow']}/><Field label="Text color" value={newBadge.textColor} onChange={v=>setNewBadge(s=>({...s,textColor:v}))}/><Field label="Accent color" value={newBadge.accentColor} onChange={v=>setNewBadge(s=>({...s,accentColor:v}))}/></div>
       <div className="mt-3 grid gap-3 sm:grid-cols-2"><Field label="Image URL (optional)" value={newBadge.image.startsWith('data:')?'':newBadge.image} onChange={v=>setNewBadge(s=>({...s,image:v}))}/><label className="block"><span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Badge image</span><input type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml" onChange={e=>{const f=e.target.files?.[0];if(f)readBadgeImage(f)}} className="h-10 w-full rounded-xl border border-white/10 bg-black/30 px-2 py-2 text-xs text-zinc-400"/></label></div>
       <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-4" style={{color:newBadge.textColor,fontFamily:newBadge.fontFamily}}><div className="grid h-11 w-11 place-items-center overflow-hidden rounded-xl bg-black/30">{newBadge.image?<img src={newBadge.image} alt="" className="h-full w-full object-contain"/>:<span className="text-lg font-black">B</span>}</div><div><div className="font-bold">{newBadge.name||'Badge preview'}</div><div className="text-[10px] opacity-60">Live badge preview</div></div></div>
       <button disabled={saving||!newBadge.name.trim()} onClick={saveBadgeDefinition} className="mt-4 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold disabled:opacity-40">{saving?'Saving…':'Create / update badge'}</button>
       <div className="mt-4 space-y-2">{badgeDefs.map(b=><div key={b.name} className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 p-3"><div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-lg bg-black/30">{b.image?<img src={b.image} alt="" className="h-full w-full object-contain"/>:<span className="text-xs font-bold">B</span>}</div><div className="min-w-0 flex-1" style={{fontFamily:b.fontFamily,color:b.textColor}}><div className="truncate text-sm font-bold">{b.name}</div><div className="text-[10px] opacity-60">{b.animation} · {b.fontFamily}</div></div><button onClick={()=>deleteBadgeDefinition(b.name)} className="text-xs text-red-400">Delete</button></div>)}</div>
      </div>
      <div className="rounded-2xl border border-white/[.08] bg-[#0c0c0e] p-5"><h3 className="font-semibold">Badges</h3><div className="mt-3 flex flex-wrap gap-2">{(target.badges||[]).map(b=><button key={b} onClick={()=>removeBadge(b)} className="rounded-full bg-red-500/10 px-3 py-1.5 text-xs text-red-300">{b} ×</button>)}</div><div className="mt-3 flex gap-2"><input value={badge} onChange={e=>setBadge(e.target.value)} placeholder="Badge name" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm"/><button onClick={addBadge} className="rounded-xl bg-red-500 px-3 py-2 text-sm font-semibold text-white">Give</button></div></div>
      <div className="rounded-2xl border border-white/[.08] bg-[#0c0c0e] p-5"><h3 className="font-semibold">Custom emojis</h3><div className="mt-3 grid gap-2 sm:grid-cols-2"><Field label="Name" value={emojiName} onChange={setEmojiName}/><Field label="Value / emoji" value={emojiValue} onChange={setEmojiValue}/></div><button disabled={saving} onClick={addEmoji} className="mt-3 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold disabled:opacity-50">Add emoji</button><div className="mt-3 space-y-2">{(target.customEmojis||[]).map((e,i)=><div key={`${e.name}-${i}`} className="flex items-center justify-between rounded-xl bg-black/20 px-3 py-2 text-sm"><span>:{e.name}: <span className="text-zinc-500">{e.value}</span></span><button onClick={()=>customize({customEmojis:(target.customEmojis||[]).filter((_,j)=>j!==i)})} className="text-xs text-red-400">Remove</button></div>)}</div></div>
     </>}
    </section>
   </div>
  </main>
 </div>;
};