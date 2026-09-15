import type { ReactNode } from 'react';
import clsx from 'clsx';

export function Card({
  children,
  className,
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div
      className={clsx(
        'rounded-2xl bg-white shadow-card border border-black/[0.04]',
        padded && 'p-4 sm:p-5',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-sm font-bold tracking-wide text-ink-900/70 uppercase">{children}</h2>
      {action}
    </div>
  );
}
