"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { Disc3, Pause, Play, SkipBack, SkipForward, Volume2 } from "lucide-react"

const TRACKS = [
  {
    title: "MIRAI Soundtrack",
    subtitle: "Sottofondo attuale del sito",
    src: "/audio/mirai-soundtrack.mpeg",
  },
  {
    title: "MIRAI Beat",
    subtitle: "Sottofondo precedente",
    src: "/audio/mirai-beat.wav",
  },
] as const

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00"
  const minutes = Math.floor(seconds / 60)
  const rest = Math.floor(seconds % 60).toString().padStart(2, "0")
  return `${minutes}:${rest}`
}

export function BeatTurntable() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const playAfterTrackChange = useRef(false)
  const [trackIndex, setTrackIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [volume, setVolume] = useState(0.75)
  const currentTrack = TRACKS[trackIndex]
  const progress = useMemo(() => duration > 0 ? Math.min(100, (elapsed / duration) * 100) : 0, [duration, elapsed])

  const startPlayback = async () => {
    const audio = audioRef.current
    if (!audio) return

    window.dispatchEvent(new Event("mirai:beat-player-start"))
    audio.volume = volume

    try {
      await audio.play()
      setIsPlaying(true)
    } catch {
      setIsPlaying(false)
    }
  }

  const pausePlayback = () => {
    const audio = audioRef.current
    if (!audio) return
    audio.pause()
    setIsPlaying(false)
  }

  const selectTrack = (index: number, play = true) => {
    const nextIndex = (index + TRACKS.length) % TRACKS.length
    playAfterTrackChange.current = play

    if (nextIndex === trackIndex) {
      if (play) void startPlayback()
      return
    }

    setTrackIndex(nextIndex)
    setElapsed(0)
    setDuration(0)
  }

  const nextTrack = () => selectTrack(trackIndex + 1, true)
  const previousTrack = () => selectTrack(trackIndex - 1, true)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.volume = volume
  }, [volume])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.load()
    if (playAfterTrackChange.current) {
      playAfterTrackChange.current = false
      void startPlayback()
    }
  }, [trackIndex])

  const scrub = (value: string) => {
    const audio = audioRef.current
    if (!audio || duration <= 0) return

    const nextTime = (Number(value) / 100) * duration
    audio.currentTime = nextTime
    setElapsed(nextTime)
  }

  return (
    <section className="relative min-h-[calc(100svh-5rem)] overflow-hidden bg-[#08070b] px-5 pb-16 pt-32 text-white sm:px-6 lg:pt-36">
      <audio
        ref={audioRef}
        src={currentTrack.src}
        preload="metadata"
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 0)}
        onTimeUpdate={(event) => setElapsed(event.currentTarget.currentTime || 0)}
        onEnded={nextTrack}
      />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_22%,rgba(0,210,190,0.18),transparent_26%),radial-gradient(circle_at_88%_20%,rgba(159,134,255,0.16),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_38%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[minmax(320px,0.9fr)_minmax(360px,1.1fr)] lg:items-center">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-[9px] font-bold uppercase tracking-[0.24em] text-white/60">
            <Disc3 className="h-3.5 w-3.5 text-[#5eead4]" /> MIRAI radio
          </p>
          <h1 className="mt-7 max-w-3xl font-[family-name:var(--font-space-grotesk)] text-[clamp(3rem,8vw,7.4rem)] font-black uppercase leading-[0.86] tracking-tight">
            I Nostri<br /><span className="text-[#5eead4]">Beat</span>
          </h1>
          <p className="mt-7 max-w-xl text-sm leading-7 text-white/55 sm:text-base">
            Due tracce MIRAI, una console essenziale e il disco che gira quando parte il suono.
          </p>

          <div className="mt-10 flex items-center gap-4">
            <button
              type="button"
              onClick={previousTrack}
              aria-label="Traccia precedente"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-white/70 transition-colors hover:border-[#5eead4]/60 hover:text-white"
            >
              <SkipBack className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => isPlaying ? pausePlayback() : void startPlayback()}
              aria-label={isPlaying ? "Pausa" : "Play"}
              aria-pressed={isPlaying}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-black shadow-[0_0_40px_rgba(94,234,212,0.28)] transition-transform hover:scale-105"
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="ml-1 h-6 w-6" />}
            </button>
            <button
              type="button"
              onClick={nextTrack}
              aria-label="Traccia successiva"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-white/70 transition-colors hover:border-[#5eead4]/60 hover:text-white"
            >
              <SkipForward className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(260px,0.95fr)_minmax(260px,1.05fr)] lg:items-center">
          <div className="relative mx-auto aspect-square w-full max-w-[420px]">
            <div className="absolute inset-0 rounded-full bg-[#050506] shadow-[0_35px_90px_rgba(0,0,0,0.58),0_0_70px_rgba(94,234,212,0.12)]" />
            <div
              className={`absolute inset-[7%] rounded-full ${isPlaying ? "animate-spin" : ""}`}
              style={{
                animationDuration: "8s",
                background:
                  "repeating-radial-gradient(circle, #111 0 6px, #17171a 7px 9px, #0a0a0c 10px 13px), conic-gradient(from 90deg, rgba(255,255,255,.12), rgba(94,234,212,.2), rgba(255,255,255,.06), rgba(159,134,255,.24), rgba(255,255,255,.12))",
              }}
            >
              <div className="absolute inset-[35%] rounded-full border border-white/15 bg-[#141017] shadow-[inset_0_0_35px_rgba(159,134,255,0.28)]" />
              <div className="absolute inset-[41%] flex items-center justify-center rounded-full bg-white">
                <Image src="/favicon.svg" alt="" width={96} height={96} className="h-[76%] w-[76%] rounded-full" />
              </div>
            </div>
            <div className="absolute right-[5%] top-[10%] h-[58%] w-[12px] origin-top rotate-[26deg] rounded-full bg-gradient-to-b from-white/80 via-white/30 to-transparent shadow-[0_0_20px_rgba(255,255,255,0.22)]" />
            <div className="absolute right-[6%] top-[7%] h-11 w-11 rounded-full border border-white/15 bg-white/[0.06]" />
          </div>

          <div className="rounded-lg border border-white/12 bg-white/[0.035] p-5 shadow-[0_22px_70px_rgba(0,0,0,0.28)] sm:p-6">
            <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#5eead4]">Now playing</p>
            <h2 className="mt-3 font-[family-name:var(--font-space-grotesk)] text-2xl font-bold uppercase tracking-tight">{currentTrack.title}</h2>
            <p className="mt-2 text-sm text-white/45">{currentTrack.subtitle}</p>

            <div className="mt-7">
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(event) => scrub(event.target.value)}
                aria-label="Avanzamento traccia"
                className="h-2 w-full accent-[#5eead4]"
              />
              <div className="mt-2 flex justify-between text-[10px] tabular-nums text-white/45">
                <span>{formatTime(elapsed)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <label className="mt-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
              <Volume2 className="h-4 w-4 text-[#5eead4]" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(event) => setVolume(Number(event.target.value))}
                aria-label="Volume"
                className="h-2 flex-1 accent-[#5eead4]"
              />
            </label>

            <div className="mt-7 space-y-2">
              {TRACKS.map((track, index) => {
                const active = index === trackIndex
                return (
                  <button
                    key={track.src}
                    type="button"
                    onClick={() => selectTrack(index, true)}
                    className={`flex w-full items-center justify-between gap-4 rounded-lg border px-4 py-3 text-left transition-colors ${active ? "border-[#5eead4]/70 bg-[#5eead4]/10 text-white" : "border-white/10 bg-black/10 text-white/55 hover:border-white/25 hover:text-white"}`}
                    aria-current={active ? "true" : undefined}
                  >
                    <span>
                      <span className="block text-sm font-semibold">{track.title}</span>
                      <span className="mt-1 block text-[10px] uppercase tracking-[0.16em] text-white/35">{track.subtitle}</span>
                    </span>
                    <span className="font-mono text-xs text-white/35">{String(index + 1).padStart(2, "0")}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
