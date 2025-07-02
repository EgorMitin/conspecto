import 'server-only'

import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw Error("Strype secret key is required")
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)