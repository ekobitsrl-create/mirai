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
    <section className="py-20 px-6 border-t border-border" ref={ref}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {features.map((feature, i) => (
          <div
            key={i}
            className={`text-center transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            style={{ transitionDelay: isVisible ? `${i * 0.1}s` : "0s" }}
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-primary/30 mb-4 text-primary bg-primary/5 transition-all duration-300 hover:bg-primary/10 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]">
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
