'use client';

import Link from 'next/link';
import { RefreshCw, ServerCrash } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';

export default function PlaceError({ reset }: { error: Error; reset: () => void }) {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="page-shell max-w-xl">
        <div className="card p-8 text-center sm:p-12">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-brand-600">
            <ServerCrash size={30} aria-hidden="true" />
          </span>
          <h1 className="mt-5 text-2xl">تعذّر تحميل صفحة المكان</h1>
          <p className="mt-3 leading-8 text-stone-600">لم نتمكن من الاتصال بالخادم. تحقق من الاتصال وحاول مجدداً بعد قليل.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <button type="button" onClick={reset} className="btn-primary">
              <RefreshCw size={17} aria-hidden="true" />
              إعادة المحاولة
            </button>
            <Link href="/places" className="btn-ghost">كل الأماكن</Link>
          </div>
        </div>
      </main>
    </>
  );
}
