import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'
import { LoaderCircle } from 'lucide-react'

interface AccessibleButtonProps
  extends PropsWithChildren,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  variant?: 'primary' | 'secondary' | 'danger'
  fullWidth?: boolean
  loading?: boolean
}

const variantClassMap: Record<NonNullable<AccessibleButtonProps['variant']>, string> = {
  primary: 'bg-accent text-slate-950 hover:bg-yellow-300',
  secondary: 'bg-slate-700 text-white hover:bg-slate-600',
  danger: 'bg-danger text-white hover:bg-red-500',
}

export const AccessibleButton = ({
  variant = 'secondary',
  fullWidth = false,
  loading = false,
  children,
  disabled,
  type = 'button',
  ...rest
}: AccessibleButtonProps) => (
  <button
    type={type}
    className={`focus-ring inline-flex min-h-[60px] items-center justify-center gap-3 rounded-xl border-2 border-white/40 px-6 text-[20px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variantClassMap[variant]} ${fullWidth ? 'w-full' : 'w-auto'}`}
    disabled={disabled || loading}
    {...rest}
  >
    {loading ? <LoaderCircle className="h-6 w-6 animate-spin" aria-hidden="true" /> : null}
    {children}
  </button>
)
