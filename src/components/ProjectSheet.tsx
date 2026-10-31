import { useEffect, useLayoutEffect, useRef, type PointerEvent } from 'react'
import type { Project } from '../data'
import { Spring, VelocityTracker, project as projectMomentum, rubberband } from '../lib/spring'
import { Icon } from './Icon'
import { ProjectArt } from './ProjectArt'

interface ProjectSheetProps {
  project: Project
  open: boolean
  onClose: () => void
  /** Called once the sheet has fully left the screen. */
  onClosed: () => void
}

export function ProjectSheet({ project, open, onClose, onClosed }: ProjectSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const scrimRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const spring = useRef<Spring | null>(null)
  const openRef = useRef(open)
  const onClosedRef = useRef(onClosed)
  const drag = useRef<{ pointerId: number; startY: number; startValue: number; tracking: boolean } | null>(null)
  const tracker = useRef(new VelocityTracker())

  useLayoutEffect(() => {
    openRef.current = open
    onClosedRef.current = onClosed
  })

  // One spring drives the sheet, the scrim, and the page push-back together.
  useLayoutEffect(() => {
    const sheet = sheetRef.current
    const scrim = scrimRef.current
    if (!sheet || !scrim) return
    const root = document.documentElement
    const page = document.querySelector<HTMLElement>('.page')
    if (page) page.style.transformOrigin = `50% ${window.scrollY + window.innerHeight / 2}px`
    root.classList.add('sheet-active')

    const apply = (y: number) => {
      const height = sheet.offsetHeight || window.innerHeight
      const progress = Math.min(Math.max(1 - y / height, 0), 1)
      sheet.style.transform = `translate3d(0, ${y}px, 0)`
      scrim.style.opacity = String(progress)
      root.style.setProperty('--sheet-progress', progress.toFixed(4))
    }
    const s = new Spring(window.innerHeight, apply, {
      onRest: () => {
        if (!openRef.current) onClosedRef.current()
      },
    })
    apply(s.value)
    spring.current = s

    return () => {
      s.stop()
      spring.current = null
      root.classList.remove('sheet-active')
      root.style.removeProperty('--sheet-progress')
      if (page) page.style.transformOrigin = ''
    }
  }, [])

  useLayoutEffect(() => {
    const s = spring.current
    const sheet = sheetRef.current
    if (!s || !sheet) return
    if (open) s.to(0, { damping: 1, response: 0.42 })
    else s.to(sheet.offsetHeight + 32, { damping: 1, response: 0.36 })
  }, [open])

  // Focus moves into the sheet, and returns to the card that opened it.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    closeRef.current?.focus({ preventScroll: true })
    return () => previous?.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0 || (e.target as HTMLElement).closest('button, a') || !spring.current) return
    e.currentTarget.setPointerCapture(e.pointerId)
    // Grab it mid-flight: start from where it is on screen right now.
    spring.current.stop()
    drag.current = { pointerId: e.pointerId, startY: e.clientY, startValue: spring.current.value, tracking: false }
    tracker.current.reset()
    tracker.current.add(e.clientY)
  }

  const onPointerMove = (e: PointerEvent) => {
    const d = drag.current
    const s = spring.current
    const sheet = sheetRef.current
    if (!d || !s || !sheet || e.pointerId !== d.pointerId) return
    const dy = e.clientY - d.startY
    if (!d.tracking && Math.abs(dy) < 6) return
    d.tracking = true
    tracker.current.add(e.clientY)
    const y = d.startValue + dy
    // Resist upward drags instead of stopping dead at the top.
    s.set(y < 0 ? -rubberband(-y, sheet.offsetHeight) : y)
  }

  const onPointerUp = (e: PointerEvent) => {
    const d = drag.current
    const s = spring.current
    const sheet = sheetRef.current
    if (!d || !s || !sheet || e.pointerId !== d.pointerId) return
    drag.current = null

    const velocity = d.tracking ? tracker.current.velocity : 0
    const projected = s.value + projectMomentum(velocity)
    // Hand the finger's velocity to the spring so there's no seam on release.
    s.velocity = velocity
    if (openRef.current && projected > sheet.offsetHeight * 0.4) {
      onClose()
    } else if (openRef.current) {
      s.to(0, { damping: velocity === 0 ? 1 : 0.85, response: 0.32 })
    } else {
      s.to(sheet.offsetHeight + 32, { damping: 1, response: 0.36 })
    }
  }

  return (
    <div className="sheet-root">
      <div ref={scrimRef} className="sheet-scrim" onClick={onClose} />
      <div
        ref={sheetRef}
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        inert={!open}
      >
        <div
          className="sheet-top"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <span className="sheet-grabber" aria-hidden="true" />
          <ProjectArt project={project} />
          <button ref={closeRef} type="button" className="sheet-close" onClick={onClose} aria-label="Close">
            <Icon name="close" size={16} strokeWidth={2.4} />
          </button>
        </div>

        <div className="sheet-scroll">
          <p className="eyebrow">{project.tags.join(' · ')}</p>
          <h2 id="sheet-title" className="sheet-title">
            {project.title}
          </h2>
          <p className="sheet-tagline">{project.tagline}</p>

          <dl className="facts">
            <div>
              <dt>Role</dt>
              <dd>{project.role}</dd>
            </div>
            <div>
              <dt>Year</dt>
              <dd>{project.year}</dd>
            </div>
            <div>
              <dt>Stack</dt>
              <dd>{project.stack.join(', ')}</dd>
            </div>
          </dl>

          <div className="sheet-body">
            {project.description.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <h3 className="sheet-subhead">Highlights</h3>
          <ul className="highlights">
            {project.highlights.map((item) => (
              <li key={item}>
                <span className="highlight-check">
                  <Icon name="check" size={14} strokeWidth={2.6} />
                </span>
                {item}
              </li>
            ))}
          </ul>

          {project.links.length > 0 && (
            <div className="sheet-links">
              {project.links.map((link, i) => (
                <a
                  key={link.label}
                  href={link.href}
                  className={`button ${i === 0 ? 'button-primary' : 'button-secondary'}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {link.label}
                  <Icon name="arrowUpRight" size={16} />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
