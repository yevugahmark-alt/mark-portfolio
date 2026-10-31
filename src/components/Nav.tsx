import { useEffect, useLayoutEffect, useRef, type Ref } from 'react'
import { navLinks, profile } from '../data'
import { isMac, useScrolled, type Theme } from '../hooks'
import { Spring } from '../lib/spring'
import { Icon } from './Icon'

interface NavProps {
  active: string
  theme: Theme
  onToggleTheme: () => void
  onSearch: () => void
  searchButtonRef: Ref<HTMLButtonElement>
  inert?: boolean
}

export function Nav({ active, theme, onToggleTheme, onSearch, searchButtonRef, inert }: NavProps) {
  const scrolled = useScrolled()
  const linksRef = useRef<HTMLDivElement>(null)
  const pillRef = useRef<HTMLSpanElement>(null)
  const springs = useRef<{ x: Spring; width: Spring } | null>(null)
  const pillVisible = useRef(false)

  // The highlight pill glides between links on two independent springs.
  useLayoutEffect(() => {
    const pill = pillRef.current
    if (!pill) return
    const x = new Spring(0, (v) => (pill.style.transform = `translateX(${v}px)`))
    const width = new Spring(0, (v) => (pill.style.width = `${v}px`))
    springs.current = { x, width }
    return () => {
      x.stop()
      width.stop()
      springs.current = null
    }
  }, [])

  useLayoutEffect(() => {
    const pill = pillRef.current
    const link = linksRef.current?.querySelector<HTMLElement>(`[data-id="${active}"]`)
    const s = springs.current
    if (!pill || !s) return

    if (!link) {
      pill.dataset.visible = 'false'
      pillVisible.current = false
      return
    }
    const { offsetLeft, offsetWidth } = link
    if (pillVisible.current) {
      s.x.to(offsetLeft, { damping: 1, response: 0.35 })
      s.width.to(offsetWidth, { damping: 1, response: 0.35 })
    } else {
      // Appearing: place it, then let it fade in rather than fly in from 0.
      s.x.set(offsetLeft)
      s.width.set(offsetWidth)
    }
    pill.dataset.visible = 'true'
    pillVisible.current = true
  }, [active])

  useEffect(() => {
    const onResize = () => {
      const link = linksRef.current?.querySelector<HTMLElement>(`[data-id="${active}"]`)
      if (!link || !springs.current) return
      springs.current.x.set(link.offsetLeft)
      springs.current.width.set(link.offsetWidth)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [active])

  return (
    <header className="nav" data-scrolled={scrolled || undefined} inert={inert}>
      <span className="nav-progress" aria-hidden="true" />
      <nav className="nav-inner container" aria-label="Primary">
        <a href="#top" className="brand" aria-label={`${profile.name}, back to top`}>
          <span className="brand-mark" aria-hidden="true">
            {profile.initials}
          </span>
          <span className="brand-name">{profile.name}</span>
        </a>

        <div className="nav-links" ref={linksRef}>
          <span className="nav-pill" ref={pillRef} aria-hidden="true" />
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              data-id={link.id}
              className="nav-link"
              aria-current={active === link.id ? 'location' : undefined}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="nav-actions">
          <button
            ref={searchButtonRef}
            type="button"
            className="search-trigger"
            onClick={onSearch}
            aria-label="Search"
            aria-keyshortcuts={isMac() ? 'Meta+K' : 'Control+K'}
          >
            <Icon name="search" size={16} />
            <span className="search-trigger-label">Search</span>
            <kbd className="search-trigger-kbd">{isMac() ? '⌘K' : 'Ctrl K'}</kbd>
          </button>
          <button
            type="button"
            className="icon-button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <Icon key={theme} className="theme-icon" name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
          </button>
        </div>
      </nav>
    </header>
  )
}
