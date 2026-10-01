/** يُعاد إنشاؤه عند كل تنقل — انتقال ناعم بين الصفحات كما في التطبيقات. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
