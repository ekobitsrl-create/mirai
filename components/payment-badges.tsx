const logoClass =
  "h-auto w-auto object-contain drop-shadow-[0_0_7px_rgba(255,255,255,0.22)] transition-transform duration-300 hover:scale-105"

const paymentMethods = [
  { name: "Visa", file: "visa.webp", className: "max-h-7 max-w-[72px]" },
  { name: "Mastercard", file: "mastercard.webp", className: "max-h-8 max-w-[64px]" },
  { name: "Postepay", file: "postepay.webp", className: "max-h-7 max-w-[78px]" },
  { name: "PayPal", file: "paypal.webp", className: "max-h-9 max-w-[62px]" },
  { name: "Klarna", file: "klarna.webp", className: "max-h-8 max-w-[76px]" },
  { name: "Scalapay", file: "scalapay.webp", className: "max-h-8 max-w-[76px]" },
  { name: "Google Pay", file: "google-pay.webp", className: "max-h-8 max-w-[78px]" },
  { name: "Apple Pay", file: "apple-pay.webp", className: "max-h-8 max-w-[78px] brightness-0 invert" },
]

export function PaymentBadges() {
  return (
    <div className="flex w-full max-w-[420px] flex-wrap items-center justify-center gap-x-5 gap-y-4 md:justify-end" role="list" aria-label="Metodi di pagamento accettati">
      {paymentMethods.map((method) => (
        <div className="flex h-9 min-w-[64px] items-center justify-center" role="listitem" aria-label={method.name} key={method.name}>
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
