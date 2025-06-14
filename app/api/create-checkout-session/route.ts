import { getCurrentUser } from '@/lib/auth/auth';
import { stripe } from '@/lib/stripe';
import { createOrRetrieveCustomer } from '@/lib/stripe/admin';
import { getURL } from '@/utils/global';

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { price, quantity = 1, metadata = {} } = await request.json();
  try {
    const user = await getCurrentUser();

    const customer = await createOrRetrieveCustomer({
      email: user?.email || '',
      uuid: user?.id || '',
    });
    const session = await stripe.checkout.sessions.create({
      //@ts-ignore
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      customer,
      line_items: [
        {
          price: price.id,
          quantity,
        },
      ],
      mode: 'subscription',
      allow_promotion_codes: true,
      subscription_data: { trial_from_plan: true, metadata },
      success_url: `${getURL()}/dashboard`,
      cancel_url: `${getURL()}/dashboard`,
    });
    return NextResponse.json({ sessionId: session.id });
  } catch (error: any) {
    console.log(error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
