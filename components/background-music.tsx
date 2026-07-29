"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

export function BackgroundMusic() {
  const pathname = usePathname()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const isBeatPage = pathname?.startsWith("/i-nostri-beat")

  // Try to start playback, and if the browser blocks autoplay,
  // begin on the first user interaction anywhere on the page.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || isBeatPage) return

    audio.volume = 0.18

    const tryPlay = async () => {
      try {
        await audio.play()
        removeInteractionListeners()
      } catch {
        // Autoplay blocked — wait for a user gesture.
      }
    }

    const onInteraction = () => {
      void tryPlay()
    }

    const interactionEvents: (keyof DocumentEventMap)[] = [
      "click",
      "touchstart",
      "keydown",
      "scroll",
    ]

    const removeInteractionListeners = () => {
      interactionEvents.forEach((evt) =>
        document.removeEventListener(evt, onInteraction),
      )
    }

    const addInteractionListeners = () => {
      interactionEvents.forEach((evt) =>
        document.addEventListener(evt, onInteraction, { once: false, passive: true }),
      )
    }

    void tryPlay()
    addInteractionListeners()

    return () => {
      removeInteractionListeners()
    }
  }, [isBeatPage])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const pauseForBeatPlayer = () => {
      audio.muted = true
      audio.pause()
    }

    window.addEventListener("mirai:beat-player-start", pauseForBeatPlayer)
    return () => window.removeEventListener("mirai:beat-player-start", pauseForBeatPlayer)
  }, [])

  if (isBeatPage) return null

  return <audio ref={audioRef} src="/audio/mirai-emme-effe-rocco-beat-3.mp3" loop preload="auto" aria-hidden="true" />
}
