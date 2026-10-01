'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowDown, ArrowRight, ArrowUp, ExternalLink, ImagePlus, Info, Loader2, MoveUp, Plus, Rotate3d, Save, Trash2, Upload,
} from 'lucide-react';
import { AdminShell } from '@/components/admin-shell';
import { PanoPicker } from '@/components/pano-picker';
import { Select } from '@/components/select';
import { API } from '@/lib/api';
import type { FacilityImage, Room } from '@/lib/api';

type Form = {
  name: string;
  slug: string;
  region: string;
  description: string;
  history: string;
  coverUrl: string;
  public: boolean;
  images: FacilityImage[];
  rooms: Room[];
};

const empty: Form = { name: '', slug: '', region: '', description: '', history: '', coverUrl: '', public: true, images: [], rooms: [] };

async function uploadFiles(files: FileList | File[]): Promise<string[]> {
  const body = new FormData();
  Array.from(files).forEach((f) => body.append('files', f));
  const r = await fetch(`${API}/api/admin/uploads`, { method: 'POST', credentials: 'include', body });
  if (!r.ok) throw new Error('upload_failed');
  return (await r.json()).urls;
}

function move<T>(list: T[], i: number, d: number) {
  const j = i + d;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

function Section({ title, hint, children, action }: { title: string; hint?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="card p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg">{title}</h2>
          {hint && <p className="mt-1 text-sm text-stone-500">{hint}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function UploadButton({ label, multiple, onDone, className = 'btn-ghost' }: { label: string; multiple?: boolean; onDone: (urls: string[]) => void; className?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  return (
    <>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple={multiple}
        hidden
        onChange={async (e) => {
          if (!e.target.files?.length) return;
          setBusy(true);
          try {
            onDone(await uploadFiles(e.target.files));
          } catch {
            alert('تعذّر رفع الملف. الأنواع المسموحة: JPG / PNG / WEBP حتى 30MB.');
          } finally {
            setBusy(false);
            e.target.value = '';
          }
        }}
      />
      <button type="button" disabled={busy} onClick={() => input.current?.click()} className={`${className} min-h-11`}>
        {busy ? <Loader2 size={17} className="animate-spin" /> : <Upload size={17} />}
        {busy ? 'جارٍ الرفع…' : label}
      </button>
    </>
  );
}

const kindOptions = [
  { value: 'photo', label: 'صورة حقيقية' },
  { value: 'reconstruction', label: 'إعادة بناء' },
  { value: 'plan', label: 'مخطط' },
];

export default function FacilityEditor() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const isNew = id === 'new';
  const [form, setForm] = useState<Form | null>(isNew ? empty : null);
  const [openRoom, setOpenRoom] = useState<string | null>(null);
  const [pickMode, setPickMode] = useState<'link' | 'info'>('link');
  const [linkTarget, setLinkTarget] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (isNew) return;
    fetch(`${API}/api/admin/facilities/${id}`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((f) => f && setForm({ ...empty, ...f, slug: f.slug || '', images: f.images || [], rooms: f.rooms || [] }));
  }, [id, isNew]);

  if (!form) return <AdminShell><div className="card p-10 text-center text-stone-500">جارٍ التحميل…</div></AdminShell>;

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => (f ? { ...f, [k]: v } : f));
  const setImage = (i: number, patch: Partial<FacilityImage>) => set('images', form.images.map((img, j) => (j === i ? { ...img, ...patch } : img)));
  const setRoom = (key: string, patch: Partial<Room>) => set('rooms', form.rooms.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  async function save() {
    setSaving(true);
    setMessage(null);
    const res = await fetch(`${API}/api/admin/facilities${isNew ? '' : '/' + id}`, {
      method: isNew ? 'POST' : 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const fields = data?.details?.fieldErrors ? Object.keys(data.details.fieldErrors).join('، ') : '';
      setMessage({ ok: false, text: data.message || `تحقق من الحقول${fields ? ': ' + fields : ''}` });
      return;
    }
    setMessage({ ok: true, text: 'تم الحفظ' });
    if (isNew) router.replace(`/admin/facilities/${data._id}`);
  }

  async function remove() {
    if (!confirm(`حذف «${form!.name}» نهائياً؟`)) return;
    await fetch(`${API}/api/admin/facilities/${id}`, { method: 'DELETE', credentials: 'include' });
    router.push('/admin/facilities');
  }

  const active = form.rooms.find((r) => r.key === openRoom) ?? null;

  return (
    <AdminShell>
      <div className="mx-auto max-w-5xl space-y-5 pb-28">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/admin/facilities" className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-brand-700">
            <ArrowRight size={17} /> كل الأماكن
          </Link>
          {!isNew && form.slug && (
            <a href={`/places/${form.slug}`} target="_blank" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600">
              عرض الصفحة العامة <ExternalLink size={15} />
            </a>
          )}
        </div>
        <h1 className="section-title !mt-0">{isNew ? 'مكان جديد' : form.name}</h1>

        {/* المعلومات الأساسية */}
        <Section title="المعلومات الأساسية">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold text-stone-800">
              الاسم *
              <input className="input mt-2" value={form.name} onChange={(e) => set('name', e.target.value)} />
            </label>
            <label className="text-sm font-semibold text-stone-800">
              رابط الصفحة (إنجليزي)
              <div className="mt-2 flex items-center overflow-hidden rounded-2xl border border-stone-300 bg-white focus-within:border-brand-600 focus-within:ring-4 focus-within:ring-brand-100" dir="ltr">
                <span className="px-3 text-sm text-stone-400">/places/</span>
                <input
                  className="min-h-12 w-full bg-transparent pe-3 outline-none"
                  value={form.slug}
                  placeholder="saydnaya"
                  onChange={(e) => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                />
              </div>
            </label>
            <label className="text-sm font-semibold text-stone-800">
              المحافظة / المنطقة
              <input className="input mt-2" value={form.region} onChange={(e) => set('region', e.target.value)} />
            </label>
            <label className="flex items-center gap-3 self-end rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-semibold">
              <input type="checkbox" className="h-5 w-5 accent-[#b5121b]" checked={form.public} onChange={(e) => set('public', e.target.checked)} />
              منشور للعامة
            </label>
            <label className="text-sm font-semibold text-stone-800 md:col-span-2">
              وصف مختصر
              <textarea className="input mt-2" rows={2} value={form.description} onChange={(e) => set('description', e.target.value)} />
            </label>
            <label className="text-sm font-semibold text-stone-800 md:col-span-2">
              الخلفية والتاريخ (مع ذكر المصادر)
              <textarea className="input mt-2" rows={6} value={form.history} onChange={(e) => set('history', e.target.value)} />
            </label>
          </div>
        </Section>

        {/* الغلاف */}
        <Section title="صورة الغلاف" hint="تظهر في بطاقة المكان وأعلى صفحته. إن تُركت فارغة تُستخدم أول صورة في المعرض.">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="grid aspect-[16/10] w-full shrink-0 place-items-center overflow-hidden rounded-2xl bg-stone-900 text-white/30 sm:w-64">
              {form.coverUrl || form.images[0]?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.coverUrl || form.images[0]?.url} alt="" className="h-full w-full object-cover" />
              ) : (
                <ImagePlus size={32} />
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <UploadButton label="رفع غلاف" onDone={([u]) => set('coverUrl', u)} />
              {form.coverUrl && (
                <button type="button" className="btn-ghost min-h-11" onClick={() => set('coverUrl', '')}>
                  إزالة
                </button>
              )}
            </div>
          </div>
        </Section>

        {/* المعرض */}
        <Section
          title={`المعرض (${form.images.length})`}
          hint="لكل صورة: وصف، مصدر، ونوعها — حقيقية أو إعادة بناء أو مخطط."
          action={<UploadButton label="رفع صور" multiple onDone={(urls) => set('images', [...form.images, ...urls.map((url) => ({ url, kind: 'photo' as const }))])} />}
        >
          {form.images.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500">لا توجد صور بعد.</p>
          ) : (
            <ul className="space-y-3">
              {form.images.map((img, i) => (
                <li key={img.url + i} className="flex flex-col gap-3 rounded-2xl border border-stone-200 p-3 sm:flex-row">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" className="aspect-[4/3] w-full shrink-0 rounded-xl object-cover sm:w-36" />
                  <div className="grid flex-1 gap-2 sm:grid-cols-2">
                    <input className="input sm:col-span-2" placeholder="وصف الصورة" value={img.caption || ''} onChange={(e) => setImage(i, { caption: e.target.value })} />
                    <input className="input" placeholder="المصدر" value={img.source || ''} onChange={(e) => setImage(i, { source: e.target.value })} />
                    <Select name={`kind-${i}`} defaultValue={img.kind} options={kindOptions} onChange={(k) => setImage(i, { kind: k as FacilityImage['kind'] })} />
                  </div>
                  <div className="flex gap-1 sm:flex-col">
                    <button type="button" className="icon-button h-10 w-10" onClick={() => set('images', move(form.images, i, -1))} aria-label="لأعلى"><ArrowUp size={16} /></button>
                    <button type="button" className="icon-button h-10 w-10" onClick={() => set('images', move(form.images, i, 1))} aria-label="لأسفل"><ArrowDown size={16} /></button>
                    <button type="button" className="icon-button h-10 w-10 hover:!text-red-700" onClick={() => set('images', form.images.filter((_, j) => j !== i))} aria-label="حذف"><Trash2 size={16} /></button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* الغرف */}
        <Section
          title={`غرف الجولة ٣٦٠° (${form.rooms.length})`}
          hint="ارفع صورة بانوراما كروية (equirectangular بنسبة ٢:١) لكل غرفة، ثم انقر داخل المعاينة لوضع أسهم الانتقال ونقاط المعلومات."
          action={
            <UploadButton
              label="غرفة جديدة"
              className="btn-dark"
              onDone={([url]) => {
                const key = `room-${Date.now().toString(36)}`;
                set('rooms', [...form.rooms, { key, name: `غرفة ${form.rooms.length + 1}`, panoramaUrl: url, kind: 'photo', links: [], info: [] }]);
                setOpenRoom(key);
              }}
            />
          }
        >
          {form.rooms.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500">
              <Rotate3d className="mx-auto mb-2 text-stone-300" size={30} />
              لا توجد غرف بعد.
            </p>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {form.rooms.map((r, i) => (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setOpenRoom(r.key === openRoom ? null : r.key)}
                    className={`relative h-20 w-36 shrink-0 overflow-hidden rounded-xl border-2 ${r.key === openRoom ? 'border-brand-600' : 'border-transparent'}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={r.panoramaUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
                    <span className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <span className="absolute bottom-1.5 right-2 text-xs font-semibold text-white">{i === 0 ? '★ ' : ''}{r.name}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-stone-500">★ الغرفة الأولى هي نقطة بداية الجولة.</p>

              {active && (
                <div className="space-y-4 rounded-2xl border border-stone-200 bg-stone-50 p-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="text-sm font-semibold">
                      اسم الغرفة
                      <input className="input mt-2" value={active.name} onChange={(e) => setRoom(active.key, { name: e.target.value })} />
                    </label>
                    <label className="text-sm font-semibold">
                      المصدر
                      <input className="input mt-2" value={active.source || ''} onChange={(e) => setRoom(active.key, { source: e.target.value })} />
                    </label>
                    <label className="text-sm font-semibold md:col-span-2">
                      وصف
                      <textarea className="input mt-2" rows={2} value={active.description || ''} onChange={(e) => setRoom(active.key, { description: e.target.value })} />
                    </label>
                    <div className="flex flex-wrap items-center gap-2 md:col-span-2">
                      {(['photo', 'reconstruction'] as const).map((k) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => setRoom(active.key, { kind: k })}
                          className={`badge min-h-9 border px-4 ${active.kind === k ? 'border-brand-600 bg-brand-600 text-white' : 'border-stone-300 bg-white text-stone-700'}`}
                        >
                          {k === 'photo' ? 'تصوير حقيقي' : 'إعادة بناء'}
                        </button>
                      ))}
                      <span className="mx-1 h-6 w-px bg-stone-300" />
                      <UploadButton label="استبدال البانوراما" onDone={([u]) => setRoom(active.key, { panoramaUrl: u })} />
                      <button type="button" className="btn-ghost min-h-11" onClick={() => set('rooms', move(form.rooms, form.rooms.indexOf(active), -1))}>
                        <MoveUp size={16} /> تقديم
                      </button>
                      <button
                        type="button"
                        className="btn-ghost min-h-11 hover:!text-red-700"
                        onClick={() => {
                          if (!confirm('حذف هذه الغرفة؟')) return;
                          set('rooms', form.rooms.filter((r) => r.key !== active.key).map((r) => ({ ...r, links: r.links.filter((l) => l.to !== active.key) })));
                          setOpenRoom(null);
                        }}
                      >
                        <Trash2 size={16} /> حذف الغرفة
                      </button>
                    </div>
                  </div>

                  {/* أداة وضع العلامات */}
                  <div className="rounded-2xl border border-stone-200 bg-white p-3">
                    <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-semibold">عند النقر على المعاينة أضف:</span>
                      <button type="button" onClick={() => setPickMode('link')} className={`badge min-h-9 border px-3 ${pickMode === 'link' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-stone-300'}`}>
                        <MoveUp size={14} /> سهم انتقال
                      </button>
                      <button type="button" onClick={() => setPickMode('info')} className={`badge min-h-9 border px-3 ${pickMode === 'info' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-stone-300'}`}>
                        <Info size={14} /> نقطة معلومة
                      </button>
                      {pickMode === 'link' && (
                        <select
                          className="input !min-h-9 w-auto !py-1 text-sm"
                          value={linkTarget}
                          onChange={(e) => setLinkTarget(e.target.value)}
                        >
                          <option value="">— اختر الغرفة الهدف —</option>
                          {form.rooms.filter((r) => r.key !== active.key).map((r) => (
                            <option key={r.key} value={r.key}>{r.name}</option>
                          ))}
                        </select>
                      )}
                    </div>
                    <PanoPicker
                      room={active}
                      onPick={({ yaw, pitch }) => {
                        if (pickMode === 'link') {
                          if (!linkTarget) return alert('اختر الغرفة الهدف أولاً.');
                          setRoom(active.key, { links: [...active.links.filter((l) => l.to !== linkTarget), { to: linkTarget, yaw, pitch }] });
                        } else {
                          const title = prompt('عنوان المعلومة:');
                          if (!title) return;
                          const text = prompt('النص (اختياري):') || undefined;
                          setRoom(active.key, { info: [...active.info, { yaw, pitch, title, text }] });
                        }
                      }}
                    />
                  </div>

                  {(active.links.length > 0 || active.info.length > 0) && (
                    <ul className="space-y-2 text-sm">
                      {active.links.map((l) => (
                        <li key={'l' + l.to} className="flex items-center justify-between rounded-xl bg-white px-3 py-2">
                          <span className="flex items-center gap-2"><MoveUp size={15} className="text-brand-600" /> سهم إلى «{form.rooms.find((r) => r.key === l.to)?.name}»</span>
                          <button type="button" className="text-stone-400 hover:text-red-700" onClick={() => setRoom(active.key, { links: active.links.filter((x) => x !== l) })}><Trash2 size={15} /></button>
                        </li>
                      ))}
                      {active.info.map((p, i) => (
                        <li key={'i' + i} className="flex items-center justify-between rounded-xl bg-white px-3 py-2">
                          <span className="flex items-center gap-2"><Info size={15} className="text-brand-600" /> {p.title}</span>
                          <button type="button" className="text-stone-400 hover:text-red-700" onClick={() => setRoom(active.key, { info: active.info.filter((_, j) => j !== i) })}><Trash2 size={15} /></button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}
        </Section>

        {!isNew && (
          <button type="button" onClick={remove} className="text-sm text-stone-500 hover:text-red-700">
            حذف هذا المكان نهائياً
          </button>
        )}
      </div>

      {/* شريط الحفظ */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-[#fffdf9]/95 backdrop-blur lg:right-[300px]">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 p-3 sm:px-6">
          <span className={`text-sm ${message ? (message.ok ? 'text-emerald-700' : 'text-red-700') : 'text-stone-500'}`}>
            {message?.text ?? 'التغييرات لا تُحفظ تلقائياً'}
          </span>
          <button type="button" onClick={save} disabled={saving || form.name.trim().length < 2} className="btn-primary">
            {saving ? <Loader2 size={18} className="animate-spin" /> : isNew ? <Plus size={18} /> : <Save size={18} />}
            {isNew ? 'إنشاء' : 'حفظ'}
          </button>
        </div>
      </div>
    </AdminShell>
  );
}
