// components/ui/date-picker.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { formatChartDayPicker } from "@/lib/chart-day-format"
import { cn } from "@/lib/utils"
import { CalendarIcon, ChevronDownIcon } from "lucide-react"

export interface DatePickerProps {
  value: Date | undefined
  onValueChange: (date: Date) => void
  /** Fechas deshabilitadas en el calendario. */
  disabled?: (date: Date) => boolean
  /** Formato del label en el trigger. */
  formatLabel?: (date: Date) => string
  /** Texto del trigger cuando `value` es `undefined` (sin selección aún). */
  placeholder?: string
  className?: string
  align?: "start" | "center" | "end"
}

export function DatePicker({
  value,
  onValueChange,
  disabled,
  formatLabel = formatChartDayPicker,
  placeholder = "Seleccionar fecha",
  className,
  align = "start",
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "h-8 justify-start gap-2 px-2.5 text-base font-normal shadow-xs",
            className
          )}
        >
          <CalendarIcon className="size-4 text-muted-foreground" aria-hidden />
          {value ? formatLabel(value) : placeholder}
          <ChevronDownIcon
            className="ml-auto size-4 text-muted-foreground"
            aria-hidden
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align={align}>
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => {
            if (date) onValueChange(date)
          }}
          disabled={disabled}
        />
      </PopoverContent>
    </Popover>
  )
}
