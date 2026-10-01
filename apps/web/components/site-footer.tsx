import Link from 'next/link';
import { ArrowLeft, LockKeyhole, Plus } from 'lucide-react';
import { Logo } from './logo';

const links = [
  ['/cases', 'تصفح الحالات'],
  ['/places', 'أماكن الاحتجاز'],
  ['/about', 'عن المنصة'],
  ['/submit', 'إضافة حالة'],
] as const;

export function SiteFooter() {
  return (
    <footer className="relative mt-24 hidden overflow-hidden bg-stone-950 text-white md:block">
      <div className="h-1 bg-gradient-to-l from-brand-700 via-brand-500 to-brand-700" aria-hidden="true" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-brand-600/15 blur-3xl" aria-hidden="true" />

      <div className="container-shell relative grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr] md:gap-12 md:py-16">
        {/* الهوية */}
        <div>
          <Link href="/" className="inline-flex items-center gap-3" aria-label="حيطان المعتقل — الرئيسية">
            <Logo size="admin" className="!h-14 !w-14 !rounded-2xl !p-1 shadow-none" />
            <span>
              <span className="block font-display text-lg font-bold leading-snug">حيطان المعتقل</span>
              <span className="block text-xs text-white/50">منصة توثيق مجتمعية</span>
            </span>
          </Link>
          <p className="mt-5 max-w-md text-sm leading-7 text-white/60">
            منصة مستقلة للتوثيق والمساعدة في الوصول إلى معلومات حول المعتقلين والمفقودين.
            كل معلومة منشورة تمر بمراجعة تحريرية قبل إتاحتها للعامة.
          </p>
          <Link href="/submit" className="btn-primary mt-6 min-h-11 px-5 text-sm">
            <Plus size={17} aria-hidden="true" />
            أضف معلومة عن حالة
          </Link>
        </div>

        {/* روابط */}
        <nav aria-label="روابط التذييل">
          <h2 className="font-display text-sm font-semibold text-white/90">روابط سريعة</h2>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 md:grid-cols-1">
            {links.map(([href, label]) => (
              <li key={href}>
                <Link
                  href={href}
                  className="group inline-flex min-h-10 items-center gap-2 text-sm text-white/60 hover:text-white"
                >
                  <ArrowLeft
                    size={14}
                    className="text-brand-500 opacity-0 transition group-hover:-translate-x-0.5 group-hover:opacity-100"
                    aria-hidden="true"
                  />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* الخصوصية */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <h2 className="flex items-center gap-2 font-display text-sm font-semibold text-white/90">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600/20 text-brand-500">
              <LockKeyhole size={16} aria-hidden="true" />
            </span>
            الخصوصية أولًا
          </h2>
          <p className="mt-3 text-sm leading-7 text-white/55">
            بيانات تواصل المبلّغ تبقى خاصة بفريق المراجعة ولا تظهر ضمن صفحات الحالات العامة.
          </p>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="container-shell flex flex-col gap-1.5 py-5 text-center text-xs leading-6 text-white/40 sm:flex-row sm:items-center sm:justify-between sm:text-start">
          <span>© {new Date().getFullYear()} حيطان المعتقل</span>
          <span>المعلومات المنشورة لا تُعد توثيقًا رسميًا.</span>
        </div>
      </div>
    </footer>
  );
}
