import Link from 'next/link';
import {
  ArrowLeft,
  FileSearch,
  MapPinned,
  Plus,
  Search,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { CaseCard } from '@/components/case-card';
import { Logo } from '@/components/logo';
import { getCases } from '@/lib/api';
import type { CaseItem } from '@/lib/api';

const features = [
  [FileSearch, 'بحث موحّد', 'بالاسم والمكان والحالة'],
  [ShieldCheck, 'مراجعة مسؤولة', 'لا نشر مباشر دون تدقيق'],
  [Users, 'مشاركة مجتمعية', 'كل معلومة قد تصنع فرقًا'],
  [MapPinned, 'دليل للأماكن', 'ربط الحالات بالمواقع'],
] as const;

export default async function Home() {
  const data = await getCases('?limit=6');

  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <section className="hero-grid border-b border-stone-200">
          <div className="container-shell grid items-center gap-10 py-12 lg:grid-cols-[1.08fr_.92fr] lg:gap-14 lg:py-20">
            <div>
              <div className="inline-flex min-h-9 items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-4 py-2 text-xs font-extrabold text-brand-700 sm:text-sm">
                <ShieldCheck size={17} aria-hidden="true" />
                منصة مجتمعية — المعلومات تُراجع قبل النشر
              </div>

              <h1 className="mt-6 max-w-3xl text-[2rem] font-bold leading-[1.45] text-stone-950 sm:text-[2.6rem] lg:text-[3.4rem]">
                بعض الأسماء لا تغيب
                <span className="block text-brand-600">بل تنتظر من يذكرها.</span>
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-stone-600 sm:text-lg sm:leading-9">
                ابحث عن معتقل أو مفقود، أو شارك معلومة قد تساعد عائلة. تمر كل حالة جديدة
                على فريق المراجعة قبل ظهورها للعامة.
              </p>

              <form action="/cases" suppressHydrationWarning className="card mt-8 flex max-w-2xl flex-col gap-2 p-2 sm:flex-row">
                <label className="flex min-h-12 flex-1 items-center gap-3 px-3">
                  <Search size={20} className="shrink-0 text-stone-400" aria-hidden="true" />
                  <span className="sr-only">ابحث في الحالات</span>
                  <input
                    name="q"
                    placeholder="الاسم، المكان، أو أي معلومة..."
                    className="w-full bg-transparent py-3 text-base outline-none placeholder:text-stone-400"
                  />
                </label>
                <button className="btn-primary px-8">بحث</button>
              </form>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <Link href="/submit" className="btn-dark">
                  <Plus size={18} aria-hidden="true" />
                  أضف حالة جديدة
                </Link>
                <Link href="/places" className="btn-ghost">
                  <MapPinned size={18} aria-hidden="true" />
                  تصفح أماكن الاحتجاز
                </Link>
              </div>

              <div className="mt-8 grid max-w-2xl grid-cols-3 divide-x divide-x-reverse divide-stone-300 border-y border-stone-300 py-4 text-center">
                <div>
                  <div className="text-sm font-black text-stone-950">خصوصية</div>
                  <div className="mt-1 text-xs text-stone-500">لبيانات المبلّغ</div>
                </div>
                <div>
                  <div className="text-sm font-black text-stone-950">مراجعة</div>
                  <div className="mt-1 text-xs text-stone-500">قبل كل نشر</div>
                </div>
                <div>
                  <div className="text-sm font-black text-stone-950">وصول</div>
                  <div className="mt-1 text-xs text-stone-500">من كل جهاز</div>
                </div>
              </div>
            </div>

            <aside className="relative overflow-hidden rounded-[2.25rem] bg-stone-950 p-5 text-white shadow-soft sm:p-8" aria-label="مزايا المنصة">
              <div className="absolute -left-20 -top-24 h-72 w-72 rounded-full bg-brand-600/30 blur-3xl" />
              <div className="relative">
                <div className="flex flex-col items-center rounded-[1.75rem] border border-white/10 bg-[#fffdf9] px-5 py-6 text-stone-950 shadow-2xl shadow-black/20">
                  <Logo size="hero" priority className="shadow-none" />
                  <div className="mt-3 text-sm font-extrabold text-stone-500">
                    ذاكرة تحفظ الأسماء وتقرّب المعلومة
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  {features.map(([Icon, title, description]) => (
                    <div
                      key={title}
                      className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-center transition hover:bg-white/[0.1]"
                    >
                      <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-600/15">
                        <Icon size={21} className="text-brand-500" aria-hidden="true" />
                      </span>
                      <div className="mt-3 font-extrabold">{title}</div>
                      <div className="mt-1 text-xs leading-6 text-white/50">{description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="container-shell py-14 sm:py-16 lg:py-20">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="section-kicker">آخر ما تم نشره</div>
              <h2 className="section-title">أحدث الحالات المقبولة</h2>
              <p className="mt-2 leading-8 text-stone-600">حالات راجعها فريق الإدارة وأصبحت متاحة للبحث العام.</p>
            </div>
            <Link href="/cases" className="btn-ghost self-start sm:self-auto">
              عرض جميع الحالات
              <ArrowLeft size={17} aria-hidden="true" />
            </Link>
          </div>

          {data.items.length ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {data.items.map((item: CaseItem) => (
                <CaseCard key={item._id} item={item} />
              ))}
            </div>
          ) : (
            <div className="card p-10 text-center text-stone-600">
              لا توجد حالات منشورة بعد. ستظهر الحالة هنا بعد مراجعتها وقبولها.
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
