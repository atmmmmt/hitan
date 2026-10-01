'use client';

import { useEffect, useRef, useState } from 'react';
import type { Viewer } from '@photo-sphere-viewer/core';
import type { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import '@photo-sphere-viewer/core/index.css';
import '@photo-sphere-viewer/markers-plugin/index.css';
import { Rotate3d } from 'lucide-react';
import { mediaKindLabel } from '@/lib/api';
import type { Room } from '@/lib/api';

const rad = (deg: number) => (deg * Math.PI) / 180;
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function markersFor(room: Room, rooms: Room[]) {
  const names = new Map(rooms.map((r) => [r.key, r.name]));
  return [
    ...room.links
      .filter((l) => names.has(l.to))
      .map((l, i) => ({
        id: `link-${i}-${l.to}`,
        position: { yaw: rad(l.yaw), pitch: rad(l.pitch) },
        html: `<span class="tour-link"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 15 6-6 6 6"/></svg></span>`,
        size: { width: 56, height: 56 },
        anchor: 'center center',
        tooltip: { content: `الانتقال إلى: ${esc(names.get(l.to)!)}`, position: 'top center' },
        data: { to: l.to },
      })),
    ...room.info.map((p, i) => ({
      id: `info-${i}`,
      position: { yaw: rad(p.yaw), pitch: rad(p.pitch) },
      html: `<span class="tour-info">i</span>`,
      size: { width: 34, height: 34 },
      anchor: 'center center',
      tooltip: {
        content: `<strong>${esc(p.title)}</strong>${p.text ? `<br>${esc(p.text)}` : ''}`,
        position: 'top center',
        trigger: 'click' as const,
      },
    })),
  ];
}

/** جولة افتراضية ٣٦٠° بين غرف المكان (Photo Sphere Viewer). */
export function VirtualTour({ rooms }: { rooms: Room[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const markersRef = useRef<MarkersPlugin | null>(null);
  const [current, setCurrent] = useState(rooms[0]?.key);
  const [ready, setReady] = useState(false);
  const room = rooms.find((r) => r.key === current) ?? rooms[0];

  // إنشاء العارض مرة واحدة
  useEffect(() => {
    let cancelled = false;
    let viewer: Viewer | null = null;
    (async () => {
      const [{ Viewer }, { MarkersPlugin }] = await Promise.all([
        import('@photo-sphere-viewer/core'),
        import('@photo-sphere-viewer/markers-plugin'),
      ]);
      if (cancelled || !containerRef.current) return;
      viewer = new Viewer({
        container: containerRef.current,
        panorama: rooms[0].panoramaUrl,
        caption: rooms[0].name,
        loadingTxt: 'جارٍ تحميل المشهد…',
        defaultZoomLvl: 20,
        mousewheelCtrlKey: true,
        touchmoveTwoFingers: false,
        navbar: ['zoom', 'caption', 'fullscreen'],
        lang: {
          zoom: 'تكبير', zoomOut: 'تصغير', zoomIn: 'تكبير', fullscreen: 'ملء الشاشة',
          ctrlZoom: 'استخدم Ctrl + العجلة للتكبير', twoFingers: 'استخدم إصبعين للتنقل',
        } as never,
        plugins: [[MarkersPlugin, { markers: markersFor(rooms[0], rooms) }]],
      });
      const markers = viewer.getPlugin<MarkersPlugin>(MarkersPlugin);
      markers.addEventListener('select-marker', ({ marker }) => {
        const to = (marker.data as { to?: string } | undefined)?.to;
        if (to) setCurrent(to);
      });
      viewer.addEventListener('ready', () => setReady(true), { once: true });
      viewerRef.current = viewer;
      markersRef.current = markers;
    })();
    return () => {
      cancelled = true;
      viewer?.destroy();
      viewerRef.current = null;
      markersRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // تبديل الغرفة
  useEffect(() => {
    const viewer = viewerRef.current;
    const markers = markersRef.current;
    if (!viewer || !markers || !room || !ready) return;
    if (viewer.config.panorama === room.panoramaUrl) return;
    markers.clearMarkers();
    viewer
      .setPanorama(room.panoramaUrl, { caption: room.name, transition: { speed: 1200, rotation: false }, zoom: 20 })
      .then((ok) => ok && markers.setMarkers(markersFor(room, rooms)));
  }, [room, rooms, ready]);

  if (!room) return null;

  return (
    <div className="overflow-hidden rounded-3xl border border-stone-200 bg-stone-950 shadow-soft">
      <div className="relative">
        <div ref={containerRef} className="tour-viewer h-[62vh] min-h-[340px] w-full sm:h-[560px]" dir="ltr" />
        {!ready && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center text-white/60">
            <Rotate3d size={42} className="animate-pulse" aria-hidden="true" />
          </div>
        )}
        <span className="badge pointer-events-none absolute right-3 top-3 bg-black/60 text-white backdrop-blur">
          {mediaKindLabel[room.kind]}
        </span>
      </div>

      {rooms.length > 1 && (
        <div className="flex gap-2 overflow-x-auto border-t border-white/10 p-3" role="tablist" aria-label="غرف الجولة">
          {rooms.map((r) => (
            <button
              key={r.key}
              type="button"
              role="tab"
              aria-selected={r.key === room.key}
              onClick={() => setCurrent(r.key)}
              className={`group relative h-16 w-28 shrink-0 overflow-hidden rounded-xl border-2 text-start transition ${
                r.key === room.key ? 'border-brand-500' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={r.panoramaUrl} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
              <span className="absolute inset-0 bg-gradient-to-t from-black/85 to-black/10" />
              <span className="absolute inset-x-2 bottom-1.5 line-clamp-1 text-xs font-semibold text-white">{r.name}</span>
            </button>
          ))}
        </div>
      )}

      <div className="border-t border-white/10 px-5 py-4 text-white">
        <h3 className="text-lg">{room.name}</h3>
        {room.description && <p className="mt-1 text-sm leading-7 text-white/65">{room.description}</p>}
        {room.source && <p className="mt-2 text-xs text-white/40">المصدر: {room.source}</p>}
      </div>
    </div>
  );
}
