'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { mediaKindLabel } from '@/lib/api';
import type { FacilityImage } from '@/lib/api';

/** معرض صور بشبكة + عارض ملء الشاشة (أسهم الكيبورد، سحب على الموبايل). */
export function Gallery({ images }: { images: FacilityImage[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const [touchX, setTouchX] = useState<number | null>(null);
  const open = index !== null;

  const go = useCallback(
    (delta: number) => setIndex((i) => (i === null ? i : (i + delta + images.length) % images.length)),
    [images.length],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIndex(null);
      // RTL: السهم الأيسر = التالي
      if (e.key === 'ArrowLeft') go(1);
      if (e.key === 'ArrowRight') go(-1);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, go]);

  if (!images.length) return null;
  const current = index !== null ? images[index] : null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((img, i) => (
          <button
            key={img._id ?? img.url}
            type="button"
            onClick={() => setIndex(i)}
            className={`group relative overflow-hidden rounded-2xl bg-stone-900 ${i === 0 ? 'col-span-2 row-span-2' : ''}`}
            aria-label={`عرض الصورة: ${img.caption || i + 1}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.url}
              alt={img.caption || ''}
              loading="lazy"
              className="aspect-[4/3] h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-80 transition group-hover:opacity-100" />
            <span className="badge absolute right-2 top-2 bg-black/55 text-[0.7rem] text-white backdrop-blur">
              {mediaKindLabel[img.kind]}
            </span>
            {img.caption && (
              <span className="absolute inset-x-3 bottom-2.5 line-clamp-1 text-start text-sm font-medium text-white">
                {img.caption}
              </span>
            )}
          </button>
        ))}
      </div>

      {current && (
        <div
          className="fixed inset-0 z-[160] flex flex-col bg-black/95 text-white"
          role="dialog"
          aria-modal="true"
          aria-label="عارض الصور"
          onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX === null) return;
            const dx = e.changedTouches[0].clientX - touchX;
            if (Math.abs(dx) > 50) go(dx > 0 ? 1 : -1);
            setTouchX(null);
          }}
        >
          <div className="flex items-center justify-between gap-3 p-3 sm:p-4">
            <span className="font-display text-sm font-semibold text-white/70">
              {index! + 1} / {images.length}
            </span>
            <button
              type="button"
              onClick={() => setIndex(null)}
              className="grid h-11 w-11 place-items-center rounded-full bg-white/10 hover:bg-white/20"
              aria-label="إغلاق"
            >
              <X size={22} />
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-16">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img key={current.url} src={current.url} alt={current.caption || ''} className="max-h-full max-w-full animate-fade-up rounded-lg object-contain" />
            {images.length > 1 && (
              <>
                <button type="button" onClick={() => go(-1)} className="lightbox-nav right-2 sm:right-4" aria-label="السابقة">
                  <ChevronRight size={26} />
                </button>
                <button type="button" onClick={() => go(1)} className="lightbox-nav left-2 sm:left-4" aria-label="التالية">
                  <ChevronLeft size={26} />
                </button>
              </>
            )}
          </div>

          <div className="mx-auto w-full max-w-3xl p-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-center">
            <span className="badge bg-white/10 text-white/80">{mediaKindLabel[current.kind]}</span>
            {current.caption && <p className="mt-2 font-display font-semibold">{current.caption}</p>}
            {current.source && <p className="mt-1 text-xs text-white/50">المصدر: {current.source}</p>}
          </div>
        </div>
      )}
    </>
  );
}
