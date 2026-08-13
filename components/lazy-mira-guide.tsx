"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"

const MiraGuide = dynamic(
  () => import("@/components/mira-guide").then((module) => module.MiraGuide),
  { ssr: false },
)

export function LazyMiraGuide() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const enable = () => setEnabled(true)
    const interactionEvents: (keyof WindowEventMap)[] = ["pointerdown", "keydown", "scroll"]
    interactionEvents.forEach((event) => window.addEventListener(event, enable, { once: true, passive: true }))
    const timerHandle = window.setTimeout(enable, 4500)

    return () => {
      interactionEvents.forEach((event) => window.removeEventListener(event, enable))
      window.clearTimeout(timerHandle)
    }
  }, [])

  return enabled ? <MiraGuide /> : null
}
