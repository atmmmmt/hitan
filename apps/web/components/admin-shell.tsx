'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ClipboardCheck, Database, LayoutDashboard, LogOut, Settings } from 'lucide-react';
import { Logo } from './logo';
import { API } from '@/lib/api';

const items = [
  ['/admin', LayoutDashboard, 'نظرة عامة'],
  ['/admin/cases', ClipboardCheck, 'مراجعة الحالات'],
  ['/admin/facilities', Database, 'السجون والأماكن'],
  ['/admin/settings', Settings, 'الإعدادات'],
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();

  useEffect(() => {
    fetch(API + '/api/auth/me', { credentials: 'include' })
      .then((response) => {
        if (!response.ok) router.replace('/admin/login');
      })
      .catch(() => router.replace('/admin/login'));
  }, [router]);

  async function logout() {
    await fetch(API + '/api/auth/logout', { method: 'POST', credentials: 'include' });
    router.push('/admin/login');
  }

  function isActive(href: string) {
    return href === '/admin' ? path === '/admin' : path === href || path.startsWith(href + '/');
  }

  return (
    <div className="min-h-dvh bg-[var(--canvas)]" dir="rtl">
      <aside className="fixed inset-y-0 right-0 hidden w-[300px] flex-col bg-stone-950 p-6 text-white lg:flex">
        <Link href="/admin" className="mx-auto rounded-3xl" aria-label="الصفحة الرئيسية للإدارة">
          <Logo size="admin" priority />
        </Link>
        <div className="mt-6 text-center">
          <div className="font-black">لوحة الإدارة</div>
          <div className="mt-1 text-xs text-white/40">المراجعة والنشر</div>
        </div>

        <nav aria-label="التنقل في لوحة الإدارة" className="mt-6 space-y-1.5">
          {items.map(([href, Icon, label]) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={[
                  'flex min-h-12 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold',
                  active
                    ? 'bg-brand-600 text-white shadow-lg shadow-black/20'
                    : 'text-white/60 hover:bg-white/[0.07] hover:text-white',
                ].join(' ')}
              >
                <Icon size={19} aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={logout}
          className="mt-auto flex min-h-12 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-white/55 hover:bg-white/[0.07] hover:text-white"
        >
          <LogOut size={19} aria-hidden="true" />
          تسجيل الخروج
        </button>
      </aside>

      <div className="lg:mr-[300px]">
        <header className="border-b border-stone-200 bg-[#fffdf9]">
          <div className="flex min-h-24 items-center justify-between gap-4 px-4 sm:px-6 lg:min-h-20 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="lg:hidden">
                <Logo priority />
              </div>
              <div>
                <div className="font-black text-stone-950">إدارة المنصة</div>
                <div className="mt-1 text-xs text-stone-500">نظام المراجعة والنشر</div>
              </div>
            </div>
            <div className="grid h-11 w-11 place-items-center rounded-full bg-stone-950 font-black text-white" aria-label="حساب الإدارة">
              إ
            </div>
          </div>

          <nav aria-label="التنقل في لوحة الإدارة على الهاتف" className="flex gap-1 overflow-x-auto border-t border-stone-200 px-4 py-2 lg:hidden">
            {items.map(([href, Icon, label]) => (
              <Link
                key={href}
                href={href}
                className={[
                  'flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3 text-xs font-bold',
                  isActive(href) ? 'bg-brand-600 text-white' : 'bg-stone-100 text-stone-700',
                ].join(' ')}
              >
                <Icon size={17} aria-hidden="true" />
                {label}
              </Link>
            ))}
          </nav>
        </header>

        <main id="main-content" className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
