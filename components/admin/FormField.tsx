// components/admin/FormField.tsx — label + control con id asociado (accesibilidad)
"use client"

import { useId, type ReactNode } from "react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface FormFieldProps {
  label: string
  children: (props: { id: string }) => ReactNode
  className?: string
}

export function FormField({ label, children, className }: FormFieldProps) {
  const id = useId()
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="text-sm font-medium leading-none">
        {label}
      </label>
      {children({ id })}
    </div>
  )
}

interface TextFieldProps extends Omit<React.ComponentProps<typeof Input>, "id"> {
  label: string
  /** Sugerencias (datalist); el valor sigue siendo libre. */
  suggestions?: readonly string[]
}

export function TextField({ label, suggestions, ...inputProps }: TextFieldProps) {
  return (
    <FormField label={label}>
      {({ id }) => (
        <>
          <Input id={id} list={suggestions ? `${id}-list` : undefined} {...inputProps} />
          {suggestions ? (
            <datalist id={`${id}-list`}>
              {suggestions.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          ) : null}
        </>
      )}
    </FormField>
  )
}
