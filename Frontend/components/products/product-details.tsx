"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, ShoppingCart, Check, ChevronLeft, Gift, AlertCircle } from "lucide-react"
import type { Product } from "@/lib/products-data"
import { products, getAvailableColors, getAvailableStorages, getVariantByColorAndStorage } from "@/lib/products-data"
import { useFavorites } from "@/hooks/use-favorites"
import { useCart } from "@/hooks/use-cart"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { ProductCard } from "./product-card"

interface ProductDetailsProps {
  product: Product
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const [selectedImage, setSelectedImage] = useState(0)

  const availableColors = getAvailableColors(product)
  const availableStorages = getAvailableStorages(product)
  const [selectedColor, setSelectedColor] = useState<string>(availableColors[0])
  const [selectedStorage, setSelectedStorage] = useState<string>(availableStorages[0])

  const { favorites, toggleFavorite } = useFavorites()
  const isFavorite = favorites.includes(product.id)
  const { addItem } = useCart()
  const { toast } = useToast()

  const selectedVariant = getVariantByColorAndStorage(product, selectedColor, selectedStorage)
  const currentPrice = selectedVariant?.price ?? product.basePrice
  const currentOriginalPrice = selectedVariant?.originalPrice
  const isInStock = (selectedVariant?.stock ?? 0) > 0
  const stockLevel = selectedVariant?.stock ?? 0

  const relatedProducts = product.relatedProducts ? products.filter((p) => product.relatedProducts?.includes(p.id)) : []

  const displayImages =
    selectedVariant?.images && selectedVariant.images.length > 0 ? selectedVariant.images : product.images

  useEffect(() => {
    if (selectedColor && (product.category === "Smartphones" || product.category === "Laptops")) {
      setSelectedImage(0)
    }
  }, [selectedColor, product.category])

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast({
        title: "Selection required",
        description: "Please select a color and storage option.",
        variant: "destructive",
      })
      return
    }

    addItem(product, 1, selectedVariant.id)
    toast({
      title: "Added to cart",
      description: `${product.name} (${selectedStorage} - ${selectedColor}) has been added to your cart.`,
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/products" className="hover:text-foreground flex items-center gap-1">
          <ChevronLeft className="h-4 w-4" />
          Back to Products
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
            <Image
              src={displayImages[selectedImage] || "/placeholder.svg"}
              alt={`${product.name} - ${selectedColor}`}
              fill
              className="object-cover"
              priority
            />
            {currentOriginalPrice && (
              <Badge className="absolute left-4 top-4 bg-destructive text-lg px-3 py-1">
                Save ${currentOriginalPrice - currentPrice}
              </Badge>
            )}
          </div>

          {/* Thumbnail Gallery */}
          <div className="grid grid-cols-4 gap-4">
            {displayImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={cn(
                  "relative aspect-square overflow-hidden rounded-lg border-2 transition-all",
                  selectedImage === index ? "border-primary" : "border-transparent hover:border-muted-foreground",
                )}
              >
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`${product.name} view ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground">{product.brand}</p>
            <h1 className="text-3xl font-bold text-foreground mt-1">{product.name}</h1>
          </div>

          {availableColors.length > 0 && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">
                Color: <span className="text-primary">{selectedColor}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {availableColors.map((color) => {
                  const variantForColor = getVariantByColorAndStorage(product, color, selectedStorage)
                  const hasStockForColor = (variantForColor?.stock ?? 0) > 0

                  return (
                    <Button
                      key={color}
                      variant={selectedColor === color ? "default" : "outline"}
                      className={cn("min-w-[120px]", !hasStockForColor && "opacity-50")}
                      onClick={() => setSelectedColor(color)}
                      disabled={!hasStockForColor}
                    >
                      {selectedColor === color && <Check className="h-4 w-4 mr-2" />}
                      {color}
                    </Button>
                  )
                })}
              </div>
            </div>
          )}

          {availableStorages.length > 0 && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Storage</label>
              <div className="flex flex-wrap gap-2">
                {availableStorages.map((storage) => {
                  const variantForStorage = getVariantByColorAndStorage(product, selectedColor, storage)
                  const hasStockForStorage = (variantForStorage?.stock ?? 0) > 0

                  return (
                    <Button
                      key={storage}
                      variant={selectedStorage === storage ? "default" : "outline"}
                      className={cn("min-w-[100px]", !hasStockForStorage && "opacity-50 cursor-not-allowed")}
                      onClick={() => hasStockForStorage && setSelectedStorage(storage)}
                      disabled={!hasStockForStorage}
                    >
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="font-semibold">{storage}</span>
                        {variantForStorage && <span className="text-xs">${variantForStorage.price}</span>}
                      </div>
                    </Button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-foreground">${currentPrice}</span>
            {currentOriginalPrice && (
              <span className="text-xl text-muted-foreground line-through">${currentOriginalPrice}</span>
            )}
          </div>

          <div>
            {isInStock ? (
              <div className="flex items-center gap-2 text-green-600">
                <Check className="h-5 w-5" />
                <span className="font-medium">In Stock ({stockLevel} available)</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Out of Stock</span>
              </div>
            )}
          </div>

          <p className="text-muted-foreground leading-relaxed">{product.description}</p>

          {product.gifts && product.gifts.length > 0 && (
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Gift className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">What's in the box</h3>
                    <ul className="space-y-1">
                      {product.gifts.map((gift, index) => (
                        <li key={index} className="text-sm text-muted-foreground">
                          • {gift}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button size="lg" className="flex-1 gap-2" disabled={!isInStock} onClick={handleAddToCart}>
              <ShoppingCart className="h-5 w-5" />
              Add to Cart
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 bg-transparent"
              onClick={() => toggleFavorite(product.id)}
            >
              <Heart className={cn("h-5 w-5", isFavorite && "fill-destructive text-destructive")} />
              {isFavorite ? "Saved" : "Save"}
            </Button>
          </div>

          <div>
            <Badge variant="secondary" className="text-sm">
              {product.category}
            </Badge>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mt-12">
        <Tabs defaultValue="specs" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="specs">Specifications</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>

          <TabsContent value="specs" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <div key={key} className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-muted-foreground">{key}</span>
                      <span className="text-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <ul className="space-y-3">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-foreground mb-6">You might also like</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
