const badgeClass =
  "flex h-10 min-w-0 items-center justify-center rounded-lg bg-white px-2 shadow-[0_8px_24px_rgba(0,0,0,0.22),0_0_18px_rgba(159,134,255,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(0,0,0,0.28),0_0_26px_rgba(159,134,255,0.2)]"

const logoClass = "max-h-6 w-auto max-w-[62px] object-contain"

const paymentMethods = [
  { name: "Visa", file: "visa.webp", className: "max-h-6 max-w-[58px]" },
  { name: "Mastercard", file: "mastercard.webp", className: "max-h-7 max-w-[58px]" },
  { name: "Postepay", file: "postepay.webp", className: "max-h-6 max-w-[62px]" },
  { name: "PayPal", file: "paypal.webp", className: "max-h-7 max-w-[60px]" },
  { name: "Klarna", file: "klarna.webp", className: "max-h-7 max-w-[62px]" },
  { name: "Scalapay", file: "scalapay.webp", className: "max-h-7 max-w-[62px]" },
  { name: "Google Pay", file: "google-pay.webp", className: "max-h-6 max-w-[62px]" },
  { name: "Apple Pay", file: "apple-pay.webp", className: "max-h-6 max-w-[62px]" },
]

export function PaymentBadges() {
  return (
    <div className="grid w-full max-w-[344px] grid-cols-4 gap-2" role="list" aria-label="Metodi di pagamento accettati">
      {paymentMethods.map((method) => (
        <div className={badgeClass} role="listitem" aria-label={method.name} key={method.name}>
          <img
            src={`/payment-logos/${method.file}`}
            alt={method.name}
            className={`${logoClass} ${method.className}`}
            loading="lazy"
            decoding="async"
          />
        </div>
      ))}
    </div>
  )
}
