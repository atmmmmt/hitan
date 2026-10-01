import type {Request,Response,NextFunction} from 'express';import jwt from 'jsonwebtoken';
export type AuthedRequest=Request&{admin?:{id:string;role:string}};
export function requireAdmin(req:AuthedRequest,res:Response,next:NextFunction){const token=req.cookies?.haytan_admin;if(!token)return res.status(401).json({error:'unauthorized'});try{req.admin=jwt.verify(token,process.env.JWT_SECRET!) as any;next()}catch{return res.status(401).json({error:'unauthorized'})}}
