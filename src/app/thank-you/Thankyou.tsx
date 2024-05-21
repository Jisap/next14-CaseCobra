"use client"

import { useSearchParams } from "next/navigation"

const Thankyou = () => {

  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId') || ''

  return (
    <div>Thankyou</div>
  )
}

export default Thankyou