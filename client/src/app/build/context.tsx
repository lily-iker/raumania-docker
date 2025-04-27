"use client"

import { createContext, type ReactNode, useContext, useMemo, useState } from "react"

// Define the types for our fragrance options
export type FragranceBottle = {
  id: string
  name: string
  description: string
  model: "dior" | "tomford"
}

export type FragranceColor = {
  id: string
  name: string
  color: string
  description: string
}

export type FragranceScent = {
  id: string
  name: string
  description: string
  color: string
}

export type FragranceCap = {
  id: string
  name: string
  color: string
  description: string
}

// Define the context type
type FragranceCustomizerContext = {
  selectedBottle?: FragranceBottle
  setBottle: (bottle: FragranceBottle) => void
  selectedColor?: FragranceColor
  setColor: (color: FragranceColor) => void
  selectedScent?: FragranceScent
  setScent: (scent: FragranceScent) => void
  selectedCap?: FragranceCap
  setCap: (cap: FragranceCap) => void
  capOpen: boolean
  setCapOpen: (open: boolean) => void
  spraying: boolean
  setSpraying: (spraying: boolean) => void
  activeAnimation: string | null
  setActiveAnimation: (animation: string | null) => void
}

// Create the context with default values
const defaultContext: FragranceCustomizerContext = {
  setBottle: () => {},
  setColor: () => {},
  setScent: () => {},
  setCap: () => {},
  capOpen: false,
  setCapOpen: () => {},
  spraying: false,
  setSpraying: () => {},
  activeAnimation: null,
  setActiveAnimation: () => {},
}

const FragranceCustomizerContext = createContext(defaultContext)

// Define the props for the provider
type FragranceCustomizerProviderProps = {
  defaultBottle?: FragranceBottle
  defaultColor?: FragranceColor
  defaultScent?: FragranceScent
  defaultCap?: FragranceCap
  children?: ReactNode
}

// Create the provider component
export function FragranceCustomizerProvider({
  defaultBottle,
  defaultColor,
  defaultScent,
  defaultCap,
  children,
}: FragranceCustomizerProviderProps) {
  const [selectedBottle, setBottle] = useState(defaultBottle)
  const [selectedColor, setColor] = useState(defaultColor)
  const [selectedScent, setScent] = useState(defaultScent)
  const [selectedCap, setCap] = useState(defaultCap)
  const [capOpen, setCapOpen] = useState(false)
  const [spraying, setSpraying] = useState(false)
  const [activeAnimation, setActiveAnimation] = useState<string | null>(null)

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => {
    return {
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
      spraying,
      setSpraying,
      activeAnimation,
      setActiveAnimation,
    }
  }, [selectedBottle, selectedColor, selectedScent, selectedCap, capOpen, spraying, activeAnimation])

  return <FragranceCustomizerContext.Provider value={value}>{children}</FragranceCustomizerContext.Provider>
}

// Create a hook to use the context
export function useFragranceCustomizer() {
  return useContext(FragranceCustomizerContext)
}
