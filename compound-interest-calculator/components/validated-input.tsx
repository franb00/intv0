import type React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AlertCircle } from "lucide-react"

interface ValidatedInputProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  type?: "number" | "text"
  min?: number
  step?: number
  prefix?: string
  suffix?: string
}

export function ValidatedInput({
  id,
  label,
  value,
  onChange,
  error,
  type = "number",
  min,
  step,
  prefix,
  suffix,
}: ValidatedInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value
    if (type === "number" && newValue !== "") {
      // Eliminar ceros iniciales para números enteros
      newValue = newValue.replace(/^0+(?=\d)/, "")
      // Permitir un solo cero si es el único dígito
      if (newValue === "") newValue = "0"
      // Manejar números decimales
      if (newValue.includes(".")) {
        const [integer, decimal] = newValue.split(".")
        newValue = `${Number.parseInt(integer)}.${decimal}`
      }
    }
    onChange(newValue)
  }

  return (
    <div className="grid grid-cols-3 items-center gap-2">
      <Label htmlFor={id} className="col-span-1">
        {label}
      </Label>
      <div className="col-span-2 flex items-center">
        {prefix && <span className="mr-2">{prefix}</span>}
        <div className="relative flex-grow">
          <Input
            id={id}
            type={type}
            min={min}
            step={step}
            value={value}
            onChange={handleChange}
            className={`w-full ${error ? "border-red-500" : ""}`}
          />
          {error && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertCircle className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{error}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        {suffix && <span className="ml-2">{suffix}</span>}
      </div>
    </div>
  )
}

