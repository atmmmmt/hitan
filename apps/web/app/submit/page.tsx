'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { CheckCircle2, Send, ShieldCheck } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { API } from '@/lib/api';
import { Select } from '@/components/select';

export default function Submit() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(event.currentTarget);
    const body = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(API + '/api/public/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error();
      setDone(true);
    } catch {
      setError('تعذر إرسال الحالة حاليًا. تأكد من الاتصال وحاول مجددًا.');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <>
        <SiteHeader />
        <main id="main-content" className="page-shell max-w-2xl">
          <div className="card p-8 text-center sm:p-12">
            <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-50 text-emerald-700">
              <CheckCircle2 size={42} aria-hidden="true" />
            </span>
            <h1 className="mt-6 text-3xl font-black text-stone-950">
              وصلت الحالة إلى فريق المراجعة
            </h1>
            <p className="mt-4 leading-8 text-stone-600">
              لن تظهر للعامة الآن. بعد تدقيقها وقبولها من الإدارة ستُنشر تلقائيًا في المنصة.
            </p>
            <Link href="/" className="btn-primary mt-7">
              العودة إلى الرئيسية
            </Link>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="page-shell max-w-4xl">
        <div className="mb-8 max-w-3xl">
          <div className="section-kicker">إرسال للمراجعة</div>
          <h1 className="section-title">إضافة حالة جديدة</h1>
          <p className="section-copy">
            شارك فقط المعلومات التي تملك حق مشاركتها. بيانات التواصل خاصة بفريق المراجعة
            ولا تظهر للعامة.
          </p>
        </div>

        <div className="mb-6 flex items-start gap-3 rounded-3xl bg-stone-950 p-5 text-white shadow-card">
          <ShieldCheck className="mt-0.5 shrink-0 text-red-400" aria-hidden="true" />
          <div>
            <div className="font-black">لا يوجد نشر مباشر</div>
            <p className="mt-1 text-sm leading-7 text-white/60">
              كل طلب يدخل لوحة الإدارة بحالة «بانتظار المراجعة».
            </p>
          </div>
        </div>

        <form onSubmit={submit} suppressHydrationWarning className="card overflow-hidden">
          <section className="border-b border-stone-200 p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-sm font-black text-white">١</span>
              <div>
                <h2 className="text-xl font-black text-stone-950">المعلومات الأساسية</h2>
                <p className="mt-1 text-sm text-stone-500">ابدأ بالبيانات التي تساعد على تمييز الحالة.</p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="text-sm font-semibold text-stone-800">
                الاسم الكامل <span className="text-brand-600">*</span>
                <input name="fullName" required autoComplete="name" className="input mt-2" />
              </label>

              <label className="text-sm font-semibold text-stone-800">
                سنة الميلاد
                <input
                  name="birthYear"
                  inputMode="numeric"
                  pattern="[0-9]{4}"
                  className="input mt-2"
                  placeholder="مثال: 1988"
                />
              </label>

              <label className="text-sm font-semibold text-stone-800">
                الحالة
                <Select
                  name="status"
                  className="mt-2"
                  options={[
                    { value: 'detained', label: 'معتقل' },
                    { value: 'missing', label: 'مفقود' },
                    { value: 'released', label: 'مفرج عنه' },
                    { value: 'unknown', label: 'غير معروف' },
                  ]}
                />
              </label>

              <label className="text-sm font-semibold text-stone-800">
                المحافظة أو المنطقة
                <input name="region" className="input mt-2" />
              </label>

              <label className="text-sm font-semibold text-stone-800">
                مكان الاعتقال أو آخر ظهور
                <input name="detentionPlace" className="input mt-2" />
              </label>

              <label className="text-sm font-semibold text-stone-800">
                تاريخ الاعتقال أو الفقدان
                <input name="detentionDate" type="date" className="input mt-2" />
              </label>
            </div>
          </section>

          <section className="border-b border-stone-200 p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-stone-950 text-sm font-black text-white">٢</span>
              <div>
                <h2 className="text-xl font-black text-stone-950">وصف الحالة</h2>
                <p className="mt-1 text-sm text-stone-500">اكتب معلومات مختصرة وواضحة وتجنب التخمين.</p>
              </div>
            </div>

            <div className="space-y-5">
              <label className="block text-sm font-semibold text-stone-800">
                ملخص الحالة <span className="text-brand-600">*</span>
                <textarea
                  name="summary"
                  required
                  rows={4}
                  className="input mt-2"
                  placeholder="اكتب المعلومة باختصار ووضوح..."
                />
              </label>

              <label className="block text-sm font-semibold text-stone-800">
                تفاصيل إضافية
                <textarea name="details" rows={6} className="input mt-2" />
              </label>
            </div>
          </section>

          <section className="p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-stone-200 text-sm font-black text-stone-800">٣</span>
              <div>
                <h2 className="text-xl font-black text-stone-950">بيانات المبلّغ</h2>
                <p className="mt-1 text-sm text-stone-500">هذه البيانات خاصة بفريق الإدارة.</p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="text-sm font-semibold text-stone-800">
                اسم المبلّغ
                <input name="submitterName" autoComplete="name" className="input mt-2" />
              </label>
              <label className="text-sm font-semibold text-stone-800">
                رقم أو وسيلة التواصل
                <input name="submitterContact" autoComplete="tel" className="input mt-2" />
              </label>
            </div>

            {error ? (
              <p role="alert" className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800">
                {error}
              </p>
            ) : null}

            <button disabled={loading} className="btn-primary mt-7 w-full py-4">
              <Send size={18} aria-hidden="true" />
              {loading ? 'جارٍ الإرسال...' : 'إرسال الحالة للمراجعة'}
            </button>
          </section>
        </form>
      </main>
      <SiteFooter />
    </>
  );
}
