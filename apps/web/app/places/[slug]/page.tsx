import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, FileText, Images, MapPin, Rotate3d, ShieldAlert, Users } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { CaseCard } from '@/components/case-card';
import { Gallery } from '@/components/gallery';
import { VirtualTour } from '@/components/virtual-tour';
import { getCases, getFacility } from '@/lib/api';
import type { CaseItem } from '@/lib/api';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const f = await getFacility(slug);
  return f ? { title: f.name, description: f.description } : {};
}

export default async function PlaceDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const place = await getFacility(slug);
  if (!place) notFound();

  const related = place.casesCount ? await getCases(`?q=${encodeURIComponent(place.name)}&limit=6`) : { items: [] };
  const hasReconstruction = place.rooms.some((r) => r.kind === 'reconstruction') || place.images.some((i) => i.kind === 'reconstruction');

  const sections = [
    place.rooms.length && { id: 'tour', label: 'الجولة ٣٦٠°', icon: Rotate3d },
    place.images.length && { id: 'gallery', label: 'المعرض', icon: Images },
    place.history && { id: 'history', label: 'عن المكان', icon: FileText },
    related.items.length && { id: 'cases', label: 'الحالات', icon: Users },
  ].filter(Boolean) as { id: string; label: string; icon: typeof Rotate3d }[];

  return (
    <>
      <SiteHeader />
      <main id="main-content">
        {/* الغلاف */}
        <section className="relative isolate overflow-hidden bg-stone-950 text-white">
          {place.coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={place.coverUrl} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-40" />
          )}
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-stone-950 via-stone-950/70 to-stone-950/30" />
          <div className="container-shell py-10 sm:py-16">
            <Link href="/places" className="inline-flex min-h-10 items-center gap-2 text-sm text-white/70 hover:text-white">
              <ArrowRight size={17} aria-hidden="true" />
              كل الأماكن
            </Link>
            <h1 className="mt-4 text-[2rem] leading-[1.35] sm:text-5xl">{place.name}</h1>
            {place.region && (
              <div className="mt-3 flex items-center gap-1.5 text-white/70">
                <MapPin size={17} aria-hidden="true" />
                {place.region}
              </div>
            )}
            {place.description && <p className="mt-4 max-w-2xl leading-8 text-white/75 sm:text-lg">{place.description}</p>}

            <div className="mt-6 flex flex-wrap gap-2">
              {place.rooms.length > 0 && <span className="badge bg-brand-600 text-white">{place.rooms.length} غرف بجولة ٣٦٠°</span>}
              {place.images.length > 0 && <span className="badge bg-white/10 text-white">{place.images.length} صور</span>}
              {place.casesCount > 0 && <span className="badge bg-white/10 text-white">{place.casesCount} حالات مرتبطة</span>}
            </div>
          </div>
        </section>

        {/* تنقل الأقسام */}
        {sections.length > 1 && (
          <nav aria-label="أقسام الصفحة" className="sticky top-[61px] z-30 border-b border-stone-200 bg-[#fffdf9]/95 backdrop-blur md:top-[81px]">
            <div className="container-shell flex gap-1 overflow-x-auto py-2">
              {sections.map(({ id, label, icon: Icon }) => (
                <a key={id} href={`#${id}`} className="mobile-nav-link gap-1.5 px-3 text-sm">
                  <Icon size={16} aria-hidden="true" />
                  {label}
                </a>
              ))}
            </div>
          </nav>
        )}

        <div className="container-shell space-y-14 py-10 sm:py-14">
          {hasReconstruction && (
            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-900">
              <ShieldAlert size={20} className="mt-1 shrink-0" aria-hidden="true" />
              <p>
                بعض المحتوى في هذه الصفحة <b className="font-semibold">إعادة بناء</b> اعتماداً على شهادات ومصادر، وليس تصويراً حقيقياً.
                كل صورة ومشهد موسوم بنوعه ومصدره.
              </p>
            </div>
          )}

          {place.rooms.length > 0 && (
            <section id="tour" className="scroll-mt-40">
              <div className="section-kicker">جولة افتراضية</div>
              <h2 className="section-title">تجوّل داخل المكان</h2>
              <p className="section-copy">اسحب للنظر حولك، واضغط على الأسهم للانتقال بين الغرف، وعلى النقاط لقراءة المعلومات.</p>
              <div className="mt-6">
                <VirtualTour rooms={place.rooms} />
              </div>
            </section>
          )}

          {place.images.length > 0 && (
            <section id="gallery" className="scroll-mt-40">
              <div className="section-kicker">المعرض</div>
              <h2 className="section-title">صور ومخططات</h2>
              <div className="mt-6">
                <Gallery images={place.images} />
              </div>
            </section>
          )}

          {place.history && (
            <section id="history" className="scroll-mt-40">
              <div className="section-kicker">الخلفية</div>
              <h2 className="section-title">عن المكان</h2>
              <div className="card mt-6 max-w-3xl whitespace-pre-line p-6 text-[1.05rem] leading-9 text-stone-700 sm:p-8">{place.history}</div>
            </section>
          )}

          {related.items.length > 0 && (
            <section id="cases" className="scroll-mt-40">
              <div className="section-kicker">مرتبطة بهذا المكان</div>
              <h2 className="section-title">حالات موثقة</h2>
              <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {related.items.map((item: CaseItem) => (
                  <CaseCard key={item._id} item={item} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
