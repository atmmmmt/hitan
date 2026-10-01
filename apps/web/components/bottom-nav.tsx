'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, Home, Info, Plus, Users } from 'lucide-react';

const items = [
  { href: '/', label: 'الرئيسية', icon: Home },
  { href: '/cases', label: 'الحالات', icon: Users },
  { href: '/submit', label: 'إضافة', icon: Plus, primary: true },
  { href: '/places', label: 'السجون', icon: Building2 },
  { href: '/about', label: 'عن المنصة', icon: Info },
] as const;

const isActive = (path: string, href: string) => (href === '/' ? path === '/' : path === href || path.startsWith(href + '/'));

/** شريط التنقل السفلي على الموبايل — بأسلوب التطبيقات. */
export function BottomNav() {
  const path = usePathname() || '/';
  if (path.startsWith('/admin')) return null;

  return (
    <nav aria-label="التنقل الرئيسي" className="bottom-nav md:hidden">
      {items.map(({ href, label, icon: Icon, ...rest }) => {
        const active = isActive(path, href);
        if ('primary' in rest) {
          return (
            <Link key={href} href={href} className="bottom-nav__primary" aria-label={label} aria-current={active ? 'page' : undefined}>
              <span className="bottom-nav__fab">
                <Icon size={26} strokeWidth={2.4} aria-hidden="true" />
              </span>
              <span className="bottom-nav__label">{label}</span>
            </Link>
          );
        }
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={`bottom-nav__item ${active ? 'is-active' : ''}`}
          >
            <span className="bottom-nav__icon">
              <Icon size={22} strokeWidth={active ? 2.4 : 2} aria-hidden="true" />
            </span>
            <span className="bottom-nav__label">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
