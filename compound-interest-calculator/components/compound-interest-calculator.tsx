"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CopyIcon, Moon, Sun } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { ValidatedInput } from "./validated-input"
import { Switch } from "@/components/ui/switch"

interface CalculatorState {
  initialCapital: string
  periodicContribution: string
  contributionFrequency: "monthly" | "annual"
  investmentDuration: string
  durationUnit: "months" | "years"
  interestRate: string
  compoundingFrequency: "monthly"
  contributionTiming: "start" | "end"
  result: number
  dailyIncome: number
  monthlyIncome: number
  yearlyIncome: number
}

interface ValidationErrors {
  initialCapital?: string
  periodicContribution?: string
  investmentDuration?: string
  interestRate?: string
}

const defaultState: CalculatorState = {
  initialCapital: "",
  periodicContribution: "",
  contributionFrequency: "monthly",
  investmentDuration: "",
  durationUnit: "years",
  interestRate: "",
  compoundingFrequency: "monthly",
  contributionTiming: "start",
  result: 0,
  dailyIncome: 0,
  monthlyIncome: 0,
  yearlyIncome: 0,
}

export default function CompoundInterestCalculator() {
  const [state, setState] = useState<CalculatorState>(defaultState)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [darkMode, setDarkMode] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const savedState = localStorage.getItem("compoundInterestState")
    if (savedState) {
      setState(JSON.parse(savedState))
    }
    const savedDarkMode = localStorage.getItem("darkMode")
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("compoundInterestState", JSON.stringify(state))
  }, [state])

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode))
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  const handleInputChange = (field: keyof CalculatorState, value: any) => {
    setState((prev) => ({ ...prev, [field]: value }))
    validateField(field, value)
  }

  const validateField = (field: keyof CalculatorState, value: any) => {
    let error = ""
    const numValue = Number.parseFloat(value)
    switch (field) {
      case "initialCapital":
      case "periodicContribution":
        if (value !== "" && (isNaN(numValue) || numValue < 0)) {
          error = "Debe ser un número positivo o cero."
        }
        break
      case "investmentDuration":
        if (value !== "" && (isNaN(numValue) || numValue <= 0)) {
          error = "La duración debe ser mayor a 0."
        }
        break
      case "interestRate":
        if (value !== "" && (isNaN(numValue) || numValue <= 0)) {
          error = "La tasa de interés debe ser mayor a 0%."
        }
        break
    }
    setErrors((prev) => ({ ...prev, [field]: error }))
  }

  const validateAllFields = () => {
    const newErrors: ValidationErrors = {}
    const initialCapital = Number.parseFloat(state.initialCapital)
    const periodicContribution = Number.parseFloat(state.periodicContribution)
    const investmentDuration = Number.parseFloat(state.investmentDuration)
    const interestRate = Number.parseFloat(state.interestRate)

    if (state.initialCapital === "" && state.periodicContribution === "") {
      newErrors.initialCapital = "Debes ingresar un capital inicial o hacer aportes periódicos."
      newErrors.periodicContribution = "Debes ingresar un capital inicial o hacer aportes periódicos."
    } else {
      if (state.initialCapital !== "" && (isNaN(initialCapital) || initialCapital < 0)) {
        newErrors.initialCapital = "El capital inicial debe ser un número positivo o cero."
      }
      if (state.periodicContribution !== "" && (isNaN(periodicContribution) || periodicContribution < 0)) {
        newErrors.periodicContribution = "El aporte debe ser un número positivo o cero."
      }
    }

    if (state.investmentDuration === "" || isNaN(investmentDuration) || investmentDuration <= 0) {
      newErrors.investmentDuration = "La duración debe ser mayor a 0."
    }
    if (state.interestRate === "" || isNaN(interestRate) || interestRate <= 0) {
      newErrors.interestRate = "La tasa de interés debe ser mayor a 0%."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const calculateCompoundInterest = () => {
    if (!validateAllFields()) {
      setGeneralError("Por favor, revisa los campos marcados antes de calcular.")
      return
    }
    setGeneralError(null)

    let periods: number
    let rate: number
    let contribution = Number.parseFloat(state.periodicContribution) || 0
    const initialCapital = Number.parseFloat(state.initialCapital) || 0

    const duration = Number.parseFloat(state.investmentDuration)
    periods = state.durationUnit === "years" ? duration * 12 : duration
    rate = Number.parseFloat(state.interestRate) / 100 / 12

    if (state.contributionFrequency === "annual") {
      contribution = contribution / 12
    }

    let futureValue = initialCapital * Math.pow(1 + rate, periods)

    if (contribution > 0) {
      if (state.contributionTiming === "start") {
        futureValue += contribution * ((Math.pow(1 + rate, periods) - 1) / rate) * (1 + rate)
      } else {
        futureValue += contribution * ((Math.pow(1 + rate, periods) - 1) / rate)
      }
    }

    const monthlyPassiveIncome = futureValue * rate
    const yearlyPassiveIncome = monthlyPassiveIncome * 12
    const dailyPassiveIncome = yearlyPassiveIncome / 365.25

    setState((prev) => ({
      ...prev,
      result: futureValue,
      yearlyIncome: yearlyPassiveIncome,
      monthlyIncome: monthlyPassiveIncome,
      dailyIncome: dailyPassiveIncome,
    }))
  }

  const copyResultToClipboard = () => {
    navigator.clipboard.writeText(state.result.toFixed(2))
    toast({
      title: "Copiado al portapapeles",
      description: `$${state.result.toFixed(2)}`,
    })
  }

  return (
    <div className={`transition-colors duration-200 ${darkMode ? "dark" : ""}`}>
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg relative">
          <div className="absolute -top-12 right-0 flex items-center space-x-2">
            <Sun className="h-4 w-4" />
            <Switch checked={darkMode} onCheckedChange={setDarkMode} aria-label="Toggle dark mode" />
            <Moon className="h-4 w-4" />
          </div>

          <CardContent className="space-y-4 pt-6">
            <ValidatedInput
              id="initialCapital"
              label="Capital inicial"
              value={state.initialCapital}
              onChange={(value) => handleInputChange("initialCapital", value)}
              error={errors.initialCapital}
              prefix="$"
            />

            <ValidatedInput
              id="periodicContribution"
              label="Aporte periódico"
              value={state.periodicContribution}
              onChange={(value) => handleInputChange("periodicContribution", value)}
              error={errors.periodicContribution}
              prefix="$"
            />

            <div className="grid grid-cols-3 items-center gap-2">
              <Label htmlFor="contributionFrequency" className="col-span-1">
                Frecuencia de aportes:
              </Label>
              <Select
                value={state.contributionFrequency}
                onValueChange={(value) => handleInputChange("contributionFrequency", value as "monthly" | "annual")}
                className="col-span-2"
              >
                <SelectTrigger id="contributionFrequency">
                  <SelectValue placeholder="Seleccionar frecuencia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Mensual</SelectItem>
                  <SelectItem value="annual">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 items-center gap-2">
              <Label htmlFor="investmentDuration" className="col-span-1">
                Duración:
              </Label>
              <div className="col-span-2 flex gap-2">
                <ValidatedInput
                  id="investmentDuration"
                  label=""
                  value={state.investmentDuration}
                  onChange={(value) => handleInputChange("investmentDuration", value)}
                  error={errors.investmentDuration}
                />
                <Select
                  value={state.durationUnit}
                  onValueChange={(value) => handleInputChange("durationUnit", value as "months" | "years")}
                  className="w-1/2"
                >
                  <SelectTrigger id="durationUnit">
                    <SelectValue placeholder="Unidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="months">Meses</SelectItem>
                    <SelectItem value="years">Años</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <ValidatedInput
              id="interestRate"
              label="Tasa de interés"
              value={state.interestRate}
              onChange={(value) => handleInputChange("interestRate", value)}
              error={errors.interestRate}
              suffix="%"
            />

            <div className="grid grid-cols-3 items-start gap-2">
              <Label className="col-span-1 pt-2">Momento de los aportes:</Label>
              <RadioGroup
                value={state.contributionTiming}
                onValueChange={(value) => handleInputChange("contributionTiming", value as "start" | "end")}
                className="col-span-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="start" id="start" />
                  <Label htmlFor="start">Inicio del período</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="end" id="end" />
                  <Label htmlFor="end">Fin del período</Label>
                </div>
              </RadioGroup>
            </div>

            <Button onClick={calculateCompoundInterest} className="w-full mt-4">
              Calcular
            </Button>
            {generalError && <p className="text-red-500 text-sm mt-2">{generalError}</p>}
          </CardContent>

          <CardFooter className="flex flex-col items-stretch space-y-4">
            <div className="w-full">
              <Label htmlFor="futureValue" className="text-sm font-medium mb-1 block">
                Valor futuro:
              </Label>
              <div className="relative">
                <div className="bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg p-4 text-center">
                  <span className="text-3xl font-bold text-primary" id="futureValue">
                    ${state.result.toFixed(2)}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={copyResultToClipboard}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  <CopyIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-center">Ingresos Estimados</h3>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="font-medium">Diario</p>
                  <p>${state.dailyIncome.toFixed(2)}</p>
                </div>
                <div>
                  <p className="font-medium">Mensual</p>
                  <p>${state.monthlyIncome.toFixed(2)}</p>
                </div>
                <div>
                  <p className="font-medium">Anual</p>
                  <p>${state.yearlyIncome.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </CardFooter>
        </Card>
        <Toaster />
      </div>
    </div>
  )
}

