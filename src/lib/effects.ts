// Site-wide interaction effects, wired up declaratively with data attributes:
//   data-tilt="6"        the element leans toward the pointer (max degrees)
//   data-magnetic="0.3"  the element is pulled toward the pointer while hovered
//   data-parallax="0.1"  the element drifts against scroll (fraction of offset)
// Every motion runs on an interruptible spring and reads the live value, so
// moving the pointer in and out quickly never makes anything jump.

import { Spring } from './spring'

type Cleanup = () => void

const finePointer = () => matchMedia('(hover: hover) and (pointer: fine)').matches

/** Exposes overall page scroll (0 to 1) as `--scroll` on the root. */
export function trackScrollProgress(): Cleanup {
  const root = document.documentElement
  let frame = 0
  const update = () => {
    frame = 0
    const max = root.scrollHeight - window.innerHeight
    root.style.setProperty('--scroll', max > 0 ? (window.scrollY / max).toFixed(4) : '0')
  }
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update)
  }
  update()
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', schedule)
  return () => {
    window.removeEventListener('scroll', schedule)
    window.removeEventListener('resize', schedule)
    cancelAnimationFrame(frame)
  }
}

function tilt(el: HTMLElement): Cleanup {
  const max = Number(el.dataset.tilt) || 6
  // Measure the untransformed parent so the tilt can't feed back into itself.
  const frame = el.parentElement ?? el
  let rx: Spring | null = null
  let ry: Spring | null = null
  const apply = () => {
    const x = rx?.value ?? 0
    const y = ry?.value ?? 0
    el.style.transform = `perspective(1200px) rotateX(${x.toFixed(3)}deg) rotateY(${y.toFixed(3)}deg)`
    // Inner layers read these to shift with depth.
    el.style.setProperty('--gx', ((y / max) * 12).toFixed(2))
    el.style.setProperty('--gy', ((-x / max) * 12).toFixed(2))
  }
  rx = new Spring(0, apply, { precision: 0.01 })
  ry = new Spring(0, apply, { precision: 0.01 })

  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    const r = frame.getBoundingClientRect()
    const nx = ((e.clientX - r.left) / r.width) * 2 - 1
    const ny = ((e.clientY - r.top) / r.height) * 2 - 1
    ry!.to(nx * max, { damping: 1, response: 0.45 })
    rx!.to(-ny * max, { damping: 1, response: 0.45 })
  }
  const onLeave = () => {
    ry!.to(0, { damping: 1, response: 0.6 })
    rx!.to(0, { damping: 1, response: 0.6 })
  }
  el.addEventListener('pointermove', onMove)
  el.addEventListener('pointerleave', onLeave)
  return () => {
    rx!.stop()
    ry!.stop()
    el.removeEventListener('pointermove', onMove)
    el.removeEventListener('pointerleave', onLeave)
    el.style.removeProperty('transform')
  }
}

function magnetic(el: HTMLElement): Cleanup {
  const strength = Number(el.dataset.magnetic) || 0.3
  let x: Spring | null = null
  let y: Spring | null = null
  const apply = () => (el.style.translate = `${(x?.value ?? 0).toFixed(2)}px ${(y?.value ?? 0).toFixed(2)}px`)
  x = new Spring(0, apply, { precision: 0.05 })
  y = new Spring(0, apply, { precision: 0.05 })
  const clamp = (v: number) => Math.max(-14, Math.min(14, v))

  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    const r = el.getBoundingClientRect()
    // Subtract the current pull so we measure from the resting centre.
    const cx = r.left + r.width / 2 - x!.value
    const cy = r.top + r.height / 2 - y!.value
    x!.to(clamp((e.clientX - cx) * strength), { damping: 1, response: 0.35 })
    y!.to(clamp((e.clientY - cy) * strength), { damping: 1, response: 0.35 })
  }
  // Letting go snaps back with a touch of overshoot, like releasing a spring.
  const onLeave = () => {
    x!.to(0, { damping: 0.7, response: 0.5 })
    y!.to(0, { damping: 0.7, response: 0.5 })
  }
  el.addEventListener('pointermove', onMove)
  el.addEventListener('pointerleave', onLeave)
  return () => {
    x!.stop()
    y!.stop()
    el.removeEventListener('pointermove', onMove)
    el.removeEventListener('pointerleave', onLeave)
    el.style.removeProperty('translate')
  }
}

function parallax(elements: HTMLElement[]): Cleanup {
  const visible = new Set<HTMLElement>()
  let frame = 0
  const update = () => {
    frame = 0
    const mid = window.innerHeight / 2
    for (const el of visible) {
      const r = (el.parentElement ?? el).getBoundingClientRect()
      const factor = Number(el.dataset.parallax) || 0.1
      el.style.setProperty('--py', ((r.top + r.height / 2 - mid) * factor).toFixed(1))
    }
  }
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update)
  }
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const el = entry.target as HTMLElement
      if (entry.isIntersecting) visible.add(el)
      else visible.delete(el)
    }
    schedule()
  })
  elements.forEach((el) => observer.observe(el))
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', schedule)
  return () => {
    observer.disconnect()
    window.removeEventListener('scroll', schedule)
    window.removeEventListener('resize', schedule)
    cancelAnimationFrame(frame)
  }
}

/** Attach every effect on the page. Pointer effects only on mouse/trackpad. */
export function attachEffects(root: ParentNode = document): Cleanup {
  const cleanups: Cleanup[] = [trackScrollProgress()]
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return () => cleanups.forEach((c) => c())
  }
  cleanups.push(parallax(Array.from(root.querySelectorAll<HTMLElement>('[data-parallax]'))))
  if (finePointer()) {
    root.querySelectorAll<HTMLElement>('[data-tilt]').forEach((el) => cleanups.push(tilt(el)))
    root.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => cleanups.push(magnetic(el)))
  }
  return () => cleanups.forEach((c) => c())
}
