import * as React from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  icon?: React.ReactNode
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, error, className, id, ...props }, ref) => {
    const generatedId = React.useId()
    const inputId = id ?? generatedId

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-label)]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-label)] [&_svg]:size-[18px]">
              {icon}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface-alt)]',
              'py-3 text-sm text-foreground placeholder:text-[var(--color-text-label)]',
              'transition-colors outline-none',
              'focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_rgba(59,93,231,0.12)]',
              icon ? 'pl-12 pr-4' : 'px-4',
              error && 'border-destructive focus:border-destructive focus:shadow-[0_0_0_3px_rgba(220,38,38,0.12)]',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
