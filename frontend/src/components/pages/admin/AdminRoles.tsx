import React,{useEffect,useMemo,useState} from 'react';
import {Link} from 'react-router-dom';
import {apiService} from '../../../services/api';

type Role={_id:string;name:string;key:string;level:number;color:string;description:string;permissions:string[]};
type AdminUser={id:number;username:string;email:string;role:string;adminRoleId?:string;rootOwner?:boolean};
const PERMISSIONS=[
 ['view_dashboard','View admin dashboard','Access the admin area and summary.'],
 ['manage_users','Manage users','Search and inspect user accounts.'],
 ['ban_users','Ban and unban users','Moderate accounts and release banned usernames.'],
 ['manage_roles','Manage roles','Promote and demote users.'],
 ['manage_premium','Manage Premium','Grant or revoke Premium access.'],
 ['manage_badges','Manage badges','Create, assign, hide and remove badges.'],
 ['customize_users','Customize user profiles','Edit profile appearance and settings.'],
 ['manage_site','Customize site','Manage global site appearance and configuration.'],
 ['manage_homepage','Manage homepage','Edit public homepage content and sections.'],
 ['manage_comments','Moderate comments','Review and remove profile comments.'],
 ['view_analytics','View analytics','See platform and profile analytics.'],
 ['manage_admins','Manage administrators','Assign admin ranks and manage staff access.'],
] as const;

export const AdminRoles:React.FC=()=>{
 const [roles,setRoles]=useState<Role[]>([]),[users,setUsers]=useState<AdminUser[]>([]);
 const [allowed,setAllowed]=useState(false),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[error,setError]=useState('');
 const [editing,setEditing]=useState<string|null>(null);
 const [form,setForm]=useState({name:'',key:'',level:10,color:'#a1a1aa',description:'',permissions:['view_dashboard'] as string[]});
 const [search,setSearch]=useState('');
 const load=async()=>{setLoading(true);setError('');try{const me=await apiService.getAdminMe();if(!me.rootOwner){setAllowed(false);setError('Only the primary owner can manage custom administrator ranks.');return;}setAllowed(true);const [r,u]=await Promise.all([apiService.getAdminRoles(),apiService.getAdminUsers()]);setRoles(r);setUsers(u);}catch(e){setError(e instanceof Error?e.message:'Unable to load administrator settings.')}finally{setLoading(false)}};
 useEffect(()=>{void load()},[]);
 const reset=()=>{setEditing(null);setForm({name:'',key:'',level:10,color:'#a1a1aa',description:'',permissions:['view_dashboard']})};
 const edit=(r:Role)=>{setEditing(r._id);setForm({name:r.name,key:r.key,level:r.level,color:r.color,description:r.description||'',permissions:r.permissions||[]});window.scrollTo({top:0,behavior:'smooth'})};
 const save=async()=>{setSaving(true);setError('');try{const saved=await apiService.saveAdminRole(form);setRoles(old=>[...old.filter(r=>r._id!==saved._id),saved].sort((a,b)=>b.level-a.level));reset()}catch(e){setError(e instanceof Error?e.message:'Could not save rank')}finally{setSaving(false)}};
 const remove=async(id:string)=>{if(!window.confirm('Delete this rank? It must have no assigned administrators.'))return;try{await apiService.deleteAdminRole(id);await load()}catch(e){setError(e instanceof Error?e.message:'Could not delete rank')}};
 const assign=async(id:number,roleId:string)=>{try{await apiService.assignAdminRole(id,roleId||null);await load()}catch(e){setError(e instanceof Error?e.message:'Could not assign rank')}};
 const filtered=useMemo(()=>users.filter(u=>!u.rootOwner&&[u.username,u.email].join(' ').toLowerCase().includes(search.toLowerCase())),[users,search]);
 if(loading)return <main className="min-h-screen bg-[#080808] p-8 text-zinc-400">Loading administrator controls…</main>;
 return <main className="min-h-screen bg-[#080808] text-white">
  <header className="border-b border-white/[.08] bg-black/60"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5"><div><Link to="/admin" className="text-xl font-black">suffer.info</Link><p className="mt-1 text-[10px] uppercase tracking-[.2em] text-zinc-500">Administrator ranks & permissions</p></div><Link to="/admin" className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-300">Back to admin</Link></div></header>
  <div className="mx-auto max-w-7xl space-y-6 px-5 py-7">
   {error&&<div className="rounded-xl border border-white/10 bg-white/[.04] p-4 text-sm text-zinc-300">{error}</div>}
   {allowed&&<>
    <section className="rounded-2xl border border-white/[.08] bg-[#101012] p-5 sm:p-7">
     <div className="mb-5 flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-xl font-bold">{editing?'Edit administrator rank':'Create administrator rank'}</h1><p className="mt-1 text-sm text-zinc-500">Create custom staff ranks and choose exactly what each rank can access.</p></div>{editing&&<button onClick={reset} className="rounded-xl border border-white/10 px-3 py-2 text-xs">Cancel edit</button>}</div>
     <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <label className="text-xs text-zinc-400">Rank name<input value={form.name} onChange={e=>setForm(s=>({...s,name:e.target.value,key:editing?s.key:e.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}))} maxLength={32} className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white"/></label>
      <label className="text-xs text-zinc-400">Rank key<input value={form.key} onChange={e=>setForm(s=>({...s,key:e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,'')}))} maxLength={40} className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white"/></label>
      <label className="text-xs text-zinc-400">Hierarchy level (1–99)<input type="number" min={1} max={99} value={form.level} onChange={e=>setForm(s=>({...s,level:Number(e.target.value)}))} className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white"/></label>
      <label className="text-xs text-zinc-400">Rank color<input type="color" value={form.color} onChange={e=>setForm(s=>({...s,color:e.target.value}))} className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/30 p-1"/></label>
     </div>
     <label className="mt-4 block text-xs text-zinc-400">Description<textarea value={form.description} onChange={e=>setForm(s=>({...s,description:e.target.value}))} maxLength={180} rows={2} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-white"/></label>
     <div className="mt-6"><div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Permissions</h2><span className="text-xs text-zinc-500">{form.permissions.length} selected</span></div><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{PERMISSIONS.map(([key,label,desc])=><label key={key} className="flex items-start gap-3 rounded-xl border border-white/[.08] bg-black/20 p-3"><input type="checkbox" checked={form.permissions.includes(key)} onChange={e=>setForm(s=>({...s,permissions:e.target.checked?[...s.permissions,key]:s.permissions.filter(p=>p!==key)}))} className="mt-1"/><span><span className="block text-sm font-medium">{label}</span><span className="mt-1 block text-[11px] leading-4 text-zinc-500">{desc}</span></span></label>)}</div></div>
     <button disabled={saving||!form.name.trim()||!form.key.trim()} onClick={save} className="mt-6 rounded-xl bg-white px-5 py-3 text-sm font-bold text-black disabled:opacity-40">{saving?'Saving…':editing?'Save rank changes':'Create rank'}</button>
    </section>
    <section className="rounded-2xl border border-white/[.08] bg-[#101012] p-5 sm:p-7"><div className="mb-4"><h2 className="text-lg font-bold">Existing ranks</h2><p className="mt-1 text-sm text-zinc-500">Higher levels indicate greater hierarchy. The primary owner account is protected separately.</p></div><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{roles.map(r=><article key={r._id} className="rounded-xl border border-white/10 bg-black/20 p-4"><div className="flex items-center justify-between gap-2"><span className="font-semibold" style={{color:r.color}}>{r.name}</span><span className="text-[10px] text-zinc-500">Level {r.level}</span></div><p className="mt-2 text-xs text-zinc-500">{r.description||r.key}</p><p className="mt-3 text-xs text-zinc-400">{r.permissions.length} permissions</p><div className="mt-4 flex gap-2"><button onClick={()=>edit(r)} className="rounded-lg border border-white/10 px-3 py-2 text-xs">Edit</button><button onClick={()=>remove(r._id)} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-400">Delete</button></div></article>)}{!roles.length&&<p className="text-sm text-zinc-500">No custom ranks yet.</p>}</div></section>
    <section className="rounded-2xl border border-white/[.08] bg-[#101012] p-5 sm:p-7"><h2 className="text-lg font-bold">Assign administrator ranks</h2><p className="mt-1 text-sm text-zinc-500">Assign a custom rank to a user to grant its permissions. Remove the rank to return the account to member access.</p><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search username or email" className="mt-4 h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm"/><div className="mt-4 divide-y divide-white/[.06]">{filtered.map(u=><div key={u.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><p className="text-sm font-semibold">{u.username}</p><p className="text-xs text-zinc-500">{u.email}</p></div><select value={u.adminRoleId||''} onChange={e=>assign(u.id,e.target.value)} className="min-w-48 rounded-xl border border-white/10 bg-[#171719] px-3 py-2 text-sm"><option value="">Member / no admin rank</option>{roles.map(r=><option key={r._id} value={r._id}>{r.name}</option>)}</select></div>)}</div></section>
   </>}
  </div>
 </main>;
};
