import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

export type Theme = 'light' | 'dark'

const THEME_KEY = 'theme'
const darkQuery = () => matchMedia('(prefers-color-scheme: dark)')

function readStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem(THEME_KEY)
    return stored === 'light' || stored === 'dark' ? stored : null
  } catch {
    return null
  }
}

/** Follows the system theme until the visitor picks one; eases the switch. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(
    () => readStoredTheme() ?? (darkQuery().matches ? 'dark' : 'light'),
  )

  useEffect(() => {
    const query = darkQuery()
    const onChange = () => {
      if (!readStoredTheme()) setTheme(query.matches ? 'dark' : 'light')
    }
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  const toggle = useCallback(() => {
    const root = document.documentElement
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    // Avoid an abrupt brightness jump: cross-fade colours for a moment.
    root.classList.add('theme-transition')
    root.dataset.theme = next
    window.setTimeout(() => root.classList.remove('theme-transition'), 450)
    try {
      localStorage.setItem(THEME_KEY, next)
    } catch {
      // Storage unavailable (private mode), so the choice just won't persist.
    }
    setTheme(next)
  }, [theme])

  return [theme, toggle] as const
}

export function useScrolled(threshold = 8) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      setScrolled(window.scrollY > threshold)
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
  }, [threshold])
  return scrolled
}

/** The section currently crossing the middle of the viewport. */
export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState('')
  const key = ids.join(',')

  useEffect(() => {
    const sections = key
      .split(',')
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id)
        }
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [key])

  return active
}

/** Fades `[data-reveal]` elements up as they enter the viewport. */
export function useReveal() {
  useLayoutEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>('[data-reveal]')
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced || !('IntersectionObserver' in window)) return

    document.documentElement.classList.add('reveal-ready')
    const reveal = (options: IntersectionObserverInit) => {
      const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      }, options)
      return observer
    }
    const observer = reveal({ rootMargin: '0px 0px -8% 0px', threshold: 0.12 })
    // Cards wait until they're properly on screen so their entrance is seen.
    const cardObserver = reveal({ rootMargin: '0px 0px -12% 0px', threshold: 0.25 })
    elements.forEach((el) => (el.dataset.reveal === 'card' ? cardObserver : observer).observe(el))
    return () => {
      observer.disconnect()
      cardObserver.disconnect()
    }
  }, [])
}

export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return
    document.documentElement.classList.add('is-locked')
    return () => document.documentElement.classList.remove('is-locked')
  }, [locked])
}

export function useToast() {
  // The message outlives `visible` so the text stays put while the toast fades out.
  const [toast, setToast] = useState({ message: '', visible: false })
  const timer = useRef(0)

  const showToast = useCallback((message: string) => {
    window.clearTimeout(timer.current)
    setToast({ message, visible: true })
    timer.current = window.setTimeout(() => setToast((t) => ({ ...t, visible: false })), 2200)
  }, [])

  useEffect(() => () => window.clearTimeout(timer.current), [])
  return { toast, showToast }
}

export const isMac = () => /Mac|iPhone|iPad/.test(navigator.userAgent)

export const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches
