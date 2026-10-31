import { Fragment, useEffect, useLayoutEffect, useRef, type CSSProperties } from 'react'
import { prefersReducedMotion } from '../hooks'

/**
 * Splits a heading into words that rise out of a mask one after another.
 * Use on an element with `data-reveal="words"`.
 */
export function SplitWords({ text, accent }: { text: string; accent?: string }) {
  const words = [
    ...text.split(' ').map((word) => ({ word, accent: false })),
    ...(accent ? accent.split(' ').map((word) => ({ word, accent: true })) : []),
  ]
  return (
    <>
      {words.map(({ word, accent }, i) => (
        <Fragment key={i}>
          <span className="word-mask">
            <span className={accent ? 'word accent-text' : 'word'} style={{ '--w': i } as CSSProperties}>
              {word}
            </span>
          </span>
          {i < words.length - 1 && ' '}
        </Fragment>
      ))}
    </>
  )
}

const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t))

/** Counts a stat like "30+" up from zero the first time it scrolls into view. */
export function CountUp({ value, duration = 1600 }: { value: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    const match = value.match(/^(\D*)(\d+)(.*)$/)
    if (!el || !match || prefersReducedMotion()) return
    const [, prefix, digits, suffix] = match
    const target = Number(digits)
    el.textContent = `${prefix}0${suffix}`

    let frame = 0
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        const start = performance.now()
        const tick = (now: number) => {
          const t = Math.min((now - start) / duration, 1)
          el.textContent = `${prefix}${Math.round(target * easeOutExpo(t))}${suffix}`
          if (t < 1) frame = requestAnimationFrame(tick)
        }
        frame = requestAnimationFrame(tick)
      },
      { threshold: 0.6 },
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
      el.textContent = value
    }
  }, [value, duration])

  return <span ref={ref}>{value}</span>
}

const BASE_SPEED = 48 // px/s

/**
 * An endless ribbon of words. Scrolling speeds it up and sets its direction,
 * and it leans (skews) with speed, the way fast motion streaks.
 */
export function Marquee({ items }: { items: string[] }) {
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const track = trackRef.current
    if (!track || prefersReducedMotion()) return

    let x = 0
    let speed = BASE_SPEED
    let direction = -1
    let lastScroll = window.scrollY
    let last = performance.now()
    let frame = 0

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      const scrollVelocity = dt > 0 ? (window.scrollY - lastScroll) / dt : 0
      lastScroll = window.scrollY
      if (Math.abs(scrollVelocity) > 20) direction = scrollVelocity > 0 ? -1 : 1

      const target = BASE_SPEED + Math.min(Math.abs(scrollVelocity) * 0.4, 1200)
      speed += (target - speed) * Math.min(1, dt * 5)
      x += direction * speed * dt

      const half = track.scrollWidth / 2
      if (x <= -half) x += half
      if (x > 0) x -= half

      const skew = Math.max(-10, Math.min(10, (direction * -(speed - BASE_SPEED)) / 90))
      track.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0) skewX(${skew.toFixed(2)}deg)`
      frame = requestAnimationFrame(tick)
    }

    const observer = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(frame)
      frame = 0
      if (entry.isIntersecting) {
        last = performance.now()
        lastScroll = window.scrollY
        frame = requestAnimationFrame(tick)
      }
    })
    observer.observe(track)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track" ref={trackRef}>
        {[0, 1].map((copy) => (
          <div className="marquee-group" key={copy}>
            {items.map((item) => (
              <span className="marquee-item" key={item}>
                {item}
                <span className="marquee-dot" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
