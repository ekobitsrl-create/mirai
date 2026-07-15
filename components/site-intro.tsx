"use client"

import { useCallback, useEffect, useRef, useState } from "react"

const FADE_DURATION_MS = 1000
const SAFETY_TIMEOUT_MS = 12000

export function SiteIntro() {
  const [isVisible, setIsVisible] = useState(true)
  const [isLeaving, setIsLeaving] = useState(false)
  const isLeavingRef = useRef(false)
  const fadeTimerRef = useRef<number | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const finishIntro = useCallback(() => {
    if (isLeavingRef.current) return

    isLeavingRef.current = true
    setIsLeaving(true)
    fadeTimerRef.current = window.setTimeout(() => {
      setIsVisible(false)
    }, FADE_DURATION_MS)
  }, [])

  useEffect(() => {
    if (!isVisible) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const safetyTimer = window.setTimeout(finishIntro, SAFETY_TIMEOUT_MS)

    return () => {
      window.clearTimeout(safetyTimer)
      document.body.style.overflow = previousOverflow
    }
  }, [finishIntro, isVisible])

  useEffect(() => {
    if (!isVisible) return

    videoRef.current?.play().catch(finishIntro)
  }, [finishIntro, isVisible])

  useEffect(() => {
    return () => {
      if (fadeTimerRef.current !== null) {
        window.clearTimeout(fadeTimerRef.current)
      }
    }
  }, [])

  if (!isVisible) return null

  return (
    <div
      className={`fixed inset-0 z-[10000] flex items-center justify-center overflow-hidden bg-black transition-opacity duration-1000 ease-in-out ${
        isLeaving ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      aria-label="Introduzione MIRAI"
    >
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={finishIntro}
        onError={finishIntro}
        aria-hidden="true"
      >
        <source src="/videos/mirai-intro.mp4" type="video/mp4" />
      </video>

      <button
        type="button"
        onClick={finishIntro}
        className={`absolute bottom-6 right-6 rounded-full border border-white/40 bg-black/30 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-sm transition-opacity hover:bg-black/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
          isLeaving ? "opacity-0" : "opacity-100"
        }`}
      >
        Salta intro
      </button>
    </div>
  )
}
