import Link from 'next/link';
import { ArrowLeft, Building2, Images, MapPinned, Rotate3d } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { getFacilities } from '@/lib/api';

export const metadata = { title: 'السجون وأماكن الاحتجاز' };
// القائمة تتغير من لوحة الإدارة؛ لا نريد نسخة مخزّنة قديمة
export const dynamic = 'force-dynamic';

export default async function Places() {
  const places = await getFacilities();

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="page-shell">
        <div className="mb-9 flex max-w-4xl items-start gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600">
            <MapPinned size={26} aria-hidden="true" />
          </span>
          <div>
            <div className="section-kicker">الدليل المكاني</div>
            <h1 className="section-title">السجون وأماكن الاحتجاز</h1>
            <p className="section-copy">
              صور ومعارض وجولات افتراضية بزاوية ٣٦٠° داخل أماكن الاحتجاز، مرتبطة بالحالات الموثقة.
            </p>
          </div>
        </div>

        {places.length ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {places.map((place) => (
              <Link
                key={place._id}
                href={`/places/${place.slug || place._id}`}
                className="card group flex flex-col overflow-hidden hover:-translate-y-1 hover:border-brand-100 hover:shadow-soft"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-stone-900">
                  {place.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={place.coverUrl}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-white/25">
                      <Building2 size={48} aria-hidden="true" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 right-3 flex gap-2">
                    {place.roomsCount > 0 && (
                      <span className="badge bg-brand-600 text-white">
                        <Rotate3d size={14} aria-hidden="true" />
                        جولة ٣٦٠°
                      </span>
                    )}
                    {place.imagesCount > 0 && (
                      <span className="badge bg-black/55 text-white backdrop-blur">
                        <Images size={14} aria-hidden="true" />
                        {place.imagesCount} صور
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="text-xl text-stone-950">{place.name}</h2>
                  <div className="mt-1 text-sm font-semibold text-brand-600">{place.region || 'غير محدد'}</div>
                  <p className="mt-3 line-clamp-2 flex-1 text-sm leading-7 text-stone-600">
                    {place.description || 'لا يوجد وصف عام بعد.'}
                  </p>
                  <span className="mt-4 flex items-center gap-1.5 border-t border-stone-200 pt-4 text-sm font-semibold text-brand-600">
                    استكشف المكان
                    <ArrowLeft size={15} className="transition group-hover:-translate-x-1" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card px-6 py-16 text-center">
            <Building2 size={36} className="mx-auto text-stone-300" aria-hidden="true" />
            <h2 className="mt-4 text-xl">الدليل قيد الإعداد</h2>
            <p className="mt-2 text-stone-500">ستظهر الأماكن هنا بعد إضافتها إلى قاعدة البيانات.</p>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
