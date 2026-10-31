import { useEffect, useRef } from 'react'
import { prefersReducedMotion, type Theme } from '../hooks'
import { Spring, VelocityTracker } from '../lib/spring'

interface Point {
  x: number
  y: number
  z: number
  /** Scattered start position the point assembles from. */
  sx: number
  sy: number
  sz: number
  delay: number
  accent: boolean
}

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))
const AUTO_SPIN = 0.14 // rad/s
const DRAG_GAIN = 0.008 // rad per px
const CAMERA = 3 // viewer distance, in globe radii
// The orbit is tipped toward the viewer so it reads as an open ellipse.
const RING_TILT_X = 1.05
const RING_TILT_Z = 0.38

function buildPoints(count: number): Point[] {
  return Array.from({ length: count }, (_, i) => {
    const y = 1 - (i / (count - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const theta = GOLDEN_ANGLE * i
    const spread = 1.8 + Math.random() * 1.6
    const a = Math.random() * Math.PI * 2
    const b = Math.acos(Math.random() * 2 - 1)
    return {
      x: Math.cos(theta) * r,
      y,
      z: Math.sin(theta) * r,
      sx: Math.sin(b) * Math.cos(a) * spread,
      sy: Math.cos(b) * spread,
      sz: Math.sin(b) * Math.sin(a) * spread,
      delay: Math.random() * 0.5,
      accent: i % 13 === 0,
    }
  })
}

/**
 * A field of points on a sphere. It assembles on load, leans toward the
 * pointer on springs, and can be flicked: release velocity carries into a
 * spin that decays like scroll momentum.
 */
const readColors = (el: Element) => {
  const styles = getComputedStyle(el)
  return {
    dot: styles.getPropertyValue('--label').trim() || '#1d1d1f',
    accent: styles.getPropertyValue('--accent').trim() || '#0071e3',
  }
}

export function ParticleGlobe({ theme }: { theme: Theme }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const colors = useRef({ dot: '#1d1d1f', accent: '#0071e3' })

  // Re-read the palette when the theme flips; the running loop picks it up next frame.
  useEffect(() => {
    if (canvasRef.current) colors.current = readColors(canvasRef.current)
  }, [theme])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const reduced = prefersReducedMotion()
    const points = buildPoints(window.innerWidth < 720 ? 520 : 900)

    let width = 0
    let height = 0
    let rotation = 0.6
    let spin = 0
    let assembled = reduced ? 1 : 0
    const tilt = { x: 0, y: 0 }

    const tiltX = new Spring(0, (v) => (tilt.x = v), { precision: 0.0005 })
    const tiltY = new Spring(0, (v) => (tilt.y = v), { precision: 0.0005 })
    const intro = new Spring(assembled, (v) => (assembled = v), { precision: 0.001 })
    intro.to(1, { damping: 1, response: 1.6 })

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = rect.width
      height = rect.height
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      draw(performance.now())
    }

    function draw(now: number) {
      ctx!.clearRect(0, 0, width, height)
      const { dot: dotColor, accent: accentColor } = colors.current
      const cx = width / 2
      const cy = height / 2
      const radius = Math.min(width, height) * 0.34
      const angleY = rotation + tilt.y
      const angleX = 0.28 + tilt.x
      const cosY = Math.cos(angleY)
      const sinY = Math.sin(angleY)
      const cosX = Math.cos(angleX)
      const sinX = Math.sin(angleX)

      const plot = (x: number, y: number, z: number, size: number, color: string, alpha: number) => {
        const x1 = x * cosY - z * sinY
        const z1 = x * sinY + z * cosY
        const y1 = y * cosX - z1 * sinX
        const z2 = y * sinX + z1 * cosX
        // Scattered start positions can sit at or behind the camera; skip those.
        if (z2 > CAMERA - 0.5) return
        const perspective = CAMERA / (CAMERA - z2)
        const depth = Math.min(Math.max((z2 + 1) / 2, 0), 1)
        const s = size * (0.55 + depth * 0.9) * perspective
        ctx!.globalAlpha = Math.max(0, Math.min(1, alpha * (0.14 + depth * 0.86)))
        ctx!.fillStyle = color
        ctx!.beginPath()
        ctx!.arc(cx + x1 * radius * perspective, cy + y1 * radius * perspective, s, 0, Math.PI * 2)
        ctx!.fill()
      }

      for (const p of points) {
        const t = Math.min(Math.max(assembled * 1.5 - p.delay, 0), 1)
        const e = 1 - (1 - t) ** 3
        plot(
          p.sx + (p.x - p.sx) * e,
          p.sy + (p.y - p.sy) * e,
          p.sz + (p.z - p.sz) * e,
          p.accent ? 1.6 : 1.1,
          p.accent ? accentColor : dotColor,
          e,
        )
      }

      // A dotted orbit, tilted off-axis, with a satellite riding it.
      const ringRadius = 1.3
      const ringAlpha = Math.max(0, assembled * 1.4 - 0.4) * 0.6
      const ringPoint = (a: number, size: number, color: string, alpha: number) => {
        const rx = Math.cos(a) * ringRadius
        const rz = Math.sin(a) * ringRadius
        const y = -rz * Math.sin(RING_TILT_X)
        const z = rz * Math.cos(RING_TILT_X)
        plot(
          rx * Math.cos(RING_TILT_Z) - y * Math.sin(RING_TILT_Z),
          rx * Math.sin(RING_TILT_Z) + y * Math.cos(RING_TILT_Z),
          z,
          size,
          color,
          alpha,
        )
      }
      for (let i = 0; i < 160; i++) ringPoint((i / 160) * Math.PI * 2, 0.7, dotColor, ringAlpha)
      ringPoint(reduced ? 2.2 : now * 0.0005, 3.2, accentColor, ringAlpha / 0.6)
      ctx!.globalAlpha = 1
    }

    // ─── Loop: only runs while the globe is on screen and the tab is visible
    let frame = 0
    let last = performance.now()
    let dragging = false
    let onScreen = true

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      if (!dragging) {
        rotation += ((reduced ? 0 : AUTO_SPIN) + spin) * dt
        // Same exponential decay Apple uses for scroll deceleration.
        spin *= Math.pow(0.998, dt * 1000)
        if (Math.abs(spin) < 0.002) spin = 0
      }
      draw(now)
      frame = requestAnimationFrame(tick)
    }
    const start = () => {
      if (frame || !onScreen || document.hidden) return
      last = performance.now()
      frame = requestAnimationFrame(tick)
    }
    const stop = () => {
      cancelAnimationFrame(frame)
      frame = 0
    }

    const visibility = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting
      if (onScreen) start()
      else stop()
    })
    visibility.observe(canvas)
    const onVisibilityChange = () => (document.hidden ? stop() : start())
    document.addEventListener('visibilitychange', onVisibilityChange)

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)

    // ─── Lean toward the pointer (mouse only; touch has no hover)
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || dragging) return
      const nx = (e.clientX / window.innerWidth - 0.5) * 2
      const ny = (e.clientY / window.innerHeight - 0.5) * 2
      tiltY.to(nx * 0.35, { damping: 1, response: 0.8 })
      tiltX.to(ny * 0.22, { damping: 1, response: 0.8 })
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true })

    // ─── Drag to spin, 1:1, then hand off release velocity
    const tracker = new VelocityTracker()
    let lastX = 0
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return
      canvas.setPointerCapture(e.pointerId)
      dragging = true
      spin = 0
      lastX = e.clientX
      tracker.reset()
      tracker.add(e.clientX)
      canvas.dataset.dragging = 'true'
    }
    const onMove = (e: PointerEvent) => {
      if (!dragging) return
      rotation += (e.clientX - lastX) * DRAG_GAIN
      lastX = e.clientX
      tracker.add(e.clientX)
    }
    const onUp = () => {
      if (!dragging) return
      dragging = false
      spin = tracker.velocity * DRAG_GAIN
      delete canvas.dataset.dragging
    }
    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerup', onUp)
    canvas.addEventListener('pointercancel', onUp)

    return () => {
      stop()
      tiltX.stop()
      tiltY.stop()
      intro.stop()
      visibility.disconnect()
      resizeObserver.disconnect()
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('pointercancel', onUp)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="globe"
      role="img"
      aria-label="A rotating globe of particles. Drag to spin it."
    />
  )
}
