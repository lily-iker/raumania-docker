"use client"

import { useState } from "react"
import { useFragranceCustomizer } from "./context"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

type ControlsProps = {
  bottles: Array<{
    id: string
    name: string
    description: string
    model: "dior" | "tomford"
  }>
  colors: Array<{
    id: string
    name: string
    color: string
    description: string
  }>
  scents: Array<{
    id: string
    name: string
    description: string
    color: string
  }>
  caps: Array<{
    id: string
    name: string
    color: string
    description: string
  }>
  className?: string
}

export default function Controls({ bottles, colors, scents, caps, className }: ControlsProps) {
  const {
    selectedBottle,
    setBottle,
    selectedColor,
    setColor,
    selectedScent,
    setScent,
    selectedCap,
    setCap,
    capOpen,
    setCapOpen,
    //spraying,
    setSpraying,
    activeAnimation,
    setActiveAnimation,
  } = useFragranceCustomizer()

  const [activeTab, setActiveTab] = useState("bottle")

  const handleCapClick = () => {
    if (activeAnimation) return
    setActiveAnimation("cap")
    setCapOpen(!capOpen)

    setTimeout(() => {
      setActiveAnimation(null)
    }, 1000)
  }

  const handleSprayClick = () => {
    if (activeAnimation || !capOpen) return
    setActiveAnimation("spray")
    setSpraying(true)

    setTimeout(() => {
      setSpraying(false)
      setActiveAnimation(null)
    }, 1000)
  }

  return (
    <div className={cn("space-y-6", className)}>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="bottle">Bottle</TabsTrigger>
          <TabsTrigger value="color">Color</TabsTrigger>
          <TabsTrigger value="scent">Scent</TabsTrigger>
          <TabsTrigger value="cap">Cap</TabsTrigger>
        </TabsList>

        <TabsContent value="bottle" className="space-y-4 pt-4">
          <div className="text-lg font-medium">Choose your bottle style</div>
          <RadioGroup
            value={selectedBottle?.id}
            onValueChange={(value) => {
              const bottle = bottles.find((b) => b.id === value)
              if (bottle) setBottle(bottle)
            }}
            className="grid grid-cols-1 gap-4"
          >
            {bottles.map((bottle) => (
              <Label
                key={bottle.id}
                htmlFor={`bottle-${bottle.id}`}
                className={cn(
                  "flex items-center space-x-4 rounded-lg border p-4 cursor-pointer hover:bg-accent transition-colors",
                  selectedBottle?.id === bottle.id && "border-primary bg-accent",
                )}
              >
                <RadioGroupItem id={`bottle-${bottle.id}`} value={bottle.id} className="sr-only" />
                <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center">
                  {bottle.model === "dior" ? "Dior" : "Tom Ford"}
                </div>
                <div className="space-y-1 flex-1">
                  <p className="font-medium">{bottle.name}</p>
                  <p className="text-sm text-muted-foreground">{bottle.description}</p>
                </div>
                {selectedBottle?.id === bottle.id && <Check className="h-5 w-5 text-primary" />}
              </Label>
            ))}
          </RadioGroup>
        </TabsContent>

        <TabsContent value="color" className="space-y-4 pt-4">
          <div className="text-lg font-medium">Choose your bottle color</div>
          <RadioGroup
            value={selectedColor?.id}
            onValueChange={(value) => {
              const color = colors.find((c) => c.id === value)
              if (color) setColor(color)
            }}
            className="grid grid-cols-2 gap-4"
          >
            {colors.map((color) => (
              <Label
                key={color.id}
                htmlFor={`color-${color.id}`}
                className={cn(
                  "flex flex-col items-center space-y-2 rounded-lg border p-4 cursor-pointer hover:bg-accent transition-colors",
                  selectedColor?.id === color.id && "border-primary bg-accent",
                )}
              >
                <RadioGroupItem id={`color-${color.id}`} value={color.id} className="sr-only" />
                <div className="w-12 h-12 rounded-full" style={{ backgroundColor: color.color }} />
                <div className="text-center">
                  <p className="font-medium">{color.name}</p>
                  <p className="text-xs text-muted-foreground">{color.description}</p>
                </div>
              </Label>
            ))}
          </RadioGroup>
        </TabsContent>

        <TabsContent value="scent" className="space-y-4 pt-4">
          <div className="text-lg font-medium">Choose your fragrance</div>
          <RadioGroup
            value={selectedScent?.id}
            onValueChange={(value) => {
              const scent = scents.find((s) => s.id === value)
              if (scent) setScent(scent)
            }}
            className="grid grid-cols-1 gap-4"
          >
            {scents.map((scent) => (
              <Label
                key={scent.id}
                htmlFor={`scent-${scent.id}`}
                className={cn(
                  "flex items-center space-x-4 rounded-lg border p-4 cursor-pointer hover:bg-accent transition-colors",
                  selectedScent?.id === scent.id && "border-primary bg-accent",
                )}
              >
                <RadioGroupItem id={`scent-${scent.id}`} value={scent.id} className="sr-only" />
                <div className="w-10 h-10 rounded-full" style={{ backgroundColor: scent.color }} />
                <div className="space-y-1 flex-1">
                  <p className="font-medium">{scent.name}</p>
                  <p className="text-sm text-muted-foreground">{scent.description}</p>
                </div>
                {selectedScent?.id === scent.id && <Check className="h-5 w-5 text-primary" />}
              </Label>
            ))}
          </RadioGroup>
        </TabsContent>

        <TabsContent value="cap" className="space-y-4 pt-4">
          <div className="text-lg font-medium">Choose your cap style</div>
          <RadioGroup
            value={selectedCap?.id}
            onValueChange={(value) => {
              const cap = caps.find((c) => c.id === value)
              if (cap) setCap(cap)
            }}
            className="grid grid-cols-2 gap-4"
          >
            {caps.map((cap) => (
              <Label
                key={cap.id}
                htmlFor={`cap-${cap.id}`}
                className={cn(
                  "flex flex-col items-center space-y-2 rounded-lg border p-4 cursor-pointer hover:bg-accent transition-colors",
                  selectedCap?.id === cap.id && "border-primary bg-accent",
                )}
              >
                <RadioGroupItem id={`cap-${cap.id}`} value={cap.id} className="sr-only" />
                <div className="w-12 h-12 rounded-full" style={{ backgroundColor: cap.color }} />
                <div className="text-center">
                  <p className="font-medium">{cap.name}</p>
                  <p className="text-xs text-muted-foreground">{cap.description}</p>
                </div>
              </Label>
            ))}
          </RadioGroup>
        </TabsContent>
      </Tabs>

      <div className="flex flex-col space-y-2">
        <Button onClick={handleCapClick} disabled={activeAnimation !== null}>
          {capOpen ? "Close Cap" : "Open Cap"}
        </Button>
        <Button onClick={handleSprayClick} disabled={!capOpen || activeAnimation !== null} variant="secondary">
          Spray Fragrance
        </Button>
      </div>
    </div>
  )
}
