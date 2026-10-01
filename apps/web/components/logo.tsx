import Image from 'next/image';

type LogoSize = 'header' | 'hero' | 'footer' | 'admin';

const frameSizes: Record<LogoSize, string> = {
  header: 'h-[52px] w-[52px] rounded-2xl p-1 sm:h-[62px] sm:w-[62px]',
  hero: 'h-40 w-40 p-3 sm:h-48 sm:w-48',
  footer: 'h-32 w-32 p-2',
  admin: 'h-28 w-28 p-2',
};

export function Logo({
  size = 'header',
  priority = false,
  className = '',
}: {
  size?: LogoSize;
  priority?: boolean;
  className?: string;
}) {
  return (
    <span className={['brand-frame shrink-0 overflow-hidden', frameSizes[size], className].join(' ')}>
      <Image
        src="/haytan-logo.png"
        alt="شعار حيطان المعتقل"
        width={1254}
        height={1254}
        sizes={
          size === 'hero'
            ? '(max-width: 640px) 160px, 192px'
            : size === 'footer'
              ? '128px'
              : size === 'admin'
                ? '112px'
                : '(max-width: 640px) 52px, 62px'
        }
        priority={priority}
        className="h-full w-full object-contain"
      />
    </span>
  );
}
