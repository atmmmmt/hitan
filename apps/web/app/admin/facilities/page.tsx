'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, Eye, EyeOff, Plus, Rotate3d, Images } from 'lucide-react';
import { AdminShell } from '@/components/admin-shell';
import { API } from '@/lib/api';

type Row = {
  _id: string;
  name: string;
  slug?: string;
  region?: string;
  public: boolean;
  coverUrl?: string;
  imagesCount: number;
  roomsCount: number;
};

export default function AdminFacilities() {
  const [items, setItems] = useState<Row[] | null>(null);

  useEffect(() => {
    fetch(`${API}/api/admin/facilities`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d) => setItems(d.items));
  }, []);

  return (
    <AdminShell>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="section-kicker">إدارة المحتوى</div>
          <h1 className="section-title">السجون والأماكن</h1>
          <p className="mt-2 text-stone-600">أضف الصور والمعارض وغرف الجولة الافتراضية لكل مكان.</p>
        </div>
        <Link href="/admin/facilities/new" className="btn-primary self-start">
          <Plus size={18} aria-hidden="true" />
          مكان جديد
        </Link>
      </div>

      {!items ? (
        <div className="card p-10 text-center text-stone-500">جارٍ التحميل…</div>
      ) : items.length === 0 ? (
        <div className="card p-10 text-center text-stone-500">لا توجد أماكن بعد.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((f) => (
            <Link key={f._id} href={`/admin/facilities/${f._id}`} className="card flex gap-4 p-3 hover:border-brand-100 hover:shadow-soft">
              <div className="grid h-24 w-28 shrink-0 place-items-center overflow-hidden rounded-2xl bg-stone-900 text-white/30">
                {f.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={f.coverUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Building2 size={30} />
                )}
              </div>
              <div className="min-w-0 flex-1 py-1">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="truncate text-base">{f.name}</h2>
                  {f.public ? (
                    <Eye size={16} className="shrink-0 text-emerald-600" aria-label="منشور" />
                  ) : (
                    <EyeOff size={16} className="shrink-0 text-stone-400" aria-label="مخفي" />
                  )}
                </div>
                <div className="text-sm text-stone-500">{f.region || '—'}</div>
                <div className="mt-3 flex gap-3 text-xs text-stone-500">
                  <span className="flex items-center gap-1"><Rotate3d size={14} /> {f.roomsCount} غرف</span>
                  <span className="flex items-center gap-1"><Images size={14} /> {f.imagesCount} صور</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
