import { Filter, Search } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { CaseCard } from '@/components/case-card';
import { Select } from '@/components/select';
import { getCases } from '@/lib/api';
import type { CaseItem } from '@/lib/api';

export default async function Cases({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();

  if (params.q) query.set('q', params.q);
  if (params.status) query.set('status', params.status);
  if (params.region) query.set('region', params.region);
  query.set('limit', '24');

  const data = await getCases('?' + query);

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="page-shell">
        <div className="mb-8 max-w-3xl">
          <div className="section-kicker">البحث العام</div>
          <h1 className="section-title">الحالات المنشورة</h1>
          <p className="section-copy">
            تظهر هنا الحالات التي راجعها فريق الإدارة ووافق على نشرها.
          </p>
        </div>

        <form suppressHydrationWarning className="card mb-7 grid gap-4 p-5 lg:grid-cols-[1.3fr_.7fr_.7fr_auto] lg:items-end">
          <label className="block text-sm font-semibold text-stone-800">
            الاسم أو المعلومة
            <span className="relative mt-2 flex">
              <Search className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} aria-hidden="true" />
              <input
                name="q"
                defaultValue={params.q}
                className="input pr-11"
                placeholder="الاسم، مكان الاعتقال، كلمة مفتاحية"
              />
            </span>
          </label>

          <label className="block text-sm font-semibold text-stone-800">
            الحالة
            <Select
              name="status"
              defaultValue={params.status || ''}
              className="mt-2"
              options={[
                { value: '', label: 'كل الحالات' },
                { value: 'detained', label: 'معتقل' },
                { value: 'missing', label: 'مفقود' },
                { value: 'released', label: 'مفرج عنه' },
              ]}
            />
          </label>

          <label className="block text-sm font-semibold text-stone-800">
            المحافظة أو المنطقة
            <input
              name="region"
              defaultValue={params.region}
              className="input mt-2"
              placeholder="مثال: دمشق"
            />
          </label>

          <button className="btn-primary w-full lg:w-auto">
            <Filter size={18} aria-hidden="true" />
            تطبيق الفلاتر
          </button>
        </form>

        <div className="mb-5 inline-flex min-h-9 items-center rounded-full border border-stone-300 bg-white px-4 text-sm text-stone-600">
          عدد النتائج:
          <b className="mr-2 text-stone-950">{data.total}</b>
        </div>

        {data.items.length ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {data.items.map((item: CaseItem) => (
              <CaseCard key={item._id} item={item} />
            ))}
          </div>
        ) : (
          <div className="card px-6 py-16 text-center">
            <Search size={34} className="mx-auto text-stone-300" aria-hidden="true" />
            <h2 className="mt-4 text-xl font-black text-stone-900">لا توجد نتائج مطابقة</h2>
            <p className="mt-2 text-stone-500">جرّب تغيير كلمات البحث أو إزالة أحد الفلاتر.</p>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
