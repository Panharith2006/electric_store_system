"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CreditCard, Wallet } from "lucide-react"

const paymentSchema = z.object({
  paymentMethod: z.enum(["card", "paypal"]),
  cardNumber: z.string().min(16, "Card number is required"),
  cardName: z.string().min(2, "Cardholder name is required"),
  expiryDate: z.string().regex(/^\d{2}\/\d{2}$/, "Format: MM/YY"),
  cvv: z.string().min(3, "CVV is required"),
})

type PaymentFormData = z.infer<typeof paymentSchema>

interface PaymentFormProps {
  onSubmit: (data: PaymentFormData & { cardType: string }) => void
  onBack: () => void
}

export function PaymentForm({ onSubmit, onBack }: PaymentFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentMethod: "card",
      cardNumber: "",
      cardName: "",
      expiryDate: "",
      cvv: "",
    },
  })

  const paymentMethod = watch("paymentMethod")

  const handleFormSubmit = (data: PaymentFormData) => {
    // Determine card type based on first digit
    const firstDigit = data.cardNumber[0]
    let cardType = "Card"
    if (firstDigit === "4") cardType = "Visa"
    else if (firstDigit === "5") cardType = "Mastercard"
    else if (firstDigit === "3") cardType = "Amex"

    onSubmit({ ...data, cardType })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <RadioGroup defaultValue="card" className="grid gap-4">
        <div className="flex items-center space-x-2 rounded-lg border border-border p-4">
          <RadioGroupItem value="card" id="card" {...register("paymentMethod")} />
          <Label htmlFor="card" className="flex flex-1 cursor-pointer items-center gap-2">
            <CreditCard className="h-5 w-5" />
            <span>Credit / Debit Card</span>
          </Label>
        </div>
        <div className="flex items-center space-x-2 rounded-lg border border-border p-4">
          <RadioGroupItem value="paypal" id="paypal" {...register("paymentMethod")} />
          <Label htmlFor="paypal" className="flex flex-1 cursor-pointer items-center gap-2">
            <Wallet className="h-5 w-5" />
            <span>PayPal</span>
          </Label>
        </div>
      </RadioGroup>

      {paymentMethod === "card" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <Controller
              control={control}
              name="cardNumber"
              render={({ field }) => (
                <Input id="cardNumber" {...field} placeholder="1234 5678 9012 3456" maxLength={16} />
              )}
            />
            {errors.cardNumber && <p className="text-xs text-destructive">{errors.cardNumber.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardName">Cardholder Name</Label>
            <Controller
              control={control}
              name="cardName"
              render={({ field }) => <Input id="cardName" {...field} placeholder="John Doe" />}
            />
            {errors.cardName && <p className="text-xs text-destructive">{errors.cardName.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Controller
                control={control}
                name="expiryDate"
                render={({ field }) => <Input id="expiryDate" {...field} placeholder="MM/YY" maxLength={5} />}
              />
              {errors.expiryDate && <p className="text-xs text-destructive">{errors.expiryDate.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Controller
                control={control}
                name="cvv"
                render={({ field }) => <Input id="cvv" {...field} placeholder="123" maxLength={4} />}
              />
              {errors.cvv && <p className="text-xs text-destructive">{errors.cvv.message}</p>}
            </div>
          </div>
        </div>
      )}

      {paymentMethod === "paypal" && (
        <div className="rounded-lg border border-border bg-muted/30 p-6 text-center">
          <Wallet className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">You will be redirected to PayPal to complete your payment</p>
        </div>
      )}

      <div className="flex gap-3">
        <Button type="button" variant="outline" size="lg" className="flex-1 bg-transparent" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" size="lg" className="flex-1">
          Place Order
        </Button>
      </div>
    </form>
  )
}
