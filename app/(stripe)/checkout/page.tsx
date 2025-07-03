import Checkout from "@/components/checkout"

export default function Page({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const priceId = searchParams["priceId"] as string
  return (
    <div id="checkout">
      <Checkout priceId={priceId} />
    </div>
  )
}