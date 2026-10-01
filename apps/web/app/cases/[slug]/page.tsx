import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, CalendarDays, Info, MapPin, ShieldCheck } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { StatusBadge } from '@/components/status-badge';
import { getCase } from '@/lib/api';

export default async function Detail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getCase(slug);

  if (!item) notFound();

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="page-shell max-w-5xl">
        <Link href="/cases" className="mb-5 inline-flex min-h-11 items-center gap-2 rounded-xl px-2 font-bold text-stone-600 hover:text-brand-700">
          <ArrowRight size={18} aria-hidden="true" />
          العودة إلى الحالات
        </Link>

        <article className="card overflow-hidden">
          <header className="relative overflow-hidden bg-stone-950 p-7 text-white sm:p-10">
            <div className="absolute -left-16 -top-24 h-72 w-72 rounded-full bg-brand-600/25 blur-3xl" />
            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="grid h-28 w-28 shrink-0 place-items-center overflow-hidden rounded-3xl border border-white/10 bg-white/10 pt-1 text-4xl font-black leading-none">
                {item.photoUrl ? (
                  <img
                    src={item.photoUrl}
                    alt={'صورة ' + item.fullName}
                    width={112}
                    height={112}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  item.fullName.slice(0, 1)
                )}
              </div>
              <div>
                <StatusBadge status={item.status} />
                <h1 className="mt-4 text-3xl font-black sm:text-4xl">{item.fullName}</h1>
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/60">
                  {item.region ? (
                    <span className="flex items-center gap-1.5">
                      <MapPin size={17} aria-hidden="true" />
                      {item.region}
                    </span>
                  ) : null}
                  {item.detentionDate ? (
                    <span className="flex items-center gap-1.5">
                      <CalendarDays size={17} aria-hidden="true" />
                      {item.detentionDate.slice(0, 10)}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </header>

          <div className="grid gap-8 p-6 sm:p-10 md:grid-cols-[1fr_290px]">
            <section>
              <div className="text-sm font-extrabold text-brand-600">البيانات المتاحة للعامة</div>
              <h2 className="mt-2 text-2xl font-black text-stone-950">المعلومات المنشورة</h2>
              <p className="mt-5 whitespace-pre-line text-lg leading-9 text-stone-700">{item.summary}</p>
              {item.details ? (
                <p className="mt-5 whitespace-pre-line border-t border-stone-200 pt-5 leading-9 text-stone-700">
                  {item.details}
                </p>
              ) : null}
            </section>

            <aside className="space-y-4">
              <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
                <div className="text-xs font-bold text-stone-500">مكان الاعتقال أو آخر ظهور</div>
                <div className="mt-2 font-extrabold text-stone-950">
                  {item.detentionPlace || 'غير محدد'}
                </div>
              </div>

              <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-red-950">
                <div className="flex items-center gap-2 font-black">
                  <ShieldCheck size={19} aria-hidden="true" />
                  تمت المراجعة قبل النشر
                </div>
                <p className="mt-2 text-xs leading-6 text-red-900/75">
                  المراجعة لا تعني ضمان صحة المعلومة رسميًا؛ قد يكون مصدر المحتوى من
                  المستخدمين أو المصادر المجتمعية.
                </p>
              </div>

              <div className="rounded-3xl border border-stone-200 bg-white p-5 text-sm leading-7 text-stone-600">
                <Info size={19} className="mb-2 text-brand-600" aria-hidden="true" />
                إذا كانت لديك معلومة إضافية حول هذه الحالة، أرسلها إلى الإدارة للمراجعة بدل
                نشر بيانات حساسة مباشرة.
              </div>
            </aside>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
