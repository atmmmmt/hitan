import { Router } from 'express';
import type { Request } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import multer from 'multer';
import { z } from 'zod';
import { FacilityModel } from '../models/Facility.js';
import { requireAdmin } from '../middleware/auth.js';

export const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
]);

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ALLOWED.get(file.mimetype)}`),
  }),
  // البانوراما قد تكون كبيرة (8K)
  limits: { fileSize: 30 * 1024 * 1024, files: 20 },
  fileFilter: (_req, file, cb) => cb(null, ALLOWED.has(file.mimetype)),
});

const url = z.string().trim().min(1).max(1000);
const slug = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9-]+$/, 'slug: أحرف إنجليزية صغيرة وأرقام وشرطات فقط')
  .max(100);

const facilitySchema = z.object({
  name: z.string().trim().min(2).max(200),
  slug: slug.optional().or(z.literal('')),
  region: z.string().trim().max(200).optional(),
  description: z.string().trim().max(2000).optional(),
  history: z.string().trim().max(20000).optional(),
  coverUrl: z.string().trim().max(1000).optional(),
  public: z.boolean().optional(),
  images: z
    .array(
      z.object({
        url,
        caption: z.string().trim().max(300).optional(),
        source: z.string().trim().max(300).optional(),
        kind: z.enum(['photo', 'reconstruction', 'plan']).default('photo'),
      }),
    )
    .max(200)
    .default([]),
  rooms: z
    .array(
      z.object({
        key: z.string().trim().min(1).max(60),
        name: z.string().trim().min(1).max(200),
        description: z.string().trim().max(2000).optional(),
        panoramaUrl: url,
        kind: z.enum(['photo', 'reconstruction']).default('reconstruction'),
        source: z.string().trim().max(300).optional(),
        links: z.array(z.object({ to: z.string().min(1), yaw: z.number(), pitch: z.number() })).max(20).default([]),
        info: z
          .array(z.object({ yaw: z.number(), pitch: z.number(), title: z.string().trim().max(200), text: z.string().trim().max(2000).optional() }))
          .max(30)
          .default([]),
      }),
    )
    .max(60)
    .default([]),
});

function clean(data: z.infer<typeof facilitySchema>) {
  const keys = new Set(data.rooms.map((room) => room.key));
  return {
    ...data,
    slug: data.slug || undefined,
    // أزل الروابط إلى غرف محذوفة
    rooms: data.rooms.map((room) => ({ ...room, links: room.links.filter((l) => keys.has(l.to) && l.to !== room.key) })),
  };
}

const r = Router();
r.use(requireAdmin);

r.post('/uploads', upload.array('files', 20), (req: Request, res) => {
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  if (!files.length) return res.status(400).json({ error: 'no_valid_files' });
  const base = process.env.PUBLIC_API_URL || `${req.protocol}://${req.get('host')}`;
  res.status(201).json({ urls: files.map((f) => `${base}/uploads/${f.filename}`) });
});

r.get('/facilities', async (_req, res) => {
  const items = await FacilityModel.find().select('name slug region public coverUrl images rooms.key updatedAt').sort({ name: 1 }).lean();
  res.json({
    items: items.map((f: any) => ({
      _id: f._id,
      name: f.name,
      slug: f.slug,
      region: f.region,
      public: f.public,
      coverUrl: f.coverUrl || f.images?.[0]?.url,
      imagesCount: f.images?.length || 0,
      roomsCount: f.rooms?.length || 0,
      updatedAt: f.updatedAt,
    })),
  });
});

r.get('/facilities/:id', async (req, res) => {
  const f = await FacilityModel.findById(req.params.id).lean();
  if (!f) return res.status(404).json({ error: 'not_found' });
  res.json(f);
});

r.post('/facilities', async (req, res) => {
  const p = facilitySchema.safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: 'invalid_data', details: p.error.flatten() });
  try {
    const f = await FacilityModel.create(clean(p.data));
    res.status(201).json(f);
  } catch (e: any) {
    if (e?.code === 11000) return res.status(409).json({ error: 'duplicate', message: 'الاسم أو الرابط مستخدم مسبقاً' });
    throw e;
  }
});

r.put('/facilities/:id', async (req, res) => {
  const p = facilitySchema.safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: 'invalid_data', details: p.error.flatten() });
  try {
    const data = clean(p.data);
    const update: any = { $set: data };
    if (!data.slug) {
      delete update.$set.slug;
      update.$unset = { slug: 1 };
    }
    const f = await FacilityModel.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!f) return res.status(404).json({ error: 'not_found' });
    res.json(f);
  } catch (e: any) {
    if (e?.code === 11000) return res.status(409).json({ error: 'duplicate', message: 'الاسم أو الرابط مستخدم مسبقاً' });
    throw e;
  }
});

r.delete('/facilities/:id', async (req, res) => {
  const f = await FacilityModel.findByIdAndDelete(req.params.id);
  if (!f) return res.status(404).json({ error: 'not_found' });
  res.json({ ok: true });
});

export default r;
