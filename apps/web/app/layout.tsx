import type { Metadata, Viewport } from 'next';
import { Alexandria, Noto_Sans_Arabic } from 'next/font/google';
import './globals.css';
import { PwaRegister } from '@/components/pwa-register';
import { SplashLoader } from '@/components/splash-loader';
import { InstallPrompt } from '@/components/install-prompt';
import { BottomNav } from '@/components/bottom-nav';

// النصوص الطويلة والتفاصيل
const arabicFont = Noto_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-arabic',
});

// العناوين والأزرار والواجهات
const displayFont = Alexandria({
  subsets: ['arabic', 'latin'],
  weight: ['600', '700'],
  display: 'swap',
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: { default: 'حيطان المعتقل', template: '%s | حيطان المعتقل' },
  description: 'منصة مجتمعية للتوثيق والبحث عن المعتقلين والمفقودين',
  manifest: '/manifest.webmanifest',
  applicationName: 'حيطان المعتقل',
  // عند الإضافة للشاشة الرئيسية على الآيفون: يفتح بملء الشاشة بدون شريط المتصفح
  appleWebApp: { capable: true, title: 'حيطان', statusBarStyle: 'default' },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#fffdf9',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${arabicFont.variable} ${displayFont.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      {/* إضافات المتصفح (مثل ColorZilla أو تعبئة كروم التلقائية) تضيف خصائص قبل تحميل React */}
      <body suppressHydrationWarning>
        <SplashLoader />
        <a href="#main-content" className="skip-link">انتقل إلى المحتوى</a>
        <PwaRegister />
        <InstallPrompt />
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
