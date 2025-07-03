'use client'

import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { redirect, useSearchParams } from 'next/navigation'

import { fetchClientSecret } from '@/lib/stripe/client_actions'
import { toast } from 'sonner'

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw Error("Stripe publishable key is not implemented.")
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

export default function Checkout() {
  const searchParams = useSearchParams()
  const priceId = searchParams.get('priceId')

  const fetchClientSecretWithPrice = async () => {
    if (!priceId) {
      toast.error("This price option is not implemented")
      redirect("/dashboard")
    }
    return fetchClientSecret(priceId)
  }
  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{ fetchClientSecret: fetchClientSecretWithPrice }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}