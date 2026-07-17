"use client"

import { Truck, Shield, RefreshCw, Headphones } from "lucide-react"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { useLanguage } from "@/lib/language-context"

const featureIcons = [Truck, Shield, RefreshCw, Headphones]

export function Features() {
  const { ref, isVisible } = useScrollAnimation(0.2)
  const { t } = useLanguage()

  const features = [
    {
      icon: Truck,
      title: t.features.globalShipping,
      description: t.features.globalShippingDesc,
    },
    {
      icon: Shield,
      title: t.features.securePayment,
      description: t.features.securePaymentDesc,
    },
    {
      icon: RefreshCw,
      title: t.features.easyReturns,
      description: t.features.easyReturnsDesc,
    },
    {
      icon: Headphones,
      title: t.features.support247,
      description: t.features.support247Desc,
    },
  ]

  return (
    <section className="mirai-neon-divider relative overflow-hidden px-6 py-20" ref={ref}>
      <div className="mirai-aurora-orb -right-48 top-0 h-96 w-96 [animation-delay:-3s]" />
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {features.map((feature, i) => (
          <div
            key={i}
            className={`mirai-neon-card relative rounded-2xl px-5 py-7 text-center transition-all duration-700 hover:-translate-y-1 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            style={{ transitionDelay: isVisible ? `${i * 0.1}s` : "0s" }}
          >
            <div className="mirai-soft-float mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary shadow-[0_0_28px_rgba(159,134,255,0.28)] transition-all duration-300 hover:bg-primary/15 hover:shadow-[0_0_38px_rgba(159,134,255,0.48)]">
              <feature.icon className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold tracking-wide uppercase text-foreground mb-2">
              {feature.title}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
