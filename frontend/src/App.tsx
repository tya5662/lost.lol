import React,{useEffect,useState} from 'react';
import {Route,BrowserRouter as Router,Routes,useLocation} from 'react-router-dom';
import ProfilePage from './components/pages/profile/ProfilePage';
import {HomePage} from './components/pages/homepage/HomePage';
import {AuthPage} from './components/auth/AuthPage';
import {DashboardHome} from './components/pages/dashboard/DashboardHome';
import {DashboardSection} from './components/pages/dashboard/DashboardSection';
import {SiteEditor} from './components/pages/dashboard/SiteEditor';
import {AdminPanel} from './components/pages/admin/AdminPanel';
import {AUTH,apiService} from './services/api';
import {User} from './types';
import {Analytics} from '@vercel/analytics/react';

const MaintenanceScreen:React.FC<{settings:any}>=({settings})=><main className="grid min-h-screen place-items-center bg-[#070707] px-6 text-white"><section className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/[.03] p-8 text-center shadow-2xl"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-red-500/20 bg-red-500/10 text-2xl">✦</div><p className="mt-5 text-xs font-bold uppercase tracking-[.25em] text-red-300">suffer.info</p><h1 className="mt-3 text-3xl font-black">{settings?.maintenanceTitle||'We’ll be back soon'}</h1><p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-zinc-400">{settings?.maintenanceMessage||'We are making improvements. Please check back soon.'}</p>{settings?.maintenanceEta&&<p className="mt-4 text-sm text-red-300">{settings.maintenanceEta}</p>}<p className="mt-8 text-xs text-zinc-600">Maintenance is in progress.</p></section></main>;

const DashboardRouter:React.FC=()=>{const [user,setUser]=useState<User|null>(null);const [loading,setLoading]=useState(true);const [settings,setSettings]=useState<any>(null);const location=useLocation();
 useEffect(()=>{apiService.getSiteSettings().then(setSettings).catch(()=>setSettings({maintenanceMode:false}));const token=localStorage.getItem('token');if(!token){setLoading(false);return;}fetch(AUTH,{headers:{Authorization:`Bearer ${token}`}}).then(async r=>{if(!r.ok)throw new Error();return r.json()}).then(setUser).catch(()=>{}).finally(()=>setLoading(false))},[]);
 if(loading||!settings)return <div className="min-h-screen grid place-items-center bg-[#090909] text-zinc-500">Loading dashboard...</div>;
 if(!user){window.location.href='/login';return null;}
 const privileged=['owner','co-owner','staff'].includes(user.role||'');
 if(settings.maintenanceMode&&!privileged)return <MaintenanceScreen settings={settings}/>;
 if(location.pathname==='/dashboard')return <DashboardHome user={user}/>;
 const parts=location.pathname.split('/').filter(Boolean);
 const isPremiumRoute = (parts[1] === 'premium' && parts[2] !== 'metadata') || parts[1] === 'aliases';
 if(isPremiumRoute && !user.premium){
   if(location.pathname !== '/dashboard') window.history.replaceState({},'', '/dashboard');
   return <DashboardHome user={user}/>;
 }
 if(parts[0]==='dashboard'&&parts[1]==='premium'&&parts[2])return <DashboardSection user={user} section={`premium-${parts[2]}`}/>;
 if(parts[0]==='dashboard'&&parts[1]==='site')return <SiteEditor user={user}/>;
 const section=parts[1]||'profile';
 return <DashboardSection user={user} section={section}/>;
};

const PublicSiteGate:React.FC<{children:React.ReactNode}>=({children})=>{const [settings,setSettings]=useState<any>(null);useEffect(()=>{apiService.getSiteSettings().then(setSettings).catch(()=>setSettings({maintenanceMode:false}));},[]);if(!settings)return <div className="min-h-screen bg-[#070707]"/>;if(settings.maintenanceMode)return <MaintenanceScreen settings={settings}/>;return <>{children}</>;};

const App:React.FC=()=> <><Analytics/><Router><Routes>
 <Route path="/" element={<PublicSiteGate><HomePage/></PublicSiteGate>}/><Route path="/login" element={<AuthPage/>}/><Route path="/register" element={<AuthPage/>}/>
 <Route path="/dashboard/*" element={<DashboardRouter/>}/><Route path="/admin" element={<AdminPanel/>}/><Route path="/:username" element={<PublicSiteGate><ProfilePage/></PublicSiteGate>}/>
</Routes></Router></>;
export default App;