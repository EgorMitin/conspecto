import { ProductWithPrice } from "./types/Subscription";

export const PRODUCTS: ProductWithPrice[] = [
  {
    id: "1",
    name: 'Pro',
    description: 'Upgrade to Pro for more features',
    prices: [
      {
        id: 'price_1Hh1Y2L4z8k8k8k8k8k8k8k',
        unitAmount: 888,
        currency: 'usd',
        interval: 'month',
      },
      {
        id: 'price_1Hh1Y2L4z8k8k8k8k8k8k9',
        unitAmount: 9999,
        currency: 'usd',
        interval: 'year',
      },
    ], // $8.88
  },
]