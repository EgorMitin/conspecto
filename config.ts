import { ProductWithPrice } from "./types/Subscriptions";

export const PRODUCTS: ProductWithPrice[] = [
  {
    id: "1",
    name: 'Pro',
    active: true,
    description: 'Upgrade to Pro for more features',
    prices: [
      {
        id: 'price_1RgpS4AwejZpHiKnOarBTHqr',
        productId: 'prod_Sc34jWZUBQyOi9', // 'prod_SbhyXcST5IkiAZ',
        unitAmount: 888,
        currency: 'usd',
        active: true,
        type: 'recurring',
        interval: 'month',
      },
      {
        id: 'price_1RgpSOAwejZpHiKngcd3GxIL',
        productId: 'prod_SbhyXcST5IkiAZ',
        unitAmount: 8888,
        currency: 'usd',
        active: true,
        type: 'recurring',
        interval: 'year',
      },
    ],
  },
]