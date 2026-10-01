import {Router} from 'express';import slugify from 'slugify';import {z} from 'zod';import mongoose from 'mongoose';import {CaseModel} from '../models/Case.js';import {FacilityModel} from '../models/Facility.js';
const r=Router();
const submission=z.object({fullName:z.string().min(2).max(200),birthYear:z.coerce.number().int().min(1900).max(2100).optional().or(z.literal('')),region:z.string().max(200).optional(),detentionPlace:z.string().max(300).optional(),detentionDate:z.string().optional(),status:z.enum(['detained','missing','released','unknown']),summary:z.string().min(5).max(1500),details:z.string().max(10000).optional(),submitterName:z.string().max(200).optional(),submitterContact:z.string().max(300).optional()});
const publicFields='fullName slug birthYear region detentionPlace detentionDate status summary details photoUrl publishedAt createdAt';
r.get('/cases',async(req,res)=>{const page=Math.max(1,Number(req.query.page)||1),limit=Math.min(50,Math.max(1,Number(req.query.limit)||18));const filter:any={moderationStatus:'approved'};if(req.query.status)filter.status=req.query.status;if(req.query.region)filter.region={$regex:String(req.query.region),$options:'i'};if(req.query.q){const q=String(req.query.q).trim();filter.$or=['fullName','summary','details','region','detentionPlace'].map(k=>({[k]:{$regex:q,$options:'i'}}))}const [items,total]=await Promise.all([CaseModel.find(filter).select(publicFields).sort({publishedAt:-1,createdAt:-1}).skip((page-1)*limit).limit(limit).lean(),CaseModel.countDocuments(filter)]);res.json({items,total,page,pages:Math.ceil(total/limit)})});
r.get('/cases/:slug',async(req,res)=>{const item=await CaseModel.findOne({slug:req.params.slug,moderationStatus:'approved'}).select(publicFields).lean();if(!item)return res.status(404).json({error:'not_found'});res.json(item)});
r.post('/submissions',async(req,res)=>{const parsed=submission.safeParse(req.body);if(!parsed.success)return res.status(400).json({error:'invalid_data',details:parsed.error.flatten()});const d:any=parsed.data;if(d.birthYear==='')delete d.birthYear;if(!d.detentionDate)delete d.detentionDate;const base=slugify(d.fullName,{lower:true,strict:true,locale:'ar'})||'case';const item=await CaseModel.create({...d,slug:`${base}-${Date.now().toString().slice(-6)}`,moderationStatus:'pending'});res.status(201).json({ok:true,id:item._id,moderationStatus:'pending'})});

const escapeRegex=(s:string)=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');

// قائمة الأماكن: بيانات البطاقة فقط (بدون تفاصيل الغرف)
r.get('/facilities',async(_req,res)=>{
  const items=await FacilityModel.find({public:true}).select('name slug region description coverUrl images rooms.key').sort({name:1}).lean();
  res.json(items.map((f:any)=>({_id:f._id,name:f.name,slug:f.slug||String(f._id),region:f.region,description:f.description,coverUrl:f.coverUrl||f.images?.[0]?.url,imagesCount:f.images?.length||0,roomsCount:f.rooms?.length||0})));
});

// صفحة المكان: كل التفاصيل + عدد الحالات المرتبطة باسم المكان
r.get('/facilities/:slug',async(req,res)=>{
  const {slug}=req.params;
  const or:any[]=[{slug}];if(mongoose.isValidObjectId(slug))or.push({_id:slug});
  const f:any=await FacilityModel.findOne({public:true,$or:or}).select('-public -__v').lean();
  if(!f)return res.status(404).json({error:'not_found'});
  const casesCount=await CaseModel.countDocuments({moderationStatus:'approved',detentionPlace:{$regex:escapeRegex(f.name),$options:'i'}});
  res.json({...f,slug:f.slug||String(f._id),casesCount});
});
export default r;
