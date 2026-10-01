import Link from 'next/link';
import { ArrowLeft, CalendarDays, MapPin } from 'lucide-react';
import { StatusBadge } from './status-badge';
import type { CaseItem } from '@/lib/api';

export function CaseCard({ item }: { item: CaseItem }) {
  return (
    <Link
      href={'/cases/' + item.slug}
      className="card group block min-h-full p-5 hover:-translate-y-1 hover:border-brand-100 hover:shadow-soft"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-start gap-4">
          <div className="grid h-[72px] w-[72px] shrink-0 place-items-center overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 pt-1 text-2xl font-black leading-none text-stone-400">
            {item.photoUrl ? (
              <img
                src={item.photoUrl}
                alt={'صورة ' + item.fullName}
                width={72}
                height={72}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            ) : (
              item.fullName.slice(0, 1)
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="text-lg font-black text-stone-950">{item.fullName}</h3>
              <StatusBadge status={item.status} />
            </div>
            <p className="mt-2 line-clamp-2 text-sm leading-7 text-stone-600">{item.summary}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-stone-200 pt-4 text-xs text-stone-500">
          <span className="flex items-center gap-1.5">
            <MapPin size={15} aria-hidden="true" />
            {item.region || item.detentionPlace || 'غير محدد'}
          </span>
          {item.detentionDate ? (
            <span className="flex items-center gap-1.5">
              <CalendarDays size={15} aria-hidden="true" />
              {item.detentionDate.slice(0, 10)}
            </span>
          ) : null}
          <span className="mr-auto flex items-center gap-1.5 font-extrabold text-brand-600 group-hover:text-brand-700">
            عرض التفاصيل
            <ArrowLeft size={15} aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}
