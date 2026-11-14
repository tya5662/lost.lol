import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiService } from '../../../services/api';

type Deployment = { id:string; url:string; state:string; target:string; createdAt:number|null; branch:string; commit:string; message:string };
type WorkflowRun = { id:number; name:string; status:string; conclusion:string|null; branch:string; commit:string; url:string; createdAt:string|null };
type StatusData = { readOnly:boolean; checkedAt:string; integrations:{vercel:{connected:boolean;reason?:string;deployments:Deployment[]};github:{connected:boolean;reason?:string;runs:WorkflowRun[]}} };

const StatePill:React.FC<{value:string}> = ({value}) => {
 const normalized=value.toLowerCase();
 const tone=normalized==='ready'||normalized==='success'?'border-emerald-500/20 bg-emerald-500/10 text-emerald-300':normalized==='error'||normalized==='failure'?'border-red-500/20 bg-red-500/10 text-red-300':'border-white/10 bg-white/5 text-zinc-300';
 return <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${tone}`}>{value.replaceAll('_',' ')}</span>;
};

const IntegrationCard:React.FC<{title:string;connected:boolean;reason?:string}> = ({title,connected,reason}) => <div className="rounded-2xl border border-white/[.08] bg-[#101012] p-4"><div className="flex items-center justify-between"><span className="font-semibold">{title}</span><StatePill value={connected?'connected':'not connected'}/></div>{reason&&<p className="mt-3 break-words text-xs leading-5 text-zinc-500">{reason}</p>}</div>;

export const AutopilotPage:React.FC=()=>{
 const navigate=useNavigate();
 const [data,setData]=useState<StatusData|null>(null);
 const [loading,setLoading]=useState(true);
 const [refreshing,setRefreshing]=useState(false);
 const [error,setError]=useState('');
 const load=useCallback(async(initial=false)=>{
   if(initial)setLoading(true);else setRefreshing(true);
   setError('');
   try{setData(await apiService.getAutopilotStatus() as StatusData);}
   catch(e){setError(e instanceof Error?e.message:'Could not load Autopilot status.');}
   finally{setLoading(false);setRefreshing(false);}
 },[]);
 useEffect(()=>{
   if(!localStorage.getItem('token')){navigate('/admin/login',{replace:true});return;}
   apiService.getAdminMe().then(me=>{if(!me?.rootOwner)navigate('/admin',{replace:true});else void load(true);}).catch(()=>navigate('/admin/login',{replace:true}));
 },[load,navigate]);
 const integrations=data?.integrations;
 return <main className="min-h-screen bg-[#080809] text-white">
  <header className="sticky top-0 z-20 border-b border-white/[.08] bg-[#0b0b0c]/90 backdrop-blur-xl"><div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-4"><div><Link to="/admin" className="text-sm text-zinc-500 hover:text-white">← Admin control center</Link><h1 className="mt-1 text-xl font-black tracking-tight">Suffer Autopilot</h1></div><button onClick={()=>void load(false)} disabled={loading||refreshing} className="rounded-xl border border-white/10 bg-white/[.04] px-4 py-2 text-sm font-semibold hover:bg-white/[.08] disabled:opacity-50">{refreshing?'Checking…':'Refresh status'}</button></div></header>
  <div className="mx-auto max-w-7xl space-y-6 px-5 py-7">
   <section className="rounded-3xl border border-white/[.08] bg-gradient-to-br from-[#171719] to-[#0d0d0f] p-6 md:p-8"><div className="flex flex-wrap items-start justify-between gap-4"><div className="max-w-2xl"><p className="text-[10px] font-bold uppercase tracking-[.28em] text-zinc-400">Release control</p><h2 className="mt-3 text-2xl font-black md:text-3xl">Test first. Deploy second. Verify last.</h2><p className="mt-3 text-sm leading-6 text-zinc-400">The control center is being built in safe stages. This first stage reads deployment and CI status only. It cannot merge code, change settings, or deploy to production.</p></div><StatePill value="read-only mode"/></div></section>
   {error&&<div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>}
   <section><div className="mb-3"><h3 className="font-bold">Connected services</h3><p className="mt-1 text-xs text-zinc-500">Credentials are read only from backend environment variables and are never sent to the browser.</p></div><div className="grid gap-3 md:grid-cols-2">{loading?<div className="h-24 animate-pulse rounded-2xl bg-white/5"/>:<><IntegrationCard title="Vercel" connected={!!integrations?.vercel.connected} reason={integrations?.vercel.reason}/><IntegrationCard title="GitHub Actions" connected={!!integrations?.github.connected} reason={integrations?.github.reason}/></>}</div></section>
   <section><div className="mb-3 flex items-end justify-between"><div><h3 className="font-bold">Recent deployments</h3><p className="mt-1 text-xs text-zinc-500">Latest Vercel deployment records.</p></div><span className="text-xs text-zinc-600">{integrations?.vercel.deployments.length||0} shown</span></div><div className="overflow-hidden rounded-2xl border border-white/[.08] bg-[#101012]">{loading?<div className="p-6 text-sm text-zinc-500">Loading deployments…</div>:!integrations?.vercel.deployments.length?<div className="p-6 text-sm text-zinc-500">No deployment records available. Connect the Vercel integration to populate this section.</div>:<div className="divide-y divide-white/[.06]">{integrations.vercel.deployments.map(d=><div key={d.id} className="flex flex-wrap items-center justify-between gap-3 p-4"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><StatePill value={d.state}/><span className="text-xs text-zinc-500">{d.target}</span></div><p className="mt-2 truncate text-sm font-medium">{d.message||d.branch||'Deployment'}</p><p className="mt-1 text-[11px] text-zinc-600">{d.branch} · {d.commit.slice(0,8)}</p></div>{d.url&&<a href={d.url} target="_blank" rel="noreferrer" className="text-xs text-zinc-300 underline underline-offset-4 hover:text-white">Open deployment</a>}</div>)}</div>}</div></section>
   <section><div className="mb-3 flex items-end justify-between"><div><h3 className="font-bold">GitHub checks</h3><p className="mt-1 text-xs text-zinc-500">Recent workflow runs for the repository.</p></div><span className="text-xs text-zinc-600">{integrations?.github.runs.length||0} shown</span></div><div className="overflow-hidden rounded-2xl border border-white/[.08] bg-[#101012]">{loading?<div className="p-6 text-sm text-zinc-500">Loading checks…</div>:!integrations?.github.runs.length?<div className="p-6 text-sm text-zinc-500">No workflow runs available. Connect GitHub to populate this section.</div>:<div className="divide-y divide-white/[.06]">{integrations.github.runs.map(run=><div key={run.id} className="flex flex-wrap items-center justify-between gap-3 p-4"><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{run.name}</p><p className="mt-1 text-[11px] text-zinc-600">{run.branch} · {run.commit.slice(0,8)}</p></div><div className="flex items-center gap-3"><StatePill value={run.conclusion||run.status}/>{run.url&&<a href={run.url} target="_blank" rel="noreferrer" className="text-xs text-zinc-300 underline underline-offset-4">Logs</a>}</div></div>)}</div>}</div></section>
   <section className="rounded-2xl border border-amber-500/15 bg-amber-500/[.04] p-5"><h3 className="font-semibold text-amber-100">Automation is not enabled yet</h3><p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">Automatic repairs, workflow dispatch, production promotion, health verification, and rollback are deliberately disabled until protected credentials, required checks, and a rollback target are verified. This avoids a bot repeatedly deploying untested changes.</p><p className="mt-3 text-xs text-zinc-600">{data?.checkedAt? `Last checked ${new Date(data.checkedAt).toLocaleString()}`:'Status has not been checked yet.'}</p></section>
  </div>
 </main>;
};
