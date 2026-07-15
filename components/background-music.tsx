"use client"

import { useEffect, useRef, useState } from "react"
import { Volume2, VolumeX } from "lucide-react"

export function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [ready, setReady] = useState(false)

  // Try to start playback, and if the browser blocks autoplay,
  // begin on the first user interaction anywhere on the page.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.volume = 0.35

    const tryPlay = async () => {
      try {
        await audio.play()
        setIsPlaying(true)
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

    setReady(true)
    void tryPlay()
    addInteractionListeners()

    return () => {
      removeInteractionListeners()
    }
  }, [])

  const toggle = async () => {
    const audio = audioRef.current
    if (!audio) return

    if (audio.paused) {
      try {
        await audio.play()
        setIsPlaying(true)
      } catch {
        setIsPlaying(false)
      }
    } else {
      audio.pause()
      setIsPlaying(false)
    }
  }

  return (
    <>
      <audio ref={audioRef} src="/audio/mirai-beat.wav" loop preload="auto" aria-hidden="true" />
      {ready && (
        <button
          type="button"
          onClick={toggle}
          aria-label={isPlaying ? "Disattiva musica di sottofondo" : "Attiva musica di sottofondo"}
          aria-pressed={isPlaying}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-[0_0_20px_rgba(0,0,0,0.35)]"
        >
          {isPlaying ? (
            <Volume2 className="h-6 w-6" aria-hidden="true" />
          ) : (
            <VolumeX className="h-6 w-6" aria-hidden="true" />
          )}
        </button>
      )}
    </>
  )
}
