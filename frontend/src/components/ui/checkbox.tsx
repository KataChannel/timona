"use client"

import * as React from "react"

const Checkbox = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    indeterminate?: boolean
    onCheckedChange?: (checked: boolean) => void
  }
>(({ className, indeterminate, onCheckedChange, ...props }, ref) => {
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useImperativeHandle(ref, () => inputRef.current!)

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = !!indeterminate
    }
  }, [indeterminate])

  return (
    <input
      type="checkbox"
      ref={inputRef}
      className={`h-4 w-4 rounded border border-gray-300 text-blue-600 focus:ring-blue-500 ${className || ''}`}
      onChange={(e) => {
        onCheckedChange?.(e.target.checked)
        props.onChange?.(e)
      }}
      {...props}
    />
  )
})

Checkbox.displayName = "Checkbox"

export { Checkbox }