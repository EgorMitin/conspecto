'use server'

import { headers } from 'next/headers'

import { stripe } from './stripe'
import { getCurrentUser } from '../auth/auth'
import { createOrRetrieveCustomer } from './admin_actions'

export async function fetchClientSecret(priceId: string) {
  const origin = (await headers()).get('origin')
  const user = await getCurrentUser();
  if (!user) throw Error("User is required");
  const customer = await createOrRetrieveCustomer({
    email: user.email,
    uuid: user.id
  })

  const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded',
    customer,
    // redirect_on_completion: 'if_required',
    billing_address_collection: 'required',

    line_items: [
      {
        price: priceId,
        quantity: 1
      }
    ],
    mode: 'subscription',
    return_url: `${origin}/return?session_id={CHECKOUT_SESSION_ID}`,
  })
  if (!session.client_secret) {
    throw Error("session.client_secret is underfined")
  }

  return session.client_secret
}