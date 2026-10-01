import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.join(currentDirectory, '../..'),
  // للتجربة من الموبايل على نفس شبكة الـ Wi-Fi أثناء التطوير
  allowedDevOrigins: ['192.168.1.203', '192.168.*.*', '10.*.*.*'],
  // زر Next في وضع التطوير كان يغطي الشريط السفلي
  devIndicators: { position: 'top-left' },
  // three مثبتة داخل apps/web بينما Photo Sphere Viewer في جذر المشروع (workspaces)؛
  // نوجّه كل الاستيرادات إلى نسخة واحدة حتى تجدها الإضافات ولا تُحمَّل نسختان.
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      three$: path.join(currentDirectory, 'node_modules/three/build/three.module.js'),
      'three/examples': path.join(currentDirectory, 'node_modules/three/examples'),
    };
    return config;
  },
};

export default nextConfig;
