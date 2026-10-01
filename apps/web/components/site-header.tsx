import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { Logo } from './logo';
import { NavLinks } from './nav-links';

export function SiteHeader() {
  return (
    <header className="app-header sticky top-0 z-40 border-b border-stone-200/80 bg-[#fffdf9]/90 backdrop-blur-xl">
      <div className="container-shell flex min-h-[60px] items-center justify-between gap-3 py-1.5 md:min-h-[80px] md:py-2">
        <Link href="/" aria-label="الانتقال إلى الصفحة الرئيسية" className="flex shrink-0 items-center gap-2.5 rounded-2xl">
          <Logo priority />
          {/* على الموبايل: اسم التطبيق بجانب الشعار كما في التطبيقات */}
          <span className="font-display text-base font-bold text-stone-950 md:hidden">حيطان المعتقل</span>
        </Link>

        <nav aria-label="التنقل الرئيسي" className="hidden items-center gap-1 rounded-2xl border border-stone-200 bg-stone-100/80 p-1 md:flex">
          <NavLinks variant="desktop" />
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/cases" className="icon-button h-10 w-10 rounded-xl md:h-12 md:w-12 md:rounded-2xl" aria-label="البحث في الحالات">
            <Search size={19} aria-hidden="true" />
          </Link>
          {/* على الموبايل زر الإضافة موجود في الشريط السفلي */}
          <Link href="/submit" className="btn-primary hidden whitespace-nowrap px-5 md:inline-flex">
            <Plus size={18} aria-hidden="true" />
            إضافة حالة
          </Link>
        </div>
      </div>
    </header>
  );
}
