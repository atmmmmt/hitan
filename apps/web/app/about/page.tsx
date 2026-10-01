import { BookOpenText, LockKeyhole, Scale } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

const principles = [
  {
    icon: BookOpenText,
    title: 'ذاكرة قابلة للبحث',
    text: 'تنظيم المعلومات التي يشاركها الأهالي والمهتمون بطريقة تسهّل الوصول إليها.',
  },
  {
    icon: Scale,
    title: 'مراجعة مسؤولة',
    text: 'لا تثبت المنصة الاعتقال أو الوفاة رسميًا، وكل حالة تمر بمراجعة قبل نشرها.',
  },
  {
    icon: LockKeyhole,
    title: 'الخصوصية أولًا',
    text: 'بيانات المبلّغ ووسائل التواصل معه تبقى خاصة بفريق الإدارة ولا تظهر للعامة.',
  },
] as const;

export default function About() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="page-shell max-w-5xl">
        <section className="card overflow-hidden">
          <div className="border-b border-stone-200 bg-stone-950 px-6 py-10 text-white sm:px-10 sm:py-14">
            <div className="text-sm font-extrabold text-red-300">عن المشروع</div>
            <h1 className="mt-3 text-4xl font-black sm:text-5xl">حيطان المعتقل</h1>
            <p className="mt-5 max-w-3xl text-lg leading-9 text-white/65">
              منصة مجتمعية مرتبطة بمجلة زمان الوصل، صُممت لجمع المعلومات حول المعتقلين
              والمفقودين وتنظيمها بما يساعد العائلات والباحثين على الوصول إليها.
            </p>
          </div>

          <div className="grid gap-4 p-6 sm:p-10 lg:grid-cols-3">
            {principles.map(({ icon: Icon, title, text }) => (
              <article key={title} className="rounded-3xl border border-stone-200 bg-stone-50 p-6">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                  <Icon size={22} aria-hidden="true" />
                </span>
                <h2 className="mt-5 text-xl font-black text-stone-950">{title}</h2>
                <p className="mt-3 text-sm leading-8 text-stone-600">{text}</p>
              </article>
            ))}
          </div>

          <div className="mx-6 mb-6 rounded-3xl border border-brand-100 bg-brand-50 p-6 text-brand-950 sm:mx-10 sm:mb-10">
            <h2 className="text-xl font-black">حدود المسؤولية</h2>
            <p className="mt-3 leading-8 text-brand-950/75">
              المحتوى المنشور قد يأتي من المستخدمين أو من مصادر مجتمعية. المراجعة التحريرية
              تقلل الأخطاء ولا تمثل ضمانًا رسميًا لصحة كل معلومة، ويمكن طلب التصحيح أو الحذف
              عند الحاجة.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
