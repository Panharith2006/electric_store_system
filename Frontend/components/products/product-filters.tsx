"use client"

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ProductFiltersProps {
  categories: string[]
  brands: string[]
  selectedCategory: string
  setSelectedCategory: (category: string) => void
  selectedBrand: string
  setSelectedBrand: (brand: string) => void
  priceRange: number[]
  setPriceRange: (range: number[]) => void
  sortBy: string
  setSortBy: (sort: string) => void
  showInStockOnly: boolean
  setShowInStockOnly: (show: boolean) => void
}

export function ProductFilters({
  categories,
  brands,
  selectedCategory,
  setSelectedCategory,
  selectedBrand,
  setSelectedBrand,
  priceRange,
  setPriceRange,
  sortBy,
  setSortBy,
  showInStockOnly,
  setShowInStockOnly,
}: ProductFiltersProps) {
  return (
    <div className="space-y-6">
      {/* Sort By */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sort By</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="name">Name: A to Z</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Category Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Category</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedCategory} onValueChange={setSelectedCategory}>
            {categories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <RadioGroupItem value={category} id={category} />
                <Label htmlFor={category} className="cursor-pointer font-normal">
                  {category}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Brand Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Brand</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedBrand} onValueChange={setSelectedBrand}>
            {brands.map((brand) => (
              <div key={brand} className="flex items-center space-x-2">
                <RadioGroupItem value={brand} id={brand} />
                <Label htmlFor={brand} className="cursor-pointer font-normal">
                  {brand}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Price Range */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Price Range</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Slider min={0} max={5000} step={100} value={priceRange} onValueChange={setPriceRange} className="w-full" />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </CardContent>
      </Card>

      {/* Stock Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="in-stock" className="cursor-pointer font-normal">
              In Stock Only
            </Label>
            <Switch id="in-stock" checked={showInStockOnly} onCheckedChange={setShowInStockOnly} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
