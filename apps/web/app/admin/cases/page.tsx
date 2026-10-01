'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Eye, Search, XCircle } from 'lucide-react';
import { AdminShell } from '@/components/admin-shell';
import { API } from '@/lib/api';

type AdminCase = {
  _id: string;
  fullName: string;
  summary: string;
  status: string;
  region?: string;
  detentionPlace?: string;
  createdAt: string;
};

const tabs = [
  ['pending', 'بانتظار المراجعة'],
  ['approved', 'المنشورة'],
  ['rejected', 'المرفوضة'],
] as const;

export default function AdminCases() {
  const [items, setItems] = useState<AdminCase[]>([]);
  const [tab, setTab] = useState('pending');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const url =
      API +
      '/api/admin/cases?moderationStatus=' +
      tab +
      '&q=' +
      encodeURIComponent(query);
    const response = await fetch(url, { credentials: 'include' });

    if (response.status === 401) {
      location.href = '/admin/login';
      return;
    }

    const data = await response.json();
    setItems(data.items || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // Search text is submitted explicitly; switching tabs reloads immediately.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function moderate(id: string, action: 'approve' | 'reject') {
    await fetch(API + '/api/admin/cases/' + id + '/moderation', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    load();
  }

  return (
    <AdminShell>
      <div className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="text-sm font-extrabold text-brand-600">إدارة المحتوى</div>
          <h1 className="mt-1 text-3xl font-black text-stone-950">مراجعة الحالات</h1>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            load();
          }}
          className="flex w-full flex-col gap-2 sm:flex-row xl:max-w-xl"
        >
          <label className="relative flex-1">
            <span className="sr-only">البحث في الطلبات</span>
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="input pr-11"
              placeholder="ابحث في الطلبات..."
            />
          </label>
          <button className="btn-dark">بحث</button>
        </form>
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="حالة المراجعة">
        {tabs.map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            onClick={() => setTab(value)}
            className={[
              'min-h-11 shrink-0 rounded-xl px-4 py-2 text-sm font-bold',
              tab === value
                ? 'bg-brand-600 text-white'
                : 'border border-stone-300 bg-white text-stone-700 hover:bg-stone-50',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-stone-100 text-stone-600">
              <tr>
                <th scope="col" className="p-4 text-right">الاسم</th>
                <th scope="col" className="p-4 text-right">الحالة</th>
                <th scope="col" className="p-4 text-right">المكان</th>
                <th scope="col" className="p-4 text-right">تاريخ الإرسال</th>
                <th scope="col" className="p-4 text-right">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {!loading
                ? items.map((item) => (
                    <tr className="border-t border-stone-200 hover:bg-stone-50/70" key={item._id}>
                      <td className="p-4">
                        <b className="text-stone-950">{item.fullName}</b>
                        <div className="mt-1 line-clamp-1 text-xs text-stone-500">{item.summary}</div>
                      </td>
                      <td className="p-4">{item.status}</td>
                      <td className="p-4 text-stone-600">{item.region || item.detentionPlace || '—'}</td>
                      <td className="p-4 text-stone-600">
                        {new Date(item.createdAt).toLocaleDateString('ar')}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Link
                            href={'/admin/cases/' + item._id}
                            className="icon-button h-11 w-11 rounded-xl"
                            aria-label={'عرض حالة ' + item.fullName}
                          >
                            <Eye size={17} aria-hidden="true" />
                          </Link>
                          {tab === 'pending' ? (
                            <>
                              <button
                                type="button"
                                onClick={() => moderate(item._id, 'approve')}
                                className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                aria-label={'قبول حالة ' + item.fullName}
                              >
                                <CheckCircle2 size={18} aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                onClick={() => moderate(item._id, 'reject')}
                                className="grid h-11 w-11 place-items-center rounded-xl bg-red-50 text-red-700 hover:bg-red-100"
                                aria-label={'رفض حالة ' + item.fullName}
                              >
                                <XCircle size={18} aria-hidden="true" />
                              </button>
                            </>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                : null}

              {loading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-stone-500">جارٍ التحميل...</td>
                </tr>
              ) : null}

              {!loading && !items.length ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-stone-500">
                    لا توجد حالات في هذا القسم.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
