import express from 'express';
import cors from 'cors';
import path from 'path';
import userRoutes from './routes/userRoutes';
import linkRoutes from "./routes/linkRoutes";
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';
import { mongoDB } from './config/database';

const app=express();
if(!process.env.JWT_SECRET)console.error('JWT_SECRET is not configured; sign-up and sign-in requests will be unavailable.');
const frontendOrigins=new Set([process.env.FRONTEND_URL,process.env.FRONTEND_URLS,'https://lost-lol.vercel.app'].filter((v):v is string=>Boolean(v)).flatMap(v=>v.split(',')).map(v=>v.trim().replace(/\/+$/,'')).filter(Boolean));
const isAllowedFrontendOrigin=(origin?:string)=>{if(!origin)return true;if(frontendOrigins.has(origin))return true;try{const hostname=new URL(origin).hostname;return hostname==='localhost'||hostname==='127.0.0.1'||hostname==='lost-lol.vercel.app'||hostname.endsWith('.vercel.app')}catch{return false}};
app.use(cors({origin:(origin,callback)=>callback(null,isAllowedFrontendOrigin(origin)),credentials:true,optionsSuccessStatus:204}));
app.use(express.json());
app.use((_req,_res,next)=>{void mongoDB().then(()=>next()).catch(next)});
app.use('/uploads',express.static(path.join(__dirname,'../uploads')));
app.use('/auth',authRoutes);
app.use('/admin',adminRoutes);
app.use('/api/users',userRoutes);
app.use('/api/links',linkRoutes);
app.use((err:Error,_req:express.Request,res:express.Response,_next:express.NextFunction)=>{console.error(err.stack);res.status(500).json({message:'Something broke!'});});
app.get('/',(_req,res)=>{res.json({status:'ok'})});
if(!process.env.VERCEL){void mongoDB().then(()=>{const port=Number(process.env.PORT)||3000;app.listen(port,()=>console.log(`Server is running on port ${port}`));}).catch((error:unknown)=>console.error('Unable to connect to MongoDB',error));}
export default app;