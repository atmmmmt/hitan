'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Clock3, Files, TrendingUp, XCircle } from 'lucide-react';
import { AdminShell } from '@/components/admin-shell';
import { API } from '@/lib/api';

type Stats = {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
};

export default function Admin() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch(API + '/api/admin/stats', { credentials: 'include' })
      .then((response) => (response.ok ? response.json() : null))
      .then(setStats)
      .catch(() => {});
  }, []);

  const cards = [
    [Clock3, 'بانتظار المراجعة', stats?.pending ?? '—', 'bg-amber-50 text-amber-700'],
    [CheckCircle2, 'منشورة', stats?.approved ?? '—', 'bg-emerald-50 text-emerald-700'],
    [XCircle, 'مرفوضة', stats?.rejected ?? '—', 'bg-red-50 text-red-700'],
    [Files, 'إجمالي الحالات', stats?.total ?? '—', 'bg-stone-100 text-stone-700'],
  ] as const;

  return (
    <AdminShell>
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-sm font-extrabold text-brand-600">لوحة التحكم</div>
          <h1 className="mt-1 text-3xl font-black text-stone-950">نظرة عامة</h1>
        </div>
        <div className="text-sm text-stone-500">الحالات لا تظهر للعامة إلا بعد القبول</div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([Icon, label, value, color]) => (
          <article className="card p-5" key={label}>
            <div className="flex items-center justify-between">
              <span className={['grid h-11 w-11 place-items-center rounded-2xl', color].join(' ')}>
                <Icon size={21} aria-hidden="true" />
              </span>
              <TrendingUp size={17} className="text-stone-300" aria-hidden="true" />
            </div>
            <div className="mt-6 text-3xl font-black text-stone-950">{value}</div>
            <div className="mt-1 text-sm text-stone-500">{label}</div>
          </article>
        ))}
      </div>

      <section className="card mt-5 p-6 sm:p-8">
        <div className="text-sm font-extrabold text-brand-600">من الاستلام إلى النشر</div>
        <h2 className="mt-2 text-2xl font-black text-stone-950">سير العمل المعتمد</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            ['01', 'استلام', 'يرسل الزائر الحالة فتدخل قائمة الانتظار تلقائيًا.'],
            ['02', 'مراجعة', 'تدقق الإدارة البيانات وتصححها أو ترفضها عند الحاجة.'],
            ['03', 'نشر', 'عند القبول تصبح الحالة مرئية في البحث العام.'],
          ].map(([number, title, text]) => (
            <article className="rounded-3xl border border-stone-200 bg-stone-50 p-5" key={number}>
              <div className="text-sm font-black text-brand-600">{number}</div>
              <h3 className="mt-3 text-lg font-black text-stone-950">{title}</h3>
              <p className="mt-2 text-sm leading-7 text-stone-600">{text}</p>
            </article>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
