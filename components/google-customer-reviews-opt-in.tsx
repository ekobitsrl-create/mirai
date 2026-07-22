"use client"

import Script from "next/script"
import { useCallback, useLayoutEffect, useRef } from "react"
import {
  GOOGLE_CUSTOMER_REVIEWS_MERCHANT_ID,
  type GoogleCustomerReviewOrder,
} from "@/lib/google-customer-reviews"

type SurveyOptIn = {
  render: (settings: {
    merchant_id: number
    order_id: string
    email: string
    delivery_country: string
    estimated_delivery_date: string
    products?: Array<{ gtin: string }>
  }) => void
}

declare global {
  interface Window {
    renderOptIn?: () => void
    gapi?: {
      load: (module: string, callback: () => void) => void
      surveyoptin?: SurveyOptIn
    }
  }
}

export function GoogleCustomerReviewsOptIn({ order }: { order: GoogleCustomerReviewOrder }) {
  const renderedRef = useRef(false)

  const renderOptIn = useCallback(() => {
    if (renderedRef.current || !window.gapi) return

    window.gapi.load("surveyoptin", () => {
      if (renderedRef.current || !window.gapi?.surveyoptin) return
      renderedRef.current = true

      window.gapi.surveyoptin.render({
        merchant_id: GOOGLE_CUSTOMER_REVIEWS_MERCHANT_ID,
        order_id: order.orderId,
        email: order.email,
        delivery_country: order.deliveryCountry,
        estimated_delivery_date: order.estimatedDeliveryDate,
        ...(order.products?.length ? { products: order.products } : {}),
      })
    })
  }, [order])

  useLayoutEffect(() => {
    window.renderOptIn = renderOptIn
    return () => {
      if (window.renderOptIn === renderOptIn) delete window.renderOptIn
    }
  }, [renderOptIn])

  return (
    <Script
      id="google-customer-reviews-opt-in"
      src="https://apis.google.com/js/platform.js?onload=renderOptIn"
      strategy="afterInteractive"
      async
      defer
      onReady={renderOptIn}
    />
  )
}
