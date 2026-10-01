import 'dotenv/config';import express from 'express';import cors from 'cors';import cookieParser from 'cookie-parser';import helmet from 'helmet';import rateLimit from 'express-rate-limit';import {connectDb} from './lib/db.js';import publicRoutes from './routes/public.js';import authRoutes from './routes/auth.js';import adminRoutes from './routes/admin.js';import adminFacilityRoutes,{UPLOAD_DIR} from './routes/admin-facilities.js';
const app=express();const port=Number(process.env.PORT||4000);app.set('trust proxy',1);app.use(helmet({crossOriginResourcePolicy:{policy:'cross-origin'}}));
// في التطوير نقبل أي منفذ على localhost؛ في الإنتاج فقط WEB_ORIGIN
const origins=(process.env.WEB_ORIGIN||'http://localhost:3000').split(',');const devLocal=/^http:\/\/(localhost|127\.0\.0\.1):\d+$/;
app.use(cors({origin:(origin,cb)=>cb(null,!origin||origins.includes(origin)||(process.env.NODE_ENV!=='production'&&devLocal.test(origin))),credentials:true}));
app.use(express.json({limit:'2mb'}));app.use(cookieParser());app.use('/api/public/submissions',rateLimit({windowMs:15*60*1000,limit:15,standardHeaders:'draft-7',legacyHeaders:false}));app.get('/health',(_req,res)=>res.json({ok:true,name:'Haytan API'}));
app.use('/uploads',express.static(UPLOAD_DIR,{maxAge:'30d',immutable:true}));
app.use('/api/public',publicRoutes);app.use('/api/auth',authRoutes);app.use('/api/admin',adminFacilityRoutes);app.use('/api/admin',adminRoutes);app.use((_req,res)=>res.status(404).json({error:'not_found'}));
connectDb().then(()=>app.listen(port,()=>console.log(`Haytan API on http://localhost:${port}`))).catch(e=>{console.error(e);process.exit(1)});
