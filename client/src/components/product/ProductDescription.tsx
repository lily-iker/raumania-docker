"use client"

import { useState } from "react"
import { Bounded } from "@/components/Bounded"
import { Heading } from "@/components/Heading"

import { HorizontalLine } from "@/components/Line"
import { SlideIn } from "../ProductGrid/SlideIn"
import { Scribble } from "./Scribble"

interface ProductDescriptionProps {
  name: string
  description?: string
  productMaterial?: string
  inspiration?: string
  usageInstructions?: string
}

export function ProductDescription({
  name,
  description,
  productMaterial,
  inspiration,
  usageInstructions,
}: ProductDescriptionProps) {
  const [activeTab, setActiveTab] = useState<string>("description")

  // If no description data is available, don't render the component
  if (!description && !productMaterial && !inspiration && !usageInstructions) {
    return null
  }

  const tabs = [
    { id: "description", label: "Description", content: description },
    { id: "materials", label: "Materials", content: productMaterial },
    { id: "inspiration", label: "Inspiration", content: inspiration },
    { id: "usage", label: "How to Use", content: usageInstructions },
  ].filter((tab) => tab.content) // Only show tabs with content

  return (
    <Bounded className="bg-white py-16 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -right-20 top-10 opacity-5 rotate-45 w-64 h-64">
        <Scribble color="#000" />
      </div>
      <div className="absolute -left-20 bottom-10 opacity-5 -rotate-45 w-64 h-64">
        <Scribble color="#000" />
      </div>

      <div className="max-w-3xl mx-auto relative">
        <SlideIn>
          <Heading as="h2" size="md" className="mb-8 text-center">
            PRODUCT DETAILS
          </Heading>
        </SlideIn>

        <SlideIn delay={0.1}>
          <div className="flex justify-center mb-8 border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-medium text-sm uppercase tracking-wider transition-colors relative ${
                  activeTab === tab.id
                    ? "text-black after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-black"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </SlideIn>

        <SlideIn delay={0.2}>
          <div className="prose prose-lg max-w-none">
            {tabs.map(
              (tab) =>
                activeTab === tab.id && (
                  <div key={tab.id} className="animate-fadeIn">
                    <p className="text-lg leading-relaxed text-gray-700 font-light">{tab.content}</p>
                  </div>
                ),
            )}
          </div>
        </SlideIn>

        <SlideIn delay={0.3}>
          <div className="mt-12">
            <HorizontalLine className="stroke-2 text-stone-300" />
            <div className="mt-8 bg-brand-cream p-6 rounded-lg">
              <h3 className="text-xl font-serif mb-4">{name} Experience</h3>
              <p className="text-gray-700">
                Each {name} fragrance is carefully crafted to provide a unique sensory experience. Our perfumers blend
                the finest ingredients to create scents that evoke emotions and memories.
              </p>
            </div>
          </div>
        </SlideIn>
      </div>
    </Bounded>
  )
}
