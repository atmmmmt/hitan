// يولّد صور بانوراما تجريبية (equirectangular) لزنزانة وممر عبر تتبّع أشعة بسيط،
// إضافة لصور منظور للمعرض. الناتج: apps/web/public/demo/*.png — إعادة بناء تجريبية وليست صوراً حقيقية.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const out = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../web/public/demo');
fs.mkdirSync(out, { recursive: true });

// ---------- PNG encoder ----------
const crcTable = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function writePng(file, w, h, rgb) {
  const raw = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 3 + 1)] = 0;
    rgb.copy(raw, y * (w * 3 + 1) + 1, y * w * 3, (y + 1) * w * 3);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  fs.writeFileSync(
    path.join(out, file),
    Buffer.concat([
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
      chunk('IHDR', ihdr),
      chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
      chunk('IEND', Buffer.alloc(0)),
    ]),
  );
  console.log('wrote', file);
}

// ---------- noise ----------
const hash = (x, y) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
};
function vnoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
const fbm = (x, y) => vnoise(x, y) * 0.5 + vnoise(x * 2.1, y * 2.1) * 0.3 + vnoise(x * 4.3, y * 4.3) * 0.2;

// ---------- scene ----------
// غرفة صندوقية؛ الكاميرا في (0, eye, 0)؛ المحاور: x يمين، y أعلى، z أمام.
function makeScene(kind) {
  if (kind === 'cell') {
    return { hx: 1.3, hz: 1.6, h: 2.7, eye: 1.55, lamp: [0, 2.6, 0.2], door: 'front', window: true, bench: true, tally: true };
  }
  return { hx: 1.1, hz: 9, h: 3, eye: 1.6, lamp: null, lamps: [-6, -2, 2, 6], cellsDoors: true };
}

function shade(scene, ox, oy, oz, dx, dy, dz) {
  const { hx, hz, h } = scene;
  // تقاطع مع جدران الصندوق
  let t = Infinity, face = '';
  const test = (tt, f) => { if (tt > 1e-4 && tt < t) { t = tt; face = f; } };
  if (dx > 0) test((hx - ox) / dx, 'right'); else if (dx < 0) test((-hx - ox) / dx, 'left');
  if (dz > 0) test((hz - oz) / dz, 'front'); else if (dz < 0) test((-hz - oz) / dz, 'back');
  if (dy > 0) test((h - oy) / dy, 'ceil'); else if (dy < 0) test((0 - oy) / dy, 'floor');
  const px = ox + dx * t, py = oy + dy * t, pz = oz + dz * t;

  let r, g, b;
  let n = [0, 0, 0];
  if (face === 'floor') {
    const v = fbm(px * 3, pz * 3);
    r = g = b = 70 + v * 40;
    r += 4; g += 2;
    // بقع رطوبة
    if (fbm(px * 0.8 + 9, pz * 0.8) > 0.62) { r *= 0.7; g *= 0.7; b *= 0.7; }
    n = [0, 1, 0];
  } else if (face === 'ceil') {
    const v = fbm(px * 2, pz * 2);
    r = g = b = 95 + v * 30;
    n = [0, -1, 0];
  } else {
    // جدار خرساني
    const u = face === 'left' || face === 'right' ? pz : px;
    const v = fbm(u * 2.5 + (face.length * 7), py * 2.5);
    r = 138 + v * 45; g = 132 + v * 42; b = 122 + v * 38;
    // خط الطلاء السفلي
    if (py < 1.1) { r *= 0.78; g *= 0.8; b *= 0.82; }
    if (Math.abs(py - 1.1) < 0.015) { r *= 0.6; g *= 0.6; b *= 0.6; }
    // تشققات ورطوبة
    if (fbm(u * 0.7 + 3, py * 1.2) > 0.66) { r *= 0.72; g *= 0.74; b *= 0.72; }
    n = face === 'left' ? [1, 0, 0] : face === 'right' ? [-1, 0, 0] : face === 'front' ? [0, 0, -1] : [0, 0, 1];

    if (scene.door === 'front' && face === 'front' && Math.abs(px) < 0.5 && py < 2.05) {
      // باب حديدي
      const edge = Math.abs(px) > 0.46 || py > 2.0;
      const rivet = (Math.abs(Math.abs(px) - 0.4) < 0.02 && Math.abs(((py * 5) % 1) - 0.5) < 0.08);
      const nv = fbm(px * 6, py * 6);
      r = 52 + nv * 22; g = 56 + nv * 22; b = 60 + nv * 22;
      if (fbm(px * 3 + 4, py * 3) > 0.6) { r += 30; g += 12; b -= 5; } // صدأ
      if (edge || rivet) { r *= 0.6; g *= 0.6; b *= 0.6; }
      // فتحة المراقبة بقضبان
      if (py > 1.45 && py < 1.75 && Math.abs(px) < 0.18) {
        const bar = Math.abs(((px + 0.18) / 0.06) % 1 - 0.5) < 0.18;
        if (!bar) { r = 18; g = 16; b = 15; } else { r = 90; g = 90; b = 92; }
      }
    }
    if (scene.window && face === 'back' && Math.abs(px) < 0.28 && py > 2.1 && py < 2.45) {
      // نافذة صغيرة عالية بقضبان
      const bar = Math.abs(((px + 0.28) / 0.093) % 1 - 0.5) < 0.16;
      if (bar) { r = 60; g = 60; b = 62; } else { r = 215; g = 222; b = 228; }
      return [r, g, b];
    }
    if (scene.tally && face === 'left' && pz > -0.6 && pz < 0.4 && py > 0.9 && py < 1.4) {
      // خطوط عدّ الأيام محفورة
      const col = Math.floor((pz + 0.6) / 0.05), row = Math.floor((py - 0.9) / 0.12);
      const inX = Math.abs(((pz + 0.6) / 0.05) % 1 - 0.5) < 0.12;
      const inRow = ((py - 0.9) / 0.12) % 1 < 0.75;
      if (inX && inRow && (col % 5 !== 4 || row % 2 === 0) && hash(col, row) > 0.15) { r *= 0.55; g *= 0.55; b *= 0.55; }
    }
    if (scene.cellsDoors && (face === 'left' || face === 'right')) {
      // أبواب زنازين متتالية على جانبي الممر
      const k = ((pz + 100) % 3) / 3;
      if (k > 0.35 && k < 0.65 && py < 2.1) {
        const nv = fbm(pz * 5, py * 5);
        r = 50 + nv * 20; g = 54 + nv * 20; b = 58 + nv * 20;
        if (Math.abs(k - 0.35) < 0.012 || Math.abs(k - 0.65) < 0.012 || py > 2.05) { r *= 0.55; g *= 0.55; b *= 0.55; }
        if (py > 1.5 && py < 1.7 && k > 0.45 && k < 0.55) { r = 16; g = 14; b = 13; }
      }
    }
  }
  if (scene.bench && face === 'right' && py < 0.5 && pz > -1.4 && pz < 0.6) {
    // مصطبة خرسانية للنوم (مرسومة على الجدار)
    r *= 0.85; g *= 0.85; b *= 0.85;
    if (Math.abs(py - 0.48) < 0.02) { r *= 0.7; g *= 0.7; b *= 0.7; }
  }

  // الإضاءة: مصباح/مصابيح نقطية + إضاءة محيطة خافتة
  const lamps = scene.lamp ? [scene.lamp] : scene.lamps.map((z) => [0, scene.h - 0.05, z]);
  let light = 0.14;
  let glow = 0;
  for (const L of lamps) {
    const lx = L[0] - px, ly = L[1] - py, lz = L[2] - pz;
    const d2 = lx * lx + ly * ly + lz * lz, d = Math.sqrt(d2);
    const ndl = Math.max(0, (n[0] * lx + n[1] * ly + n[2] * lz) / d);
    light += (ndl * 2.4) / (1 + d2 * 0.55);
    // وهج المصباح نفسه
    const vx = L[0] - ox, vy = L[1] - oy, vz = L[2] - oz;
    const vd = Math.sqrt(vx * vx + vy * vy + vz * vz);
    const cos = (vx * dx + vy * dy + vz * dz) / vd;
    if (cos > 0.9985 && vd < t + 0.1) glow = Math.max(glow, (cos - 0.9985) / 0.0015);
  }
  // ضوء النافذة
  if (scene.window) {
    const wx = -px, wy = 2.3 - py, wz = -hz - pz;
    const d2 = wx * wx + wy * wy + wz * wz;
    light += (0.6 * Math.max(0, (n[0] * wx + n[1] * wy + n[2] * wz) / Math.sqrt(d2))) / (1 + d2 * 0.4);
  }
  // عتمة في الزوايا (vignette مكاني)
  const corner = Math.min(hx - Math.abs(px), hz - Math.abs(pz), py, h - py);
  const ao = 0.55 + 0.45 * Math.min(1, corner / 0.35);
  // ضباب في الممرات الطويلة
  const fog = Math.exp(-t * 0.08);
  const warm = [1.08, 1.0, 0.82];
  r = r * light * ao * warm[0] * fog + 12 * (1 - fog);
  g = g * light * ao * warm[1] * fog + 11 * (1 - fog);
  b = b * light * ao * warm[2] * fog + 10 * (1 - fog);
  if (glow > 0) { r += 255 * glow; g += 240 * glow; b += 190 * glow; }
  return [r, g, b];
}

const clamp = (v) => (v < 0 ? 0 : v > 255 ? 255 : v);

function renderEquirect(kind, w, h) {
  const scene = makeScene(kind);
  const buf = Buffer.alloc(w * h * 3);
  const ss = 2;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let R = 0, G = 0, B = 0;
      for (let sy = 0; sy < ss; sy++) for (let sx = 0; sx < ss; sx++) {
        const lon = ((x + (sx + 0.5) / ss) / w) * 2 * Math.PI - Math.PI;
        const lat = Math.PI / 2 - ((y + (sy + 0.5) / ss) / h) * Math.PI;
        const dx = Math.cos(lat) * Math.sin(lon), dy = Math.sin(lat), dz = Math.cos(lat) * Math.cos(lon);
        const [r, g, b] = shade(scene, 0, scene.eye, 0, dx, dy, dz);
        R += r; G += g; B += b;
      }
      const i = (y * w + x) * 3;
      const grain = (hash(x, y) - 0.5) * 6;
      buf[i] = clamp(R / 4 + grain); buf[i + 1] = clamp(G / 4 + grain); buf[i + 2] = clamp(B / 4 + grain);
    }
  }
  return buf;
}

function renderPerspective(kind, w, h, yawDeg, pitchDeg, fovDeg, pos) {
  const scene = makeScene(kind);
  const buf = Buffer.alloc(w * h * 3);
  const yaw = (yawDeg * Math.PI) / 180, pitch = (pitchDeg * Math.PI) / 180;
  const f = 1 / Math.tan(((fovDeg * Math.PI) / 180) / 2);
  const [ox, oy, oz] = pos ?? [0, scene.eye, 0];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let R = 0, G = 0, B = 0;
      for (let s = 0; s < 4; s++) {
        const u = ((x + (s % 2) * 0.5 + 0.25) / w) * 2 - 1;
        const v = (1 - ((y + Math.floor(s / 2) * 0.5 + 0.25) / h) * 2) * (h / w);
        let dx = u, dy = v, dz = f;
        // pitch ثم yaw
        const cy = Math.cos(pitch), sy = Math.sin(pitch);
        [dy, dz] = [dy * cy + dz * sy, -dy * sy + dz * cy];
        const cyw = Math.cos(yaw), syw = Math.sin(yaw);
        [dx, dz] = [dx * cyw + dz * syw, -dx * syw + dz * cyw];
        const l = Math.hypot(dx, dy, dz);
        const [r, g, b] = shade(scene, ox, oy, oz, dx / l, dy / l, dz / l);
        R += r; G += g; B += b;
      }
      // vignette
      const vx = x / w - 0.5, vy = y / h - 0.5;
      const vig = 1 - (vx * vx + vy * vy) * 0.9;
      const i = (y * w + x) * 3;
      buf[i] = clamp((R / 4) * vig); buf[i + 1] = clamp((G / 4) * vig); buf[i + 2] = clamp((B / 4) * vig);
    }
  }
  return buf;
}

const PW = 2048, PH = 1024;
writePng('cell-360.png', PW, PH, renderEquirect('cell', PW, PH));
writePng('corridor-360.png', PW, PH, renderEquirect('corridor', PW, PH));
writePng('cell-door.png', 1200, 800, renderPerspective('cell', 1200, 800, 0, 2, 80));
writePng('cell-window.png', 1200, 800, renderPerspective('cell', 1200, 800, 180, 14, 80));
writePng('cell-wall.png', 1200, 800, renderPerspective('cell', 1200, 800, -80, -8, 75));
writePng('corridor-view.png', 1200, 800, renderPerspective('corridor', 1200, 800, 0, 0, 70, [0, 1.6, -8]));
