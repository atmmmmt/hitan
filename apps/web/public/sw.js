// v3: لا نخزّن ردود الـ API ولا طلبات RSC الخاصة بـ Next، ولا أي رد فاشل.
const CACHE = 'haytan-shell-v3';
const SHELL = ['/', '/cases', '/places', '/submit', '/about', '/haytan-logo.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  // احذف أي كاش قديم (v2 كان يخزّن ردود الـ API)
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // خارج أصل الموقع (مثل الـ API على منفذ آخر) أو طلبات Next الداخلية: الشبكة مباشرة دون كاش
  if (url.origin !== self.location.origin) return;
  if (req.headers.get('RSC') || url.searchParams.has('_rsc') || url.pathname.startsWith('/_next/webpack-hmr')) return;

  // ملفات Next الثابتة (مسمّاة بالهاش): الكاش أولاً
  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/demo/') || url.pathname.startsWith('/fonts/')) {
    e.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) caches.open(CACHE).then((c) => c.put(req, res.clone()));
            return res;
          }),
      ),
    );
    return;
  }

  // الصفحات: الشبكة أولاً، والكاش فقط عند انقطاع الاتصال
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match('/'))),
    );
  }
});
