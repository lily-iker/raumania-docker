import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FragranceCustomizerProvider } from "./context"
import Preview from "./preview"
import Controls from "./controls"
import Loading from "./loading"
import SubmitButton from "@/components/SubmitButton"

// Sample data for the fragrance customizer
const bottles = [
  {
    id: "dior-bottle",
    name: "Dior Elegance",
    description: "A sleek and sophisticated bottle design with timeless appeal",
    model: "dior" as const,
  },
  {
    id: "tomford-bottle",
    name: "Tom Ford Noir",
    description: "A bold and modern bottle with a distinctive silhouette",
    model: "tomford" as const,
  },
]

const colors = [
  {
    id: "clear",
    name: "Crystal Clear",
    color: "#e7f5ff",
    description: "Transparent elegance",
  },
  {
    id: "gold",
    name: "Luxe Gold",
    color: "#ffd700",
    description: "Opulent gold finish",
  },
  {
    id: "rose",
    name: "Rose Gold",
    color: "#f9c4d2",
    description: "Trendy rose gold tint",
  },
  {
    id: "black",
    name: "Midnight Black",
    color: "#000000",
    description: "Sophisticated darkness",
  },
]

const scents = [
  {
    id: "floral",
    name: "Floral Symphony",
    description: "A delicate blend of rose, jasmine, and lily of the valley",
    color: "#ffcad4",
  },
  {
    id: "citrus",
    name: "Citrus Burst",
    description: "Vibrant notes of lemon, bergamot, and grapefruit",
    color: "#fffaa0",
  },
  {
    id: "woody",
    name: "Woodland Mystique",
    description: "Rich cedar, sandalwood, and amber tones",
    color: "#b08968",
  },
  {
    id: "oriental",
    name: "Oriental Spice",
    description: "Exotic blend of vanilla, musk, and spices",
    color: "#9b2226",
  },
]

const caps = [
  {
    id: "classic",
    name: "Classic",
    color: "#c0c0c0",
    description: "Timeless silver finish",
  },
  {
    id: "gold",
    name: "Gold",
    color: "#ffd700",
    description: "Luxurious gold accent",
  },
  {
    id: "matte",
    name: "Matte Black",
    color: "#2a2a2a",
    description: "Modern matte finish",
  },
  {
    id: "crystal",
    name: "Crystal",
    color: "#e7f5ff",
    description: "Elegant crystal design",
  },
]

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <FragranceCustomizerProvider
        defaultBottle={bottles[0]}
        defaultColor={colors[0]}
        defaultScent={scents[0]}
        defaultCap={caps[0]}
      >
        <div className="relative aspect-square shrink-0 bg-gradient-to-r from-rose-50 to-pink-50 lg:aspect-auto lg:grow">
          <div className="absolute inset-0">
            <Preview />
          </div>

          <Link href="/" className="absolute left-6 top-6 z-10">
            <div className="text-2xl font-bold text-rose-600">Fragrance Studio</div>
          </Link>
        </div>
        <div className="grow bg-white text-black p-6 lg:w-96 lg:shrink-0 lg:grow-0 overflow-y-auto">
          <h1 className="text-2xl font-bold mb-6">Design Your Fragrance</h1>
          <Controls bottles={bottles} colors={colors} scents={scents} caps={caps} className="mb-6" />
          <SubmitButton />
        </div>
      </FragranceCustomizerProvider>
      <Loading />
    </div>
  )
}
