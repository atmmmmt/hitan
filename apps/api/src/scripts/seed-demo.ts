import 'dotenv/config';
import { connectDb } from '../lib/db.js';
import { FacilityModel } from '../models/Facility.js';
import { CaseModel } from '../models/Case.js';

async function main() {
  await connectDb();

  await FacilityModel.deleteMany({});
  // الصور والبانوراما في apps/web/public/demo مولّدة بـ gen-demo-panoramas.mjs — إعادة بناء تجريبية فقط
  const demoSource = 'إعادة بناء تجريبية مولّدة حاسوبياً — ليست صورة حقيقية';
  await FacilityModel.insertMany([
    {
      name: 'سجن صيدنايا',
      slug: 'saydnaya',
      region: 'ريف دمشق',
      description: 'سجل تجريبي لأغراض العرض فقط.',
      history:
        'هذا نص تجريبي يوضح مكان عرض الخلفية التاريخية للمكان: متى أُنشئ، الجهة المسؤولة عنه، وشهادات موثقة عن ظروف الاحتجاز.\n\nاستبدل هذا النص ببيانات موثقة مع ذكر المصادر.',
      coverUrl: '/demo/corridor-view.png',
      images: [
        { url: '/demo/corridor-view.png', caption: 'ممر الزنازين', source: demoSource, kind: 'reconstruction' },
        { url: '/demo/cell-door.png', caption: 'باب الزنزانة الحديدي وفتحة المراقبة', source: demoSource, kind: 'reconstruction' },
        { url: '/demo/cell-window.png', caption: 'النافذة العلوية الوحيدة', source: demoSource, kind: 'reconstruction' },
        { url: '/demo/cell-wall.png', caption: 'جدار الزنزانة', source: demoSource, kind: 'reconstruction' },
      ],
      rooms: [
        {
          key: 'corridor',
          name: 'ممر الزنازين',
          description: 'ممر ضيق تصطف على جانبيه أبواب الزنازين.',
          panoramaUrl: '/demo/corridor-360.png',
          kind: 'reconstruction',
          source: demoSource,
          links: [{ to: 'cell', yaw: 90, pitch: -12 }],
          info: [{ yaw: 0, pitch: 8, title: 'الإضاءة', text: 'مصابيح خافتة متباعدة على طول الممر.' }],
        },
        {
          key: 'cell',
          name: 'زنزانة منفردة',
          description: 'زنزانة بمساحة تقارب ٢٫٦ × ٣٫٢ م، بباب حديدي ونافذة علوية صغيرة.',
          panoramaUrl: '/demo/cell-360.png',
          kind: 'reconstruction',
          source: demoSource,
          links: [{ to: 'corridor', yaw: 0, pitch: -12 }],
          info: [
            { yaw: 180, pitch: 22, title: 'النافذة', text: 'فتحة صغيرة عالية بقضبان، مصدر الضوء الطبيعي الوحيد.' },
            { yaw: -90, pitch: -5, title: 'عدّ الأيام', text: 'خطوط محفورة على الجدار لعدّ الأيام.' },
          ],
        },
      ],
    },
    {
      name: 'فرع أمني - مثال',
      slug: 'branch-example',
      region: 'دمشق',
      description: 'اسم تجريبي قابل للاستبدال ببيانات موثقة.',
    },
  ]);

  await CaseModel.deleteMany({});
  await CaseModel.insertMany([
    {
      fullName: 'حالة تجريبية أولى',
      slug: 'demo-case-1',
      region: 'دمشق',
      detentionPlace: 'سجن صيدنايا',
      status: 'detained',
      summary: 'هذه حالة تجريبية لعرض واجهة المنصة ولا تمثل شخصاً حقيقياً.',
      moderationStatus: 'approved',
      publishedAt: new Date(),
    },
    {
      fullName: 'طلب بانتظار المراجعة',
      slug: 'demo-pending',
      region: 'حلب',
      status: 'missing',
      summary: 'مثال على حالة لا تظهر للعامة حتى تقبلها الإدارة.',
      moderationStatus: 'pending',
      submitterName: 'مبلّغ تجريبي',
      submitterContact: 'private@example.com',
    },
  ]);

  console.log('Demo data ready');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
