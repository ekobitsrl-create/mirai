import { cn } from "@/lib/utils"
import { MIRA_WORDMARK, MIRAI_WORDMARK } from "@/lib/brand"

type BrandMarkProps = {
  className?: string
  name?: "MIRAI" | "MIRA"
}

export function BrandMark({ className, name = "MIRAI" }: BrandMarkProps) {
  return (
    <span
      aria-label={name}
      className={cn("inline-block font-bold uppercase tracking-[0.25em]", className)}
      style={{ fontFamily: "var(--font-space-grotesk)" }}
    >
      <span aria-hidden="true">{name === "MIRA" ? MIRA_WORDMARK : MIRAI_WORDMARK}</span>
    </span>
  )
}
