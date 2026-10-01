import mongoose, { Schema } from 'mongoose';

/** صورة في معرض المكان. kind يوضح إن كانت صورة حقيقية أو إعادة بناء. */
const ImageSchema = new Schema(
  {
    url: { type: String, required: true },
    caption: { type: String, trim: true, maxlength: 300 },
    source: { type: String, trim: true, maxlength: 300 },
    kind: { type: String, enum: ['photo', 'reconstruction', 'plan'], default: 'photo' },
  },
  { _id: true },
);

/** رابط انتقال داخل الجولة: سهم في اتجاه yaw (بالدرجات) ينقل إلى غرفة أخرى. */
const LinkSchema = new Schema({ to: { type: String, required: true }, yaw: { type: Number, default: 0 }, pitch: { type: Number, default: -10 } }, { _id: false });

/** نقطة معلومة داخل البانوراما. */
const InfoSchema = new Schema({ yaw: Number, pitch: Number, title: String, text: String }, { _id: false });

const RoomSchema = new Schema(
  {
    key: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, maxlength: 2000 },
    panoramaUrl: { type: String, required: true },
    kind: { type: String, enum: ['photo', 'reconstruction'], default: 'reconstruction' },
    source: { type: String, trim: true, maxlength: 300 },
    links: { type: [LinkSchema], default: [] },
    info: { type: [InfoSchema], default: [] },
  },
  { _id: false },
);

const FacilitySchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true, sparse: true, index: true },
    region: String,
    description: String,
    history: { type: String, maxlength: 20000 },
    coverUrl: String,
    images: { type: [ImageSchema], default: [] },
    rooms: { type: [RoomSchema], default: [] },
    public: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const FacilityModel = mongoose.models.Facility || mongoose.model('Facility', FacilitySchema);
