import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { profile } from '../data'
import { isMac, prefersReducedMotion, type Theme } from '../hooks'
import { Icon } from './Icon'
import { ParticleGlobe } from './ParticleGlobe'

const WORD_INTERVAL = 2800
const socialShort = { github: 'Gh', linkedin: 'In', x: 'X' } as const
const delay = (i: number) => ({ '--i': i }) as CSSProperties

function Word({ text, leaving, first }: { text: string; leaving?: boolean; first?: boolean }) {
  return (
    <span className="hero-word" data-leaving={leaving || undefined} data-first={first || undefined}>
      {Array.from(text).map((letter, i) => (
        <span key={i} style={delay(i)}>
          {letter}
        </span>
      ))}
    </span>
  )
}

export function Hero({ theme, onSearch }: { theme: Theme; onSearch: () => void }) {
  const heroRef = useRef<HTMLElement>(null)
  const [cycle, setCycle] = useState(0)
  const words = profile.heroWords
  const current = words[cycle % words.length]
  const previous = cycle > 0 ? words[(cycle - 1) % words.length] : null

  // Cycle the headline word, but only while the hero is actually visible.
  useEffect(() => {
    const hero = heroRef.current
    if (!hero || prefersReducedMotion() || words.length < 2) return
    let visible = true
    const observer = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting))
    observer.observe(hero)
    const timer = window.setInterval(() => {
      if (visible && !document.hidden) setCycle((c) => c + 1)
    }, WORD_INTERVAL)
    return () => {
      observer.disconnect()
      window.clearInterval(timer)
    }
  }, [words.length])

  // Scroll-linked depth: copy drifts down and fades, the globe drifts up.
  useEffect(() => {
    const hero = heroRef.current
    if (!hero || prefersReducedMotion()) return
    let frame = 0
    const update = () => {
      frame = 0
      const progress = Math.min(Math.max(window.scrollY / hero.offsetHeight, 0), 1)
      hero.style.setProperty('--hp', progress.toFixed(4))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <section id="top" ref={heroRef} className="hero">
      <div className="hero-lines" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} style={delay(i)} />
        ))}
      </div>

      <div className="hero-inner container">
        <div className="hero-copy">
          <h1 className="sr-only">
            {profile.name}, {profile.role}
          </h1>
          <div className="hero-title" aria-hidden="true">
            <span className="hero-block" />
            <p className="hero-eyebrow">{profile.name}</p>
            <p className="hero-words">
              {previous && <Word key={cycle - 1} text={previous} leaving />}
              <Word key={cycle} text={current} first={cycle === 0} />
            </p>
          </div>

          <p className="hero-intro">{profile.intro}</p>

          <div className="hero-actions">
            <a href="#work" className="button button-primary" data-magnetic>
              View my work
            </a>
            <a href="#contact" className="button button-ghost" data-magnetic>
              Let's talk
              <Icon name="arrowRight" size={18} />
            </a>
          </div>

          <button type="button" className="search-hint" onClick={onSearch}>
            Press <kbd>{isMac() ? '⌘' : 'Ctrl'}</kbd>
            <kbd>K</kbd> to search anything
          </button>
        </div>

        <div className="hero-visual">
          <ParticleGlobe theme={theme} />
          {profile.heroCallouts.map((label, i) => (
            <span key={label} className={`callout callout-${i + 1}`} aria-hidden="true">
              <span className="callout-label">{label}</span>
              <span className="callout-line" />
            </span>
          ))}
        </div>

        <ul className="hero-cards">
          {profile.available && (
            <li className="hero-card hero-card-status" style={delay(0)}>
              <span className="hero-card-title">
                <span className="status-dot" aria-hidden="true" />
                Status
              </span>
              <span className="hero-card-text">Available for new projects.</span>
            </li>
          )}
          {profile.heroCards.map((card, i) => (
            <li key={card.title} className="hero-card" style={delay(i + 1)}>
              <span className="hero-card-title">{card.title}</span>
              <span className="hero-card-text">{card.text}</span>
            </li>
          ))}
        </ul>
      </div>

      <ul className="hero-socials">
        {profile.socials.map((social) => (
          <li key={social.label}>
            <a href={social.href} target="_blank" rel="noreferrer" aria-label={social.label}>
              {socialShort[social.icon]}
            </a>
          </li>
        ))}
      </ul>

      <a href="#work" className="hero-scroll" aria-label="Scroll to work">
        <span>Scroll</span>
        <span className="hero-scroll-line" aria-hidden="true" />
      </a>
    </section>
  )
}
