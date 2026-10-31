import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { Icon } from './components/Icon'
import { Nav } from './components/Nav'
import { ProjectSheet } from './components/ProjectSheet'
import { Hero } from './components/Hero'
import { Marquee } from './components/Motion'
import { About, Contact, Experience, Footer, Work } from './components/Sections'
import { Spotlight } from './components/Spotlight'
import { navLinks, profile, projects, skills, type Project } from './data'
import { useActiveSection, useReveal, useScrollLock, useTheme, useToast } from './hooks'
import { attachEffects } from './lib/effects'
import type { SearchItem } from './lib/search'

// 'top' is observed too, so the nav highlight clears when you're back on the hero.
const sectionIds = ['top', ...navLinks.map((link) => link.id)]
const sectionIcons = { work: 'grid', about: 'user', experience: 'briefcase', contact: 'mail' } as const

const scrollToId = (id: string) => document.getElementById(id)?.scrollIntoView()

function App() {
  const [theme, toggleTheme] = useTheme()
  const [searchOpen, setSearchOpen] = useState(false)
  const [project, setProject] = useState<Project | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const { toast, showToast } = useToast()
  const searchButtonRef = useRef<HTMLButtonElement>(null)
  const active = useActiveSection(sectionIds)

  useReveal()
  useEffect(() => attachEffects(), [])
  useScrollLock(searchOpen || project !== null)

  const openProject = useCallback((p: Project) => {
    setProject(p)
    setSheetOpen(true)
  }, [])
  const closeSheet = useCallback(() => setSheetOpen(false), [])
  const onSheetClosed = useCallback(() => setProject(null), [])

  const copyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      showToast('Email copied to clipboard')
    } catch {
      window.location.href = `mailto:${profile.email}`
    }
  }, [showToast])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const typing = target.isContentEditable || /INPUT|TEXTAREA|SELECT/.test(target.tagName)
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault()
        setSearchOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const searchItems = useMemo<SearchItem[]>(
    () => [
      ...navLinks.map((link) => ({
        id: `section-${link.id}`,
        kind: 'Jump to' as const,
        title: link.label,
        icon: <Icon name={sectionIcons[link.id as keyof typeof sectionIcons]} size={18} />,
        run: () => scrollToId(link.id),
      })),
      ...projects.map((p) => ({
        id: `project-${p.id}`,
        kind: 'Projects' as const,
        title: p.title,
        subtitle: p.tagline,
        keywords: [...p.tags, ...p.stack, p.role].join(' '),
        icon: (
          <span className="spotlight-swatch" style={{ background: p.color }}>
            {p.title[0]}
          </span>
        ),
        run: () => openProject(p),
      })),
      ...skills.flatMap((group) =>
        group.items.map((skill) => ({
          id: `skill-${skill}`,
          kind: 'Skills' as const,
          title: skill,
          subtitle: group.group,
          icon: <Icon name="sparkle" size={18} />,
          run: () => scrollToId('skills'),
        })),
      ),
      ...profile.socials.map((social) => ({
        id: `link-${social.label}`,
        kind: 'Links' as const,
        title: social.label,
        subtitle: social.href.replace(/^https?:\/\//, ''),
        icon: <Icon name={social.icon} size={18} />,
        run: () => window.open(social.href, '_blank', 'noreferrer'),
      })),
      {
        id: 'action-copy-email',
        kind: 'Actions' as const,
        title: 'Copy email address',
        subtitle: profile.email,
        keywords: 'contact mail',
        icon: <Icon name="copy" size={18} />,
        run: copyEmail,
      },
      {
        id: 'action-theme',
        kind: 'Actions' as const,
        title: theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode',
        keywords: 'theme appearance dark light',
        icon: <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />,
        run: toggleTheme,
      },
      {
        id: 'action-resume',
        kind: 'Actions' as const,
        title: 'Download résumé',
        keywords: 'cv resume',
        icon: <Icon name="doc" size={18} />,
        run: () => window.open(profile.resume, '_blank', 'noreferrer'),
      },
    ],
    [openProject, copyEmail, theme, toggleTheme],
  )

  const overlay = searchOpen || sheetOpen

  return (
    <>
      <a className="skip-link" href="#work">
        Skip to content
      </a>
      <Nav
        active={active}
        theme={theme}
        onToggleTheme={toggleTheme}
        onSearch={() => setSearchOpen(true)}
        searchButtonRef={searchButtonRef}
        inert={overlay}
      />
      <main className="page" inert={overlay}>
        <Hero theme={theme} onSearch={() => setSearchOpen(true)} />
        <Work onOpen={openProject} />
        <About />
        <Marquee items={skills.flatMap((group) => group.items)} />
        <Experience />
        <Contact onCopyEmail={copyEmail} />
        <Footer />
      </main>

      <Spotlight
        open={searchOpen}
        items={searchItems}
        anchorRef={searchButtonRef}
        onClose={() => setSearchOpen(false)}
      />
      {project && (
        <ProjectSheet project={project} open={sheetOpen} onClose={closeSheet} onClosed={onSheetClosed} />
      )}

      <div className="toast" role="status" aria-live="polite" data-visible={toast.visible || undefined}>
        <Icon name="check" size={18} strokeWidth={2.4} />
        {toast.message}
      </div>
    </>
  )
}

export default App
