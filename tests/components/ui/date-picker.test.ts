import { describe, it, expect } from "vitest"
import { DatePicker } from "@/components/ui/date-picker"

describe("DatePicker", () => {
  it("accepts value: undefined without a type error and exposes a placeholder prop", () => {
    // This is primarily a type-level regression test (DatePickerProps.value
    // must accept Date | undefined) — see specs/010-socio-historico-tablas.
    const props: React.ComponentProps<typeof DatePicker> = {
      value: undefined,
      onValueChange: () => {},
      placeholder: "Seleccionar fecha",
    }
    expect(props.value).toBeUndefined()
    expect(props.placeholder).toBe("Seleccionar fecha")
  })

  it("still accepts a defined Date for value (regression)", () => {
    const props: React.ComponentProps<typeof DatePicker> = {
      value: new Date("2026-01-01"),
      onValueChange: () => {},
    }
    expect(props.value).toBeInstanceOf(Date)
  })
})
