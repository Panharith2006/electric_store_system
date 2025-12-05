import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, value, ...props }: React.ComponentProps<'input'>) {
  // Normalize undefined value -> empty string to avoid uncontrolled -> controlled warnings
  // Avoid setting `value` on file inputs (read-only) so they remain uncontrolled
  const inputProps: any = { ...props }
  // Only set a `value` prop when the caller explicitly provided one.
  // This preserves uncontrolled behavior for inputs registered via
  // `react-hook-form`'s `register`, avoiding an uncontrolled->controlled
  // transition that makes inputs non-editable.
  if (type !== "file" && value !== undefined) {
    inputProps.value = value
  }

  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        className,
      )}
      {...inputProps}
    />
  )
}

export { Input }
