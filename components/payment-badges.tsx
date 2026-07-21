const badgeClass =
  "flex h-10 min-w-[68px] items-center justify-center rounded-lg bg-white px-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.22),0_0_18px_rgba(159,134,255,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(0,0,0,0.28),0_0_26px_rgba(159,134,255,0.2)]"

const logoClass = "h-5 w-auto max-w-[72px] object-contain"

export function PaymentBadges() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 md:justify-end" role="list" aria-label="Metodi di pagamento accettati">
      <div className={badgeClass} role="listitem" aria-label="Visa">
        <img src="/payment-logos/visa.svg" alt="Visa" className={logoClass} />
      </div>

      <div className={badgeClass} role="listitem" aria-label="Mastercard">
        <img src="/payment-logos/mastercard.svg" alt="Mastercard" className={logoClass} />
      </div>

      <div className={badgeClass} role="listitem" aria-label="Postepay">
        <img src="/payment-logos/postepay.png" alt="Postepay" className={logoClass} />
      </div>

      <div className={badgeClass} role="listitem" aria-label="PayPal">
        <img src="/payment-logos/paypal.png" alt="PayPal" className="h-[17px] w-auto max-w-[72px] object-contain" />
      </div>

      <div className={`${badgeClass} min-w-[80px] bg-[#ffb3c7] px-2 shadow-[0_8px_24px_rgba(0,0,0,0.22)]`} role="listitem" aria-label="Klarna">
        <img src="/payment-logos/klarna.svg" alt="Klarna" className="h-4 w-auto max-w-[64px] object-contain" />
      </div>

      <div className={badgeClass} role="listitem" aria-label="Scalapay">
        <img src="/payment-logos/scalapay.png" alt="Scalapay" className={logoClass} />
      </div>

      <div className={badgeClass} role="listitem" aria-label="Google Pay">
        <img src="/payment-logos/google-pay.svg" alt="Google Pay" className="h-9 w-auto max-w-[58px] object-contain" />
      </div>

      <div className={badgeClass} role="listitem" aria-label="Apple Pay">
        <img src="/payment-logos/apple-pay.svg" alt="Apple Pay" className={logoClass} />
      </div>
    </div>
  )
}
