"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const promotions = [
  {
    id: 1,
    title: "iPhone 17 Pro Max",
    subtitle: "Save $100 on all storage options",
    image: "/iPhone-17-Pro-Max-release-date-price-and-features.jpg?height=400&width=1200",
    link: "/products/1",
    bgColor: "from-blue-600 to-purple-600",
  },
  {
    id: 2,
    title: "M4 MacBook Pro Thumb 2",
    subtitle: "The most powerful MacBook Pro ever",
    image: "/M4-MacBook-Pro-Thumb-2.jpg?height=400&width=1200",
    link: "/products/3",
    bgColor: "from-gray-800 to-gray-600",
  },
  {
    id: 3,
    title: "Sony WH-1000XM5",
    subtitle: "Industry-leading noise cancellation",
    image: "/Sony-WH-1000XM4-Leak.jpg?height=400&width=1200",
    link: "/products/5",
    bgColor: "from-orange-600 to-red-600",
  },
]

export function PromotionalSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % promotions.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % promotions.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + promotions.length) % promotions.length)
  }

  return (
    <div className="relative mb-8 rounded-xl overflow-hidden">
      <div className="relative h-[300px] md:h-[400px]">
        {promotions.map((promo, index) => (
          <Link
            key={promo.id}
            href={promo.link}
            className={cn(
              "absolute inset-0 transition-opacity duration-500",
              index === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none",
            )}
          >
            <div className={cn("absolute inset-0 bg-gradient-to-r", promo.bgColor)} />
            <div className="relative h-full flex items-center justify-between container mx-auto px-8">
              <div className="text-white max-w-xl">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">{promo.title}</h2>
                <p className="text-xl md:text-2xl mb-6 text-white/90">{promo.subtitle}</p>
                <Button size="lg" variant="secondary">
                  Shop Now
                </Button>
              </div>
              <div className="hidden md:block relative w-[400px] h-[300px]">
                <Image src={promo.image || "/placeholder.svg"} alt={promo.title} fill className="object-contain" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Navigation Buttons */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white"
        onClick={(e) => {
          e.preventDefault()
          prevSlide()
        }}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white"
        onClick={(e) => {
          e.preventDefault()
          nextSlide()
        }}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {promotions.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              index === currentSlide ? "bg-white w-8" : "bg-white/50",
            )}
          />
        ))}
      </div>
    </div>
  )
}
