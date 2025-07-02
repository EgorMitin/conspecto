import { redirect } from 'next/navigation'

import { stripe } from '@/lib/stripe/stripe'
import { CheckCircle2Icon, XCircleIcon } from 'lucide-react'

export default async function Return({ searchParams }: { searchParams: { session_id: string } }) {
  const { session_id } = searchParams

  if (!session_id) {
    redirect('/')
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['line_items', 'payment_intent']
    })
    
    const status = session.status
    const customerEmail = session.customer_details?.email
    const amountTotal = session.amount_total
    const currency = session.currency

    if (status === 'open') {
      return redirect('/')
    }

    if (status === 'complete') {
      return (
        <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-card py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-border">
              <div className="text-center">
                <CheckCircle2Icon className="mx-auto h-16 w-16 text-green-500 dark:text-green-400" />
                <h1 className="mt-4 text-3xl font-bold text-foreground">
                  Payment Successful!
                </h1>
                <p className="mt-2 text-muted-foreground">
                  Thank you for your subscription to Conspecto.
                </p>
              </div>

              <div className="mt-8 border-t border-border pt-6">
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                    <dd className="text-sm text-foreground">{customerEmail}</dd>
                  </div>
                  {amountTotal && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Amount</dt>
                      <dd className="text-sm text-foreground">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: currency?.toUpperCase() || 'USD'
                        }).format(amountTotal / 100)}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              <div className="mt-6 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md p-4">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  A confirmation email has been sent to{' '}
                  <span className="font-medium">{customerEmail}</span>.
                </p>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Questions? Contact us at{' '}
                  <a
                    href="mailto:conspecto@mylocalhost.at"
                    className="font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    conspecto@mylocalhost.at
                  </a>
                </p>
              </div>

              <div className="mt-8">
                <a
                  href="/dashboard"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-colors"
                >
                  Go to Dashboard
                </a>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-card py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-border">
            <div className="text-center">
              <XCircleIcon className="mx-auto h-16 w-16 text-red-500 dark:text-red-400" />
              <h1 className="mt-4 text-3xl font-bold text-foreground">
                Payment Incomplete
              </h1>
              <p className="mt-2 text-muted-foreground">
                Your payment could not be processed. Please try again.
              </p>
              <div className="mt-6">
                <a
                  href="/pricing"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-colors"
                >
                  Try Again
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error retrieving session:', error)
    redirect('/')
  }
}