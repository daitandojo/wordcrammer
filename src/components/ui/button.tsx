import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { Loader2 } from 'lucide-react'

const variants = {
  primary: 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 active:scale-[0.97]',
  secondary: 'glass glass-hover text-slate-200 hover:text-white active:scale-[0.97]',
  outline: 'border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white active:scale-[0.97]',
  ghost: 'text-slate-400 hover:text-white hover:bg-white/5 active:scale-[0.97]',
  danger: 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20 active:scale-[0.97]',
  success: 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-600/20 active:scale-[0.97]',
  xp: 'bg-yellow-600 hover:bg-yellow-500 text-white shadow-lg shadow-yellow-600/20 active:scale-[0.97]',
}

const sizes = {
  xs: 'px-2 py-1 text-xs rounded-md',
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-6 py-2.5 text-base rounded-lg',
  xl: 'px-8 py-3 text-lg rounded-xl',
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, className = '', disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  )
)
Button.displayName = 'Button'
