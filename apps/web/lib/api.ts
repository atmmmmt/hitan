const ENV_API=process.env.NEXT_PUBLIC_API_URL||'http://localhost:4000';
/** على جهاز آخر في الشبكة (موبايل) لا تعني localhost هذا الكمبيوتر، فنستبدلها باسم المضيف الحالي. */
export const API=(()=>{
  if(typeof window==='undefined')return ENV_API;
  try{const u=new URL(ENV_API);if((u.hostname==='localhost'||u.hostname==='127.0.0.1')&&!['localhost','127.0.0.1'].includes(location.hostname)){u.hostname=location.hostname;return u.origin}}catch{}
  return ENV_API;
})();
export type CaseItem={_id:string;slug:string;fullName:string;birthYear?:number;region?:string;detentionPlace?:string;detentionDate?:string;status:string;summary:string;photoUrl?:string;publishedAt?:string;createdAt:string};
export async function getCases(search=''){try{const r=await fetch(`${API}/api/public/cases${search}`,{next:{revalidate:20}});if(!r.ok) return {items:[],total:0};return r.json()}catch{return {items:[],total:0}}}
export async function getCase(slug:string){const r=await fetch(`${API}/api/public/cases/${slug}`,{cache:'no-store'});if(!r.ok) return null;return r.json()}

export type MediaKind='photo'|'reconstruction'|'plan';
export type FacilityImage={_id?:string;url:string;caption?:string;source?:string;kind:MediaKind};
export type RoomLink={to:string;yaw:number;pitch:number};
export type RoomInfo={yaw:number;pitch:number;title:string;text?:string};
export type Room={key:string;name:string;description?:string;panoramaUrl:string;kind:'photo'|'reconstruction';source?:string;links:RoomLink[];info:RoomInfo[]};
export type FacilitySummary={_id:string;name:string;slug:string;region?:string;description?:string;coverUrl?:string;imagesCount:number;roomsCount:number};
export type Facility={_id:string;name:string;slug:string;region?:string;description?:string;history?:string;coverUrl?:string;images:FacilityImage[];rooms:Room[];casesCount:number;public?:boolean};

export const mediaKindLabel:Record<MediaKind,string>={photo:'صورة حقيقية',reconstruction:'إعادة بناء',plan:'مخطط'};

export async function getFacilities():Promise<FacilitySummary[]>{try{const r=await fetch(`${API}/api/public/facilities`,{cache:'no-store'});return r.ok?r.json():[]}catch{return []}}
/** null فقط عند 404 الحقيقي؛ تعذّر الاتصال أو خطأ الخادم يرمي استثناء ليظهر error.tsx بدل صفحة «غير موجود» مضلِّلة. */
export async function getFacility(slug:string):Promise<Facility|null>{
  const r=await fetch(`${API}/api/public/facilities/${encodeURIComponent(slug)}`,{cache:'no-store'});
  if(r.status===404)return null;
  if(!r.ok)throw new Error(`facility_fetch_failed_${r.status}`);
  return r.json();
}
