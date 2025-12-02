import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

const baseStyles = 'relative inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent';

const variantMap: Record<ButtonVariant, string> = {
  primary:
    'text-white px-6 py-3 rounded-full shadow-[0_20px_45px_rgba(18,86,212,0.25)] bg-[length:200%_auto] bg-aurora hover:shadow-[0_25px_55px_rgba(18,86,212,0.35)] hover:scale-[1.01] focus-visible:ring-white',
  secondary:
    'px-6 py-3 rounded-full text-[var(--brand-primary)] border border-white/40 bg-white/80 backdrop-blur-2xl hover:border-white hover:bg-white focus-visible:ring-white/80',
  ghost:
    'px-5 py-2.5 rounded-full text-white/90 border border-white/25 hover:border-white hover:text-white focus-visible:ring-white/50',
};

export const buttonClasses = (variant: ButtonVariant = 'primary', extra?: string) =>
  [baseStyles, variantMap[variant], extra].filter(Boolean).join(' ');

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: ReactNode;
}

export function BrandButton({ variant = 'primary', icon, className = '', children, ...props }: ButtonProps) {
  return (
    <button className={buttonClasses(variant, className)} {...props}>
      {children}
      {icon && <span className="text-lg" aria-hidden="true">{icon}</span>}
    </button>
  );
}
