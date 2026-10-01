'use client';

import { useEffect, useState } from 'react';

const SEEN_KEY = 'haytan-splash-seen';
const MIN_VISIBLE_MS = 1400;

/** شاشة افتتاحية تظهر مرة واحدة لكل جلسة، ثم تتلاشى بعد اكتمال التحميل. */
export function SplashLoader() {
  const [phase, setPhase] = useState<'visible' | 'leaving' | 'gone'>('visible');

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === '1';
    } catch {}
    if (seen) {
      setPhase('gone');
      return;
    }

    const start = performance.now();
    let leaveTimer: number | undefined;
    let goneTimer: number | undefined;

    const finish = () => {
      const wait = Math.max(0, MIN_VISIBLE_MS - (performance.now() - start));
      leaveTimer = window.setTimeout(() => {
        setPhase('leaving');
        try {
          sessionStorage.setItem(SEEN_KEY, '1');
        } catch {}
        goneTimer = window.setTimeout(() => setPhase('gone'), 700);
      }, wait);
    };

    if (document.readyState === 'complete') finish();
    else window.addEventListener('load', finish, { once: true });

    return () => {
      window.removeEventListener('load', finish);
      window.clearTimeout(leaveTimer);
      window.clearTimeout(goneTimer);
    };
  }, []);

  if (phase === 'gone') return null;

  return (
    <div className={`splash ${phase === 'leaving' ? 'splash--leaving' : ''}`} role="status" aria-live="polite">
      <div className="splash__bricks" aria-hidden="true" />
      <div className="splash__content">
        <div className="splash__logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/haytan-logo.png" alt="" width={112} height={112} />
          <span className="splash__ring" aria-hidden="true" />
        </div>
        <p className="splash__title">حيطان المعتقل</p>
        <p className="splash__tagline">ذاكرة لا تُمحى · صوت لا يُسكت</p>
        <div className="splash__bar" aria-hidden="true">
          <span />
        </div>
        <span className="sr-only">جارٍ التحميل…</span>
      </div>
    </div>
  );
}
