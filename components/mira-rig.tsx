"use client"

import { memo, useEffect, useState, type CSSProperties } from "react"
import rigs from "@/lib/mira-rig.json"

type Variant = "female" | "male"
type Piece = { x: number; y: number; width: number; height: number }

function Part({ variant, name }: { variant: Variant; name: string }) {
  const pieces = rigs[variant].pieces as Record<string, Piece>
  const piece = pieces[name]
  if (!piece) return null
  return <image href={`/mascot/rig/${variant}/${name}.png`} {...piece} />
}

function joint(x: number, y: number): CSSProperties {
  return { transformOrigin: `${x}px ${y}px` }
}

/** Original artwork, assembled at its source coordinates; poses share the same joints. */
export const MiraRig = memo(function MiraRig({ variant, pose, faceRight }: { variant: Variant; pose: string; faceRight: boolean }) {
  const rig = rigs[variant]
  const female = variant === "female"
  const [paused, setPaused] = useState(false)
  useEffect(() => {
    const update = () => setPaused(document.hidden)
    update()
    document.addEventListener("visibilitychange", update)
    return () => document.removeEventListener("visibilitychange", update)
  }, [])
  const center = female ? 177 : 155
  const neck = female ? 177 : 160
  const eyeY = female ? 125 : 105
  return (
    <div className={`mira-rig mira-rig-${pose}`} data-paused={paused} data-facing={faceRight ? "right" : "left"} aria-hidden="true">
      <svg viewBox={`-26 -24 ${rig.width + 52} ${rig.height + 48}`} className="mira-rig-canvas" focusable="false">
        <g className="mira-rig-body" style={joint(center, rig.height - 28)}>
          {(["sinistra", "destra"] as const).map((side) => (
            <g key={side} className={`mira-rig-leg mira-rig-leg-${side}`} style={joint(side === "sinistra" ? center - 50 : center + 50, 355)}>
              <Part variant={variant} name={`coscia-${side}`} />
              <Part variant={variant} name={`stinco-${side === "sinistra" ? "sinistro" : "destro"}`} />
              <Part variant={variant} name={`scarpa-${side}`} />
              <Part variant={variant} name={`tasca-fianco-${side}`} />
              <Part variant={variant} name={`cinghia-${side}`} />
            </g>
          ))}
          <Part variant={variant} name="cintura-vita" />
          <g className="mira-rig-breath" style={joint(center, 334)}>
            {(["sinistro", "destro"] as const).map((side) => {
              const left = side === "sinistro"
              const shoulderX = left ? (female ? 112 : 80) : (female ? 246 : 233)
              const elbowX = left ? (female ? 90 : 62) : (female ? 269 : 245)
              return (
                <g key={side} className={`mira-rig-arm mira-rig-arm-${side}`} style={joint(shoulderX, female ? 212 : 187)}>
                  <g className="mira-rig-arm-sway" style={joint(shoulderX, female ? 212 : 187)}>
                    <Part variant={variant} name={`braccio-${side}-superiore`} />
                    <g className={`mira-rig-forearm mira-rig-forearm-${side}`} style={joint(elbowX, female ? 279 : 261)}>
                      <Part variant={variant} name={`braccio-${side}-inferiore`} />
                      <Part variant={variant} name={`mano-${left ? "sinistra" : "destra"}`} />
                    </g>
                  </g>
                </g>
              )
            })}
            <Part variant={variant} name={female ? "torso-giacca" : "torso-felpa"} />
            {female && <Part variant={variant} name="top-torace" />}
            <g className="mira-rig-head-pose" style={joint(center, neck)}>
              <g className="mira-rig-head" style={joint(center, neck)}>
                {female && <Part variant={variant} name="coda" />}
                <Part variant={variant} name="guscio-testa" />
                <g className="mira-rig-face">
                  <ellipse cx={center} cy={eyeY + 4} rx="43" ry="29" fill="#090810" />
                  <g className="mira-rig-eyes" style={joint(center, eyeY)}>
                    <rect className="mira-rig-eye" x={center - 32} y={eyeY - 11} width="13" height="23" rx="6.5" />
                    <rect className="mira-rig-eye" x={center + 19} y={eyeY - 11} width="13" height="23" rx="6.5" />
                  </g>
                  <path className="mira-rig-smile" d={`M ${center - 7} ${eyeY + 19} Q ${center} ${eyeY + 24} ${center + 7} ${eyeY + 19}`} />
                  <ellipse className="mira-rig-mouth" cx={center} cy={eyeY + 20} rx="7" ry="5" style={joint(center, eyeY + 20)} />
                </g>
              </g>
            </g>
          </g>
        </g>
      </svg>
    </div>
  )
})
