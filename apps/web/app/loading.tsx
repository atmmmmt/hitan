export default function Loading() {
  return (
    <div className="route-loader" role="status" aria-live="polite">
      <div className="route-loader__bar" aria-hidden="true" />
      <div className="route-loader__center">
        <span className="route-loader__mark" aria-hidden="true" />
        <p className="font-display text-sm font-semibold text-stone-600">جارٍ التحميل…</p>
      </div>
    </div>
  );
}
