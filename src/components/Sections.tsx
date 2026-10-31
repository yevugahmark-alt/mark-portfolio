import { useEffect, useRef, type CSSProperties } from 'react'
import { experience, profile, projects, skills, type Project } from '../data'
import { Icon, type IconName } from './Icon'
import { CountUp, SplitWords } from './Motion'
import { ProjectArt } from './ProjectArt'

const stagger = (i: number) => ({ '--i': i }) as CSSProperties

/** Renders **bold** segments from the data file. */
function RichText({ text }: { text: string }) {
  return (
    <>{text.split(/\*\*(.+?)\*\*/g).map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : part))}</>
  )
}

function SectionHead({ eyebrow, title, lead }: { eyebrow: string; title: string; lead?: string }) {
  return (
    <header className="section-head">
      <p className="eyebrow" data-reveal>
        {eyebrow}
      </p>
      <h2 className="title" data-reveal="words">
        <SplitWords text={title} />
      </h2>
      {lead && (
        <p className="section-lead" data-reveal style={stagger(2)}>
          {lead}
        </p>
      )}
    </header>
  )
}

export function Work({ onOpen }: { onOpen: (project: Project) => void }) {
  return (
    <section id="work" className="section">
      <div className="container">
        <SectionHead
          eyebrow="Selected work"
          title="Things I've made."
          lead="A few projects I'm proud of. Tap any of them for the full story."
        />
        <ul className="work-grid">
          {projects.map((project, i) => (
            <li
              key={project.id}
              className={project.featured ? 'featured' : undefined}
              data-reveal="card"
              style={stagger(i % 2)}
            >
              <div className="card-tilt" data-tilt={project.featured ? 3 : 5}>
                <button
                  type="button"
                  className="card"
                  onClick={() => onOpen(project)}
                  aria-label={`${project.title}: ${project.tagline}`}
                >
                  <ProjectArt project={project} />
                  <span className="card-body">
                    <span className="card-meta">
                      <span>{project.tags.join(' · ')}</span>
                      <span>{project.year}</span>
                    </span>
                    <span className="card-title">{project.title}</span>
                    <span className="card-tagline">{project.tagline}</span>
                    <span className="card-more">
                      Learn more <Icon name="chevronRight" size={16} />
                    </span>
                  </span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

const skillIcons: Record<string, IconName> = {
  Engineering: 'code',
  Design: 'pen',
  Tools: 'tool',
}

export function About() {
  return (
    <section id="about" className="section section-alt">
      <div className="container">
        <SectionHead eyebrow="About" title="Design-minded engineer." />
        <div className="about-grid">
          <div className="portrait-frame" data-reveal aria-hidden="true">
            <div className="portrait" data-tilt="8">
              <span className="portrait-ring" />
              <span className="depth" data-parallax="-0.12">
                {profile.initials}
              </span>
            </div>
          </div>
          <div className="about-copy">
            {profile.about.map((paragraph, i) => (
              <p key={i} data-reveal style={stagger(i)}>
                <RichText text={paragraph} />
              </p>
            ))}
            <dl className="stats" data-reveal style={stagger(3)}>
              {profile.stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="stat-label">{stat.label}</dt>
                  <dd className="stat-value">
                    <CountUp value={stat.value} />
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div id="skills" className="skills">
          {skills.map((group, i) => (
            <div key={group.group} className="skill-group" data-reveal style={stagger(i)}>
              <h3>
                <span className="skill-icon">
                  <Icon name={skillIcons[group.group] ?? 'sparkle'} size={18} />
                </span>
                {group.group}
              </h3>
              <ul className="chips">
                {group.items.map((item, c) => (
                  <li key={item} className="chip" style={{ '--c': c } as CSSProperties}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/** Fills the timeline rail as you scroll, lighting each role as it's reached. */
function useTimelineProgress() {
  const ref = useRef<HTMLOListElement>(null)
  useEffect(() => {
    const list = ref.current
    if (!list) return
    let frame = 0
    const update = () => {
      frame = 0
      const line = window.innerHeight * 0.6
      const r = list.getBoundingClientRect()
      const progress = Math.min(Math.max((line - r.top) / r.height, 0), 1)
      list.style.setProperty('--tp', progress.toFixed(4))
      for (const item of Array.from(list.children)) {
        item.classList.toggle('is-reached', item.getBoundingClientRect().top + 40 < line)
      }
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
  }, [])
  return ref
}

export function Experience() {
  const timelineRef = useTimelineProgress()
  return (
    <section id="experience" className="section">
      <div className="container">
        <SectionHead eyebrow="Experience" title="Where I've worked." />
        <ol className="timeline" ref={timelineRef}>
          {experience.map((job, i) => (
            <li key={job.period} data-reveal style={stagger(i)}>
              <span className="period">{job.period}</span>
              <div>
                <h3 className="job-title">{job.title}</h3>
                <p className="job-company">{job.company}</p>
                <p className="job-summary">{job.summary}</p>
              </div>
            </li>
          ))}
        </ol>
        <a href={profile.resume} className="button-link resume-link" data-reveal>
          Download résumé
          <Icon name="arrowUpRight" size={18} />
        </a>
      </div>
    </section>
  )
}

export function Contact({ onCopyEmail }: { onCopyEmail: () => void }) {
  return (
    <section id="contact" className="section section-alt contact">
      <div className="container">
        <p className="eyebrow" data-reveal>
          Contact
        </p>
        <h2 className="title contact-title" data-reveal="words">
          <SplitWords text="Let's build something" accent="great." />
        </h2>
        <p className="section-lead" data-reveal style={stagger(2)}>
          Have a project in mind, or just want to say hello? My inbox is always open.
        </p>
        <div className="contact-actions" data-reveal style={stagger(3)}>
          <a href={`mailto:${profile.email}`} className="button button-primary" data-magnetic>
            <Icon name="mail" size={18} />
            Say hello
          </a>
          <button type="button" className="button button-secondary" onClick={onCopyEmail} data-magnetic>
            <Icon name="copy" size={18} />
            Copy email
          </button>
        </div>
        <ul className="socials" data-reveal style={stagger(4)}>
          {profile.socials.map((social) => (
            <li key={social.label}>
              <a
                href={social.href}
                className="social"
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
                data-magnetic="0.4"
              >
                <Icon name={social.icon} size={20} />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="footer container">
      <span>
        © {new Date().getFullYear()} {profile.name}
      </span>
      <span>Designed & built with care.</span>
      <a href="#top" className="back-to-top" data-magnetic="0.25">
        Back to top
        <Icon name="arrowRight" size={14} />
      </a>
    </footer>
  )
}
