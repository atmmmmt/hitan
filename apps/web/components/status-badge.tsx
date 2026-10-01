export const labels: Record<string, string> = {
  detained: 'معتقل',
  missing: 'مفقود',
  released: 'مفرج عنه',
  unknown: 'غير معروف',
};

export function StatusBadge({ status }: { status: string }) {
  const className =
    status === 'detained'
      ? 'border-red-200 bg-red-50 text-red-800'
      : status === 'missing'
        ? 'border-amber-200 bg-amber-50 text-amber-800'
        : status === 'released'
          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
          : 'border-stone-200 bg-stone-100 text-stone-700';

  return (
    <span className={['badge border', className].join(' ')}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {labels[status] || status}
    </span>
  );
}
