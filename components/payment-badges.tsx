const badgeClass =
  "flex h-9 min-w-[62px] items-center justify-center rounded-lg bg-white px-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.22),0_0_18px_rgba(159,134,255,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(0,0,0,0.28),0_0_26px_rgba(159,134,255,0.2)]"

const logoClass = "h-5 w-auto"

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
        <span className="text-[12px] font-black italic tracking-[-0.04em] text-[#114f9b]">postepay</span>
      </div>

      <div className={badgeClass} role="listitem" aria-label="PayPal">
        <img src="/payment-logos/paypal.svg" alt="PayPal" className={logoClass} />
      </div>

      <div className={badgeClass} role="listitem" aria-label="Klarna">
        <img src="/payment-logos/klarna.svg" alt="Klarna" className={logoClass} />
      </div>

      <div className={badgeClass} role="listitem" aria-label="Scalapay">
        <span className="text-[12px] font-black tracking-[-0.04em] text-[#17120f]">scalapay</span>
      </div>

      <div className={badgeClass} role="listitem" aria-label="Google Pay">
        <img src="/payment-logos/google-pay.svg" alt="Google Pay" className={logoClass} />
      </div>

      <div className={badgeClass} role="listitem" aria-label="Apple Pay">
        <img src="/payment-logos/apple-pay.svg" alt="Apple Pay" className={logoClass} />
      </div>
    </div>
  )
}
