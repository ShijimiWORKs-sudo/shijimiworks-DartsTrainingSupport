import type { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type Size = 'md' | 'lg';

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-brand-500 text-white active:bg-brand-600',
  secondary: 'bg-ink-900/5 text-ink-900 active:bg-ink-900/10',
  ghost: 'bg-transparent text-brand-600 active:bg-brand-50',
  danger: 'bg-bad/10 text-bad active:bg-bad/20',
  success: 'bg-good/10 text-good active:bg-good/20',
};

/** Shared class builder so both <button> and <Link> can look like a BigButton. */
export function bigButtonClass(opts: { variant?: Variant; size?: Size; fullWidth?: boolean; className?: string }) {
  const { variant = 'primary', size = 'md', fullWidth, className } = opts;
  return clsx(
    'rounded-xl font-bold transition-colors select-none touch-manipulation inline-flex items-center justify-center',
    'disabled:opacity-40 disabled:pointer-events-none',
    size === 'lg' ? 'min-h-[56px] px-6 text-lg' : 'min-h-[44px] px-4 text-base',
    fullWidth && 'w-full',
    VARIANT_CLASSES[variant],
    className,
  );
}

export function BigButton({
  children,
  variant = 'primary',
  className,
  fullWidth,
  size = 'md',
  ...rest
}: {
  children: ReactNode;
  variant?: Variant;
  fullWidth?: boolean;
  size?: Size;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={bigButtonClass({ variant, size, fullWidth, className })} {...rest}>
      {children}
    </button>
  );
}
