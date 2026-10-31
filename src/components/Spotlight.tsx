import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type RefObject,
} from 'react'
import { rankItems, type SearchItem } from '../lib/search'
import { Spring } from '../lib/spring'
import { Icon } from './Icon'

interface SpotlightProps {
  open: boolean
  items: SearchItem[]
  anchorRef: RefObject<HTMLElement | null>
  onClose: () => void
}

function Highlight({ text, indices }: { text: string; indices: number[] }) {
  if (!indices.length) return <>{text}</>
  const marked = new Set(indices)
  const parts: { text: string; mark: boolean }[] = []
  for (let i = 0; i < text.length; i++) {
    const mark = marked.has(i)
    const last = parts[parts.length - 1]
    if (last && last.mark === mark) last.text += text[i]
    else parts.push({ text: text[i], mark })
  }
  return <>{parts.map((part, i) => (part.mark ? <mark key={i}>{part.text}</mark> : part.text))}</>
}

export function Spotlight({ open, items, anchorRef, onClose }: SpotlightProps) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const highlightRef = useRef<HTMLLIElement>(null)
  const highlight = useRef<{ y: Spring; h: Spring } | null>(null)
  const restoreFocus = useRef<HTMLElement | null>(null)

  const results = useMemo(() => rankItems(items, query), [items, query])
  const hasQuery = query.trim().length > 0

  // Grow out of the search button so the panel's origin is obvious.
  useLayoutEffect(() => {
    const panel = panelRef.current
    if (!open || !panel) return
    const anchor = anchorRef.current?.getBoundingClientRect()
    panel.style.transformOrigin =
      anchor && anchor.width > 0
        ? `${anchor.left + anchor.width / 2 - panel.offsetLeft}px ${anchor.top + anchor.height / 2 - panel.offsetTop}px`
        : 'center top'
  }, [open, anchorRef])

  useEffect(() => {
    if (open) {
      restoreFocus.current = document.activeElement as HTMLElement | null
      inputRef.current?.focus({ preventScroll: true })
      return
    }
    restoreFocus.current?.focus({ preventScroll: true })
  }, [open])

  // One selection highlight that glides between rows on two springs (position
  // and height), so moving through results reads as a single object travelling.
  useEffect(() => {
    const el = highlightRef.current
    if (!el) return
    let y = 0
    let h = 0
    const apply = () => {
      el.style.transform = `translateY(${y.toFixed(2)}px)`
      el.style.height = `${h.toFixed(2)}px`
    }
    const springs = {
      y: new Spring(0, (v) => ((y = v), apply()), { precision: 0.1 }),
      h: new Spring(0, (v) => ((h = v), apply()), { precision: 0.1 }),
    }
    highlight.current = springs
    return () => {
      springs.y.stop()
      springs.h.stop()
      highlight.current = null
    }
  }, [])

  const wasOpen = useRef(false)
  useLayoutEffect(() => {
    const springs = highlight.current
    const row = listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
    const justOpened = open && !wasOpen.current
    wasOpen.current = open
    if (!springs || !row || !open) return
    if (justOpened) {
      springs.y.set(row.offsetTop)
      springs.h.set(row.offsetHeight)
    } else {
      springs.y.to(row.offsetTop, { damping: 1, response: 0.28 })
      springs.h.to(row.offsetHeight, { damping: 1, response: 0.28 })
    }
    row.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, results, open])

  const close = () => {
    onClose()
    // Clear after the panel has dematerialised so the text doesn't vanish mid-exit.
    window.setTimeout(() => {
      setQuery('')
      setActiveIndex(0)
    }, 300)
  }

  const run = (item: SearchItem) => {
    close()
    requestAnimationFrame(() => item.run())
  }

  const onKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setActiveIndex((i) => (results.length ? (i + 1) % results.length : 0))
        break
      case 'ArrowUp':
        event.preventDefault()
        setActiveIndex((i) => (results.length ? (i - 1 + results.length) % results.length : 0))
        break
      case 'Enter':
        event.preventDefault()
        if (results[activeIndex]) run(results[activeIndex].item)
        break
      case 'Escape':
        event.preventDefault()
        close()
        break
      case 'Tab':
        event.preventDefault()
        break
    }
  }

  const activeId = results[activeIndex] ? `spotlight-${results[activeIndex].item.id}` : undefined

  return (
    <div className="spotlight" data-open={open || undefined} inert={!open}>
      <div className="spotlight-scrim" onClick={close} />
      <div
        ref={panelRef}
        className="spotlight-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Search the portfolio"
        onKeyDown={onKeyDown}
      >
        <div className="spotlight-field">
          <Icon name="search" size={20} className="spotlight-field-icon" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActiveIndex(0)
            }}
            placeholder="Search projects, skills, sections…"
            role="combobox"
            aria-expanded="true"
            aria-controls="spotlight-results"
            aria-activedescendant={activeId}
            aria-autocomplete="list"
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button
              type="button"
              className="spotlight-clear"
              onClick={() => {
                setQuery('')
                setActiveIndex(0)
                inputRef.current?.focus()
              }}
              aria-label="Clear search"
            >
              <Icon name="close" size={12} />
            </button>
          )}
          <button type="button" className="spotlight-esc" onClick={close} aria-label="Close search">
            esc
          </button>
        </div>

        <ul
          id="spotlight-results"
          ref={listRef}
          className="spotlight-results"
          role="listbox"
          hidden={!results.length}
        >
          <li ref={highlightRef} className="spotlight-highlight" role="presentation" aria-hidden="true" />
          {results.map(({ item, indices }, index) => {
            const showGroup = !hasQuery && item.kind !== results[index - 1]?.item.kind
            return (
              <li key={item.id} role="presentation" style={{ '--i': Math.min(index, 10) } as CSSProperties}>
                {showGroup && (
                  <div className="spotlight-group" aria-hidden="true">
                    {item.kind}
                  </div>
                )}
                <div
                  id={`spotlight-${item.id}`}
                  data-index={index}
                  role="option"
                  aria-selected={index === activeIndex}
                  className="spotlight-item"
                  onPointerMove={() => index !== activeIndex && setActiveIndex(index)}
                  onClick={() => run(item)}
                >
                  <span className="spotlight-icon">{item.icon}</span>
                  <span className="spotlight-text">
                    <span className="spotlight-title">
                      <Highlight text={item.title} indices={indices} />
                    </span>
                    {item.subtitle && <span className="spotlight-subtitle">{item.subtitle}</span>}
                  </span>
                  {hasQuery && <span className="spotlight-kind">{item.kind}</span>}
                  <Icon name="chevronRight" size={16} className="spotlight-chevron" />
                </div>
              </li>
            )
          })}
        </ul>
        {!results.length && (
          <div className="spotlight-empty" role="status">
            <span className="spotlight-empty-icon" aria-hidden="true">
              <Icon name="search" size={22} />
            </span>
            <p className="spotlight-empty-title">No results for “{query}”</p>
            <p className="spotlight-empty-hint">Try a project name, a skill like React, or a section.</p>
          </div>
        )}

        <div className="spotlight-footer" aria-hidden="true">
          <span className="spotlight-count">
            {results.length} {results.length === 1 ? 'result' : 'results'}
          </span>
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> navigate
          </span>
          <span>
            <kbd>↵</kbd> open
          </span>
        </div>
      </div>
    </div>
  )
}
