'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  ['/', 'الرئيسية'],
  ['/cases', 'الحالات'],
  ['/places', 'السجون والأماكن'],
  ['/about', 'عن المنصة'],
] as const;

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/');
}

/** روابط التنقل مع تمييز الصفحة الحالية. */
export function NavLinks({ variant }: { variant: 'desktop' | 'mobile' }) {
  const pathname = usePathname() || '/';
  const base = variant === 'desktop' ? 'nav-link' : 'mobile-nav-link';

  return (
    <>
      {navItems.map(([href, label]) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={`${base} ${active ? 'nav-link--active' : ''}`}
          >
            {label}
          </Link>
        );
      })}
    </>
  );
}
