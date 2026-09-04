import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { BeatTurntable } from "@/components/beat-turntable"

export const metadata: Metadata = {
  title: "I Nostri Beat - MIRΛI",
  alternates: { canonical: "/i-nostri-beat" },
  description: "Ascolta le tracce MIRΛI con giradischi animato, player e tracklist.",
}

export default function INostriBeatPage() {
  return (
    <main className="min-h-screen bg-[#08070b]">
      <Navbar />
      <BeatTurntable />
      <Footer />
    </main>
  )
}
