'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { LockKeyhole } from 'lucide-react';
import { Logo } from '@/components/logo';
import { API } from '@/lib/api';

export default function Login() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(event.currentTarget);
    const response = await fetch(API + '/api/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(formData.entries())),
    });

    setLoading(false);
    if (response.ok) router.push('/admin');
    else setError('بيانات الدخول غير صحيحة');
  }

  return (
    <main
      id="main-content"
      className="grid min-h-dvh place-items-center bg-stone-950 p-4 sm:p-6"
      dir="rtl"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(181,18,27,.28),transparent_30rem)]" />
      <div className="card relative w-full max-w-md p-7 sm:p-9">
        <div className="flex justify-center">
          <Logo size="hero" priority />
        </div>
        <div className="mt-7 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-600">
            <LockKeyhole size={21} aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl font-black text-stone-950">دخول الإدارة</h1>
            <p className="mt-1 text-sm text-stone-500">لفريق المراجعة والنشر فقط</p>
          </div>
        </div>

        <form onSubmit={login} className="mt-7 space-y-5">
          <label className="block text-sm font-extrabold text-stone-800">
            البريد الإلكتروني
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="input mt-2"
            />
          </label>

          <label className="block text-sm font-extrabold text-stone-800">
            كلمة المرور
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="input mt-2"
            />
          </label>

          {error ? (
            <p role="alert" aria-live="polite" className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-800">
              {error}
            </p>
          ) : null}

          <button className="btn-primary w-full" disabled={loading}>
            {loading ? 'جارٍ الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>
      </div>
    </main>
  );
}
