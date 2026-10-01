# حيطان المعتقل

منصة PWA عربية RTL للبحث المجتمعي عن المعتقلين والمفقودين، مع مسار مراجعة كامل قبل النشر العام.

## التقنية
- Frontend + Admin Dashboard: Next.js + TypeScript + Tailwind CSS
- Backend: Node.js + Express + TypeScript
- Database: MongoDB + Mongoose
- Auth: JWT داخل HttpOnly Cookie
- PWA: Web App Manifest + Service Worker

## آلية النشر
1. الزائر يضيف حالة من صفحة `/submit`.
2. الحالة تُحفظ تلقائياً بحالة `pending` ولا تظهر للعامة.
3. الإدارة تراجعها من `/admin/cases`.
4. عند القبول تتحول إلى `approved` وتظهر في البحث العام فوراً.
5. بيانات تواصل المُبلّغ تبقى خاصة بالإدارة ولا ترجع من Public API.

## التشغيل محلياً
انسخ ملفات البيئة:
```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```
ثم:
```bash
npm install
npm run dev
```

الواجهة: http://localhost:3000
الـ API: http://localhost:4000

## إنشاء أول مدير
بعد تشغيل MongoDB وضبط `.env`:
```bash
npm run seed:admin -w apps/api
```

> مهم: المشروع يتعامل مع بيانات بشرية حساسة. لا تُنشر معلومات الاتصال الخاصة بالمبلّغين، ويُنصح بإضافة سياسة تحرير وتحقق وحذف/اعتراض قبل الإطلاق العام.
