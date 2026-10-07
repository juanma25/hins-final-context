// components/admin/SelectField.tsx — <select> nativo con el estilo de ui/input
"use client"

import { FormField } from "@/components/admin/FormField"
import type { SelectOption } from "@/lib/admin-options"
import { cn } from "@/lib/utils"

interface SelectFieldProps extends Omit<React.ComponentProps<"select">, "id" | "onChange"> {
  label: string
  options: readonly SelectOption[]
  placeholder?: string
  onValueChange: (value: string) => void
}

export const SELECT_CLASSNAME =
  "h-8 w-full min-w-0 rounded-md border border-input bg-transparent px-2 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"

export function SelectField({
  label,
  options,
  placeholder = "Seleccionar...",
  onValueChange,
  className,
  ...selectProps
}: SelectFieldProps) {
  return (
    <FormField label={label}>
      {({ id }) => (
        <select
          id={id}
          className={cn(SELECT_CLASSNAME, className)}
          onChange={(e) => onValueChange(e.target.value)}
          {...selectProps}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </FormField>
  )
}
