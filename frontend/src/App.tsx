import React,{useEffect,useState} from 'react';
import {Route,BrowserRouter as Router,Routes,useLocation} from 'react-router-dom';
import ProfilePage from './components/pages/profile/ProfilePage';
import {HomePage} from './components/pages/homepage/HomePage';
import {AuthPage} from './components/auth/AuthPage';
import {Dashboard} from './components/pages/dashboard/Dashboard';
import {DashboardHome} from './components/pages/dashboard/DashboardHome';
import {DashboardSection} from './components/pages/dashboard/DashboardSection';
import {AdminPanel} from './components/pages/admin/AdminPanel';
import {AUTH} from './services/api';
import {User} from './types';
import {Analytics} from '@vercel/analytics/react';

const DashboardRouter:React.FC=()=>{const [user,setUser]=useState<User|null>(null);const [loading,setLoading]=useState(true);const location=useLocation();
 useEffect(()=>{const token=localStorage.getItem('token');if(!token){setLoading(false);return;}fetch(AUTH,{headers:{Authorization:`Bearer ${token}`}}).then(async r=>{if(!r.ok)throw new Error();return r.json()}).then(setUser).catch(()=>{}).finally(()=>setLoading(false))},[]);
 if(loading)return <div className="min-h-screen grid place-items-center bg-[#090909] text-zinc-500">Loading dashboard...</div>;
 if(!user){location.href='/login';return null;}
 if(location.pathname==='/dashboard')return <DashboardHome user={user}/>;
 if(location.pathname==='/dashboard/links')return <Dashboard/>;
 const section=location.pathname.split('/')[2]||'profile';
 return <DashboardSection user={user} section={section}/>;
};

const App:React.FC=()=> <><Analytics/><Router><Routes>
 <Route path="/" element={<HomePage/>}/><Route path="/login" element={<AuthPage/>}/><Route path="/register" element={<AuthPage/>}/>
 <Route path="/dashboard/*" element={<DashboardRouter/>}/><Route path="/admin" element={<AdminPanel/>}/><Route path="/:username" element={<ProfilePage/>}/>
</Routes></Router></>;
export default App;