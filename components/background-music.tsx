"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { Volume2, VolumeX } from "lucide-react"

export function BackgroundMusic() {
  const pathname = usePathname()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [ready, setReady] = useState(false)
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
  }, [isBeatPage])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const pauseForBeatPlayer = () => {
      audio.muted = true
      audio.pause()
      setIsPlaying(false)
    }

    window.addEventListener("mirai:beat-player-start", pauseForBeatPlayer)
    return () => window.removeEventListener("mirai:beat-player-start", pauseForBeatPlayer)
  }, [])

  const togglePlayback = async () => {
    const audio = audioRef.current
    if (!audio) return

    if (audio.paused) {
      try {
        audio.muted = false
        await audio.play()
        setIsPlaying(true)
      } catch {
        setIsPlaying(false)
      }
      return
    }

    audio.pause()
    setIsPlaying(false)
  }

  if (isBeatPage) return null

  return (
    <>
      <audio ref={audioRef} src="/audio/mirai-emme-effe-rocco-beat-3.mp3" loop preload="none" aria-hidden="true" />
      {ready && (
        <button
          type="button"
          data-background-music-control
          onClick={togglePlayback}
          aria-label={isPlaying ? "Disattiva musica di sottofondo" : "Attiva musica di sottofondo"}
          aria-pressed={!isPlaying}
          title={isPlaying ? "Disattiva musica" : "Attiva musica"}
          className="fixed bottom-[1.625rem] left-[5.75rem] z-[55] flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-[#120c19]/90 text-white shadow-[0_0_20px_rgba(126,87,194,0.3)] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-primary/60 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {isPlaying ? (
            <Volume2 className="h-5 w-5" aria-hidden="true" />
          ) : (
            <VolumeX className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      )}
    </>
  )
}
