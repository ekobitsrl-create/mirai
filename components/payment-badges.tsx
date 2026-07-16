const badgeClass =
  "flex h-9 min-w-[62px] items-center justify-center rounded-md border border-white/10 bg-white px-2.5 shadow-sm"

export function PaymentBadges() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 md:justify-end" role="list" aria-label="Metodi di pagamento accettati">
      <div className={badgeClass} role="listitem" aria-label="Visa">
        <span className="text-[15px] font-black italic tracking-[-0.08em] text-[#1a1f71]">VISA</span>
      </div>

      <div className={badgeClass} role="listitem" aria-label="Mastercard">
        <span className="relative mr-1.5 h-5 w-8">
          <span className="absolute left-0 top-0.5 h-4 w-4 rounded-full bg-[#eb001b]" />
          <span className="absolute right-0 top-0.5 h-4 w-4 rounded-full bg-[#f79e1b] opacity-95" />
        </span>
        <span className="text-[8px] font-bold tracking-tight text-[#1f1f1f]">mastercard</span>
      </div>

      <div className={`${badgeClass} bg-[#ffdf00]`} role="listitem" aria-label="Postepay">
        <span className="text-[12px] font-black italic tracking-[-0.04em] text-[#114f9b]">postepay</span>
      </div>

      <div className={badgeClass} role="listitem" aria-label="PayPal">
        <span className="text-[13px] font-black italic tracking-[-0.04em] text-[#003087]">Pay</span>
        <span className="text-[13px] font-black italic tracking-[-0.04em] text-[#009cde]">Pal</span>
      </div>

      <div className={`${badgeClass} bg-[#ffb3c7]`} role="listitem" aria-label="Klarna">
        <span className="text-[13px] font-black tracking-[-0.04em] text-[#17120f]">Klarna.</span>
      </div>

      <div className={`${badgeClass} bg-[#f1c4df]`} role="listitem" aria-label="Scalapay">
        <span className="text-[12px] font-black tracking-[-0.04em] text-[#17120f]">scalapay</span>
      </div>

      <div className={badgeClass} role="listitem" aria-label="Google Pay">
        <span className="mr-1 text-[14px] font-bold">
          <span className="text-[#4285f4]">G</span>
        </span>
        <span className="text-[12px] font-semibold text-[#3c4043]">Pay</span>
      </div>

      <div className={badgeClass} role="listitem" aria-label="Apple Pay">
        <span className="text-[12px] font-semibold tracking-[-0.04em] text-black">Apple Pay</span>
      </div>
    </div>
  )
}
