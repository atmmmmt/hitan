'use client';

import { useEffect, useState } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

const DISMISS_KEY = 'haytan-install-dismissed';

/** شريط علوي على الموبايل يدعو لتثبيت التطبيق (PWA) في أي صفحة. */
export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [visible, setVisible] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [iosBrowser, setIosBrowser] = useState<'safari' | 'chrome' | 'firefox'>('safari');

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.matchMedia('(max-width: 768px)').matches;
    let dismissed = false;
    try {
      dismissed = sessionStorage.getItem(DISMISS_KEY) === '1';
    } catch {}
    if (standalone || !mobile || dismissed) return;

    // كل متصفحات iOS (Safari وChrome وFirefox) تدعم «إضافة إلى الشاشة الرئيسية» من iOS 16.4
    const ios = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    setIsIos(ios);
    setIosBrowser(/CriOS/i.test(navigator.userAgent) ? 'chrome' : /FxiOS/i.test(navigator.userAgent) ? 'firefox' : 'safari');
    if (ios) setVisible(true);

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    const onInstalled = () => setVisible(false);

    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = async () => {
    if (isIos) {
      setShowIosHelp(true);
      return;
    }
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    setDeferred(null);
    if (outcome === 'accepted') setVisible(false);
  };

  const dismiss = () => {
    setVisible(false);
    setShowIosHelp(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {}
  };

  if (!visible) return null;

  return (
    <>
      <div className="install-bar" role="region" aria-label="تثبيت التطبيق">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/haytan-logo.png" alt="" width={36} height={36} className="install-bar__icon" />
        <div className="min-w-0 flex-1">
          <p className="install-bar__title">ثبّت تطبيق حيطان المعتقل</p>
          <p className="install-bar__sub">وصول أسرع ويعمل بدون إنترنت</p>
        </div>
        <button type="button" onClick={install} className="install-bar__btn">
          تثبيت
        </button>
        <button type="button" onClick={dismiss} className="install-bar__close" aria-label="إغلاق">
          ×
        </button>
      </div>

      {showIosHelp && (
        <div className="install-sheet" role="dialog" aria-modal="true" aria-label="طريقة التثبيت على الآيفون" onClick={dismiss}>
          <div className="install-sheet__card" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg">التثبيت على الآيفون</h2>
            <ol className="mt-3 space-y-2 text-sm text-stone-700">
              <li>
                ١. اضغط زر المشاركة <span aria-hidden="true">⬆︎</span>{' '}
                {iosBrowser === 'chrome'
                  ? 'في شريط العنوان أعلى Chrome'
                  : iosBrowser === 'firefox'
                    ? 'من قائمة Firefox (☰)'
                    : 'أسفل متصفح Safari'}
              </li>
              <li>٢. اختر «إضافة إلى الشاشة الرئيسية»</li>
              <li>٣. اضغط «إضافة» — وسيظهر التطبيق على شاشتك</li>
            </ol>
            <button type="button" onClick={dismiss} className="btn-primary mt-5 w-full">
              فهمت
            </button>
          </div>
        </div>
      )}
    </>
  );
}
