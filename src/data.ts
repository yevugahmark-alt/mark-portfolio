// All portfolio content lives here. Replace the placeholder copy with your own.
// Every section, card, and search result is generated from this file.

export type SocialIcon = 'github' | 'linkedin' | 'x'

export interface Social {
  label: string
  href: string
  icon: SocialIcon
}

export interface Project {
  id: string
  title: string
  tagline: string
  year: string
  role: string
  description: string[]
  highlights: string[]
  stack: string[]
  tags: string[]
  /** Solid colour for the generated cover art. */
  color: string
  featured?: boolean
  links: { label: string; href: string }[]
}

export interface Job {
  period: string
  title: string
  company: string
  summary: string
}

export const profile = {
  name: 'Yevugah Mark',
  initials: 'YM',
  role: 'Software Engineer & Product Designer',
  location: 'Remote, open to relocation',
  available: true,
  /** The hero's large word cycles through these. */
  heroWords: ['Design', 'Build', 'Craft', 'Ship'],
  heroCallouts: ['Interaction design', 'Front-end engineering'],
  heroCards: [
    { title: 'Currently', text: 'Building Aurora, a calm task manager for deep work.' },
    { title: 'Focus', text: 'Interaction design, motion, and front-end architecture.' },
  ],
  intro:
    'I design and engineer digital products with obsessive attention to detail: interfaces that respond instantly, move naturally, and get out of your way.',
  email: 'hello@example.com',
  resume: '#',
  about: [
    "I'm a software engineer who lives at the intersection of **design and code**. I care about the small things: the way a button responds to your touch, how a sheet follows your finger, how type breathes on the page.",
    'Over the years I have shipped products used by thousands of people, built design systems from scratch, and led teams that value **craft over shortcuts**.',
    "When I'm not building, I'm studying typography, sketching interfaces, or reading about how great tools are made.",
  ],
  stats: [
    { value: '5+', label: 'Years building' },
    { value: '30+', label: 'Projects shipped' },
    { value: '12', label: 'Happy clients' },
  ],
  socials: [
    { label: 'GitHub', href: 'https://github.com/', icon: 'github' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/', icon: 'linkedin' },
    { label: 'X', href: 'https://x.com/', icon: 'x' },
  ] satisfies Social[],
}

export const navLinks = [
  { id: 'work', label: 'Work' },
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'contact', label: 'Contact' },
]

export const skills: { group: string; items: string[] }[] = [
  {
    group: 'Engineering',
    items: ['TypeScript', 'React', 'Node.js', 'Next.js', 'PostgreSQL', 'GraphQL', 'Testing'],
  },
  {
    group: 'Design',
    items: ['Interaction design', 'Design systems', 'Prototyping', 'Motion', 'Typography', 'Accessibility'],
  },
  {
    group: 'Tools',
    items: ['Figma', 'Git', 'Vite', 'Docker', 'Vercel', 'Linear'],
  },
]

export const projects: Project[] = [
  {
    id: 'aurora',
    title: 'Aurora',
    tagline: 'A calm, focused task manager for deep work.',
    year: '2026',
    role: 'Design & Engineering',
    featured: true,
    description: [
      'Aurora rethinks the to-do list around focus. Instead of an endless backlog, it surfaces only what matters today and gently tucks everything else away.',
      'Every interaction is built on interruptible spring physics, so dragging, reordering, and dismissing tasks feels as direct as moving paper on a desk.',
    ],
    highlights: [
      'Offline-first sync with conflict-free merges',
      'Gesture-driven reordering with momentum',
      'Sub-50ms interaction latency on mid-range phones',
    ],
    stack: ['React', 'TypeScript', 'IndexedDB', 'Service Workers'],
    tags: ['Product', 'Web app'],
    color: '#5e5ce6',
    links: [
      { label: 'Live site', href: '#' },
      { label: 'Source', href: '#' },
    ],
  },
  {
    id: 'pulse',
    title: 'Pulse',
    tagline: 'Health insights that are easy to read at a glance.',
    year: '2025',
    role: 'Lead Engineer',
    description: [
      'Pulse turns raw health data into clear, honest charts. The goal was to make trends understandable in under three seconds.',
    ],
    highlights: [
      'Custom charting engine rendering 100k points at 60fps',
      'Fully accessible charts with screen-reader summaries',
    ],
    stack: ['React', 'D3', 'Node.js', 'PostgreSQL'],
    tags: ['Data viz', 'Mobile'],
    color: '#e8334f',
    links: [{ label: 'Case study', href: '#' }],
  },
  {
    id: 'atlas',
    title: 'Atlas',
    tagline: 'A design system used across five product teams.',
    year: '2025',
    role: 'Design Systems',
    description: [
      'Atlas unified the look and feel of five products under one set of tokens, components, and motion guidelines.',
    ],
    highlights: [
      '60+ accessible components with full keyboard support',
      'Automatic light and dark themes from a single token set',
      'Cut UI build time for new features by roughly 40%',
    ],
    stack: ['TypeScript', 'React', 'Storybook', 'Figma'],
    tags: ['Design system', 'Open source'],
    color: '#0a84ff',
    links: [{ label: 'Documentation', href: '#' }],
  },
  {
    id: 'waveform',
    title: 'Waveform',
    tagline: 'A podcast player built around the listening experience.',
    year: '2024',
    role: 'Full-stack Engineer',
    description: [
      'Waveform makes long-form audio easier to navigate with chapter scrubbing, smart skip, and transcripts that follow along.',
    ],
    highlights: ['Scrubbing with velocity-aware momentum', 'Synced, searchable transcripts'],
    stack: ['React', 'Web Audio API', 'Go'],
    tags: ['Audio', 'Web app'],
    color: '#248a3d',
    links: [{ label: 'Live site', href: '#' }],
  },
  {
    id: 'ledger',
    title: 'Ledger',
    tagline: 'Personal finance without the spreadsheets.',
    year: '2023',
    role: 'Design & Engineering',
    description: [
      'Ledger categorises spending automatically and explains where your money goes in plain language.',
    ],
    highlights: ['Bank-grade encryption end to end', 'Natural-language spending summaries'],
    stack: ['Next.js', 'TypeScript', 'Prisma'],
    tags: ['Fintech', 'Product'],
    color: '#48484a',
    links: [{ label: 'Case study', href: '#' }],
  },
]

export const experience: Job[] = [
  {
    period: '2024 to Present',
    title: 'Senior Software Engineer',
    company: 'Company Name',
    summary:
      'Leading front-end architecture and interaction design for the core product. Built the motion system and mentored four engineers.',
  },
  {
    period: '2022 to 2024',
    title: 'Product Engineer',
    company: 'Studio Name',
    summary:
      'Shipped web and mobile products for startups end to end, from first prototype to production.',
  },
  {
    period: '2021 to 2022',
    title: 'Front-end Developer',
    company: 'Agency Name',
    summary: 'Built marketing sites and design systems for clients across fintech and health.',
  },
]
