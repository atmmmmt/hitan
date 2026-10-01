'use client';

import { useEffect, useRef } from 'react';
import type { Viewer } from '@photo-sphere-viewer/core';
import type { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import '@photo-sphere-viewer/core/index.css';
import '@photo-sphere-viewer/markers-plugin/index.css';
import type { Room } from '@/lib/api';

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => Math.round((r * 180) / Math.PI);

/**
 * معاينة بانوراما للإدارة: النقر في أي مكان يعيد الاتجاه (yaw/pitch بالدرجات)
 * لإضافة سهم انتقال أو نقطة معلومة في ذلك الموضع.
 */
export function PanoPicker({ room, onPick }: { room: Room; onPick: (pos: { yaw: number; pitch: number }) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const markersRef = useRef<MarkersPlugin | null>(null);
  const pickRef = useRef(onPick);
  pickRef.current = onPick;

  useEffect(() => {
    let viewer: Viewer | null = null;
    let cancelled = false;
    (async () => {
      const [{ Viewer }, { MarkersPlugin }] = await Promise.all([
        import('@photo-sphere-viewer/core'),
        import('@photo-sphere-viewer/markers-plugin'),
      ]);
      if (cancelled || !ref.current) return;
      viewer = new Viewer({
        container: ref.current,
        panorama: room.panoramaUrl,
        navbar: ['zoom', 'fullscreen'],
        defaultZoomLvl: 10,
        plugins: [[MarkersPlugin, {}]],
      });
      markersRef.current = viewer.getPlugin<MarkersPlugin>(MarkersPlugin);
      viewer.addEventListener('click', ({ data }) => {
        if (data.rightclick) return;
        pickRef.current({ yaw: deg(data.yaw), pitch: deg(data.pitch) });
      });
      viewerRef.current = viewer;
      viewer.addEventListener('ready', () => draw(), { once: true });
    })();
    return () => {
      cancelled = true;
      viewer?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.panoramaUrl]);

  function draw() {
    const m = markersRef.current;
    if (!m) return;
    m.setMarkers([
      ...room.links.map((l, i) => ({
        id: `l${i}`,
        position: { yaw: rad(l.yaw), pitch: rad(l.pitch) },
        html: '<span class="tour-link" style="width:40px;height:40px;animation:none">↑</span>',
        size: { width: 40, height: 40 },
        anchor: 'center center',
        tooltip: `سهم ← ${l.to}`,
      })),
      ...room.info.map((p, i) => ({
        id: `i${i}`,
        position: { yaw: rad(p.yaw), pitch: rad(p.pitch) },
        html: '<span class="tour-info">i</span>',
        size: { width: 34, height: 34 },
        anchor: 'center center',
        tooltip: p.title || 'معلومة',
      })),
    ]);
  }

  // إعادة رسم العلامات عند تعديل الروابط/النقاط
  useEffect(() => {
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.links, room.info]);

  return <div ref={ref} dir="ltr" className="tour-viewer h-[340px] w-full overflow-hidden rounded-2xl bg-stone-900 sm:h-[420px]" />;
}
