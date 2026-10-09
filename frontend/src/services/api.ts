import { backendUrl } from '@/backendUrl';
import { User, Link as LinkType, UserRole, SiteSettings } from '../types';

export const BURL = backendUrl;
export const AUTH = `${backendUrl}/auth/me`;
export const API_URL = `${backendUrl}/api`;

interface AuthResponse { token?: string; otpRequired?: boolean; email?: string; user: { id:number; username:string; name:string; email:string; }; }

const requestJson = async (path:string, init?:RequestInit):Promise<any>=>{
  try{const response=await fetch(`${backendUrl}${path}`,init);const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(typeof data?.message==='string'?data.message:`Request failed (${response.status})`);return data;}
  catch(error){if(error instanceof TypeError)throw new Error('Unable to reach the suffer.info server. Please try again in a moment.');throw error;}
};
const authHeaders=()=>({Authorization:`Bearer ${localStorage.getItem('token')??''}`});
const submitAuth=async(path:'register'|'login',details:Record<string,string>):Promise<AuthResponse>=>{const data=await requestJson(`/auth/${path}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(details)});if(data.token)localStorage.setItem('token',data.token);return data as AuthResponse;};

export const apiService={
 registerAccount:(details:{email:string;username:string;password:string;turnstileToken:string})=>submitAuth('register',details),
 loginAccount:(details:{identifier:string;password:string;turnstileToken:string})=>submitAuth('login',details),
 logout:()=>{localStorage.removeItem('token');},
 getUser:async(username:string):Promise<User>=>requestJson(`/api/users/${encodeURIComponent(username)}`),
 getSiteSettings:async():Promise<SiteSettings>=>requestJson('/api/site-settings'),
 getCommunityTemplates:async()=>requestJson('/api/community-templates'),
 createCommunityTemplate:async(body:{name:string;description:string;previewImage:string;settings:Record<string,unknown>})=>requestJson('/api/community-templates',{method:'POST',headers:{'Content-Type':'application/json',...authHeaders()},body:JSON.stringify(body)}),
 deleteCommunityTemplate:async(id:string)=>requestJson(`/api/community-templates/${encodeURIComponent(id)}`,{method:'DELETE',headers:authHeaders()}),
 updateSiteSettings:async(body:SiteSettings):Promise<SiteSettings>=>requestJson('/api/site-settings',{method:'PATCH',headers:{'Content-Type':'application/json',...authHeaders()},body:JSON.stringify(body)}),
 getUserLinks:async(userId:number|string):Promise<LinkType[]>=>requestJson(`/api/links/user/${userId}`),
 createLink:async(link:{userId:number|string;title:string;url:string})=>requestJson('/api/links',{method:'POST',headers:{'Content-Type':'application/json',...authHeaders()},body:JSON.stringify(link)}).then(data=>data.link??data),
 updateLink:async(id:number,link:{title:string;url:string})=>requestJson(`/api/links/${id}`,{method:'PUT',headers:{'Content-Type':'application/json',...authHeaders()},body:JSON.stringify(link)}).then(data=>data.link??data),
 deleteLink:async(id:number)=>{await requestJson(`/api/links/${id}`,{method:'DELETE',headers:authHeaders()})},
 reorderLinks:async(userId:number,linkIds:number[])=>{await requestJson(`/api/links/reorder/${userId}`,{method:'PUT',headers:{'Content-Type':'application/json',...authHeaders()},body:JSON.stringify({linkIds})})},
 getAdminUsers:async()=>requestJson('/admin/users',{headers:authHeaders()}),
 getAdminBadgeDefinitions:async()=>requestJson('/admin/badge-definitions',{headers:authHeaders()}),
 saveAdminBadgeDefinition:async(body:Record<string,unknown>)=>requestJson('/admin/badge-definitions',{method:'POST',headers:{'Content-Type':'application/json',...authHeaders()},body:JSON.stringify(body)}),
 deleteAdminBadgeDefinition:async(name:string)=>requestJson(`/admin/badge-definitions/${encodeURIComponent(name)}`,{method:'DELETE',headers:authHeaders()}),
 getAvailableBadges:async()=>requestJson('/api/users/badges',{headers:authHeaders()}),
 claimBadge:async(badge:string)=>requestJson('/api/users/badges/claim',{method:'POST',headers:{'Content-Type':'application/json',...authHeaders()},body:JSON.stringify({badge})}),
 updateAdminUser:async(id:number,body:{role?:UserRole;premium?:boolean})=>requestJson(`/admin/users/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json',...authHeaders()},body:JSON.stringify(body)}),
 updateAdminPermissions:async(id:number,body:Record<string,boolean>)=>requestJson(`/admin/users/${id}/permissions`,{method:'PATCH',headers:{'Content-Type':'application/json',...authHeaders()},body:JSON.stringify(body)}),
 banAdminUser:async(id:number,reason:string)=>requestJson(`/admin/users/${id}/ban`,{method:'POST',headers:{'Content-Type':'application/json',...authHeaders()},body:JSON.stringify({reason})}),
 unbanAdminUser:async(id:number)=>requestJson(`/admin/users/${id}/ban`,{method:'DELETE',headers:authHeaders()}),
 updateAdminCustomization:async(id:number,body:Record<string,unknown>)=>requestJson(`/admin/users/${id}/customization`,{method:'PATCH',headers:{'Content-Type':'application/json',...authHeaders()},body:JSON.stringify(body)}),
 addAdminBadge:async(id:number,badge:string)=>requestJson(`/admin/users/${id}/badges`,{method:'POST',headers:{'Content-Type':'application/json',...authHeaders()},body:JSON.stringify({badge})}),
 removeAdminBadge:async(id:number,badge:string)=>requestJson(`/admin/users/${id}/badges/${encodeURIComponent(badge)}`,{method:'DELETE',headers:authHeaders()}),
 uploadProfileMedia:async(username:string,formData:FormData)=>requestJson(`/api/users/${encodeURIComponent(username)}/media`,{method:'POST',headers:authHeaders(),body:formData}),
 updateProfilePreferences:async(username:string,body:Record<string,unknown>)=>requestJson(`/api/users/${encodeURIComponent(username)}/preferences`,{method:'PATCH',headers:{'Content-Type':'application/json',...authHeaders()},body:JSON.stringify(body)}),
 setUsername:async(username:string)=>requestJson('/api/users/username',{method:'POST',headers:{'Content-Type':'application/json',...authHeaders()},body:JSON.stringify({username})}),
 connectDiscord:async()=>{const data=await requestJson('/api/connections/discord/start-url',{method:'POST',headers:authHeaders()});if(typeof data.url!=='string'||!data.url.startsWith('https://discord.com/oauth2/authorize?'))throw new Error('The server returned an invalid Discord authorization link.');window.location.href=data.url;},
 getDiscordConnection:async()=>requestJson('/api/connections/discord/status',{headers:authHeaders()}),
 disconnectDiscord:async()=>requestJson('/api/connections/discord',{method:'DELETE',headers:authHeaders()}),
};