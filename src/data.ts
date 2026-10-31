// All portfolio content lives here.
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
  role: 'Frontend Developer',
  location: 'Legon, Accra, Ghana',
  available: true,
  /** The hero's large word cycles through these. */
  heroWords: ['Build', 'Design', 'Refine', 'Ship'],
  heroCallouts: ['React & TypeScript', 'Responsive interfaces'],
  heroCards: [
    { title: 'Currently', text: 'Frontend Developer at BCON Soft Technologies, leading the BST HR Management System.' },
    { title: 'Focus', text: 'Reusable UI components, microfrontends, and clean REST API integration.' },
  ],
  intro:
    'I build modern, responsive web applications with React, TypeScript and Tailwind CSS, backed by a foundation in accounting and customer service.',
  email: 'yevugahmark@gmail.com',
  resume: '/Mark-Yevugah-CV.pdf',
  about: [
    "I'm a **frontend developer** based in Accra. At BCON Soft Technologies I lead the frontend of an HR management system covering payroll, onboarding and employee management, and I contribute to a multi-tenant church management SaaS platform used by Ghanaian churches.",
    'My path into software started in **accounting**. I hold a BSc in Accounting from the University of Professional Studies, Accra, and worked in financial reporting, reconciliation and tax compliance before moving into development. That background shapes how I build: careful with data, focused on the people using the product.',
    'A stint in customer service on the DHL project at Concentrix taught me to listen first and solve problems quickly, which I bring to every feature I ship.',
  ],
  stats: [
    { value: '1.5+', label: 'Years in frontend' },
    { value: '7', label: 'Projects built' },
    { value: '3+', label: 'Years professional experience' },
  ],
  socials: [
    { label: 'GitHub', href: 'https://github.com/yevugahmark-alt', icon: 'github' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/mark-yevugah-739743283', icon: 'linkedin' },
    { label: 'X', href: 'https://x.com/vybhrantx', icon: 'x' },
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
    group: 'Frontend',
    items: [
      'React',
      'TypeScript',
      'JavaScript',
      'HTML',
      'CSS',
      'Tailwind CSS',
      'Vite',
      'Module Federation',
      'REST APIs',
      'Google Apps Script',
    ],
  },
  {
    group: 'Accounting & Finance',
    items: ['Financial reporting', 'Cash flow planning', 'Bookkeeping', 'Reconciliation', 'Tax compliance'],
  },
  {
    group: 'Tools',
    items: ['Git', 'Microsoft Office', 'QuickBooks', 'Tally', 'GIFMIS', 'Scala', 'Java (learning)'],
  },
]

export const projects: Project[] = [
  {
    id: 'church-management',
    title: 'Church Management System',
    tagline: 'A multi-tenant SaaS platform for Ghanaian churches.',
    year: '2026',
    role: 'Frontend Developer',
    featured: true,
    description: [
      'A multi-tenant church management platform that lets each church run its membership, groups and attendance from one place, with its own branding.',
      'Built as a microfrontend architecture using Vite and Module Federation, so separate parts of the app can be developed and deployed independently.',
    ],
    highlights: [
      'Role-based access control',
      'QR code check-in for services and events',
      'Member and group management',
      'Per-tenant theming',
    ],
    stack: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Module Federation'],
    tags: ['SaaS', 'Microfrontends', 'Web app'],
    color: '#5e5ce6',
    links: [],
  },
  {
    id: 'hr-management',
    title: 'BST HR Management System',
    tagline: 'Payroll, onboarding and employee management in one app.',
    year: '2025',
    role: 'Frontend Lead',
    description: [
      'I lead the frontend development of the BST HR Management System at BCON Soft Technologies, building the interfaces HR teams use day to day.',
    ],
    highlights: [
      'Payroll module',
      'Employee onboarding flows',
      'Employee records and management',
      'Integrated with backend REST APIs',
    ],
    stack: ['React', 'TypeScript', 'Tailwind CSS', 'REST APIs'],
    tags: ['HR', 'Web app'],
    color: '#0a84ff',
    links: [],
  },
  {
    id: 'sheets-pos',
    title: 'Google Sheets POS',
    tagline: 'A complete point of sale system built on Google Sheets.',
    year: '2025',
    role: 'Solo Developer',
    description: [
      'A retail point of sale system built with Google Apps Script on top of Google Sheets, giving small shops full retail management without extra software.',
    ],
    highlights: [
      'Barcode scanning',
      'Inventory tracking',
      'Sales processing',
      'Professional receipt generation',
    ],
    stack: ['Google Apps Script', 'Google Sheets', 'JavaScript'],
    tags: ['Retail', 'Automation'],
    color: '#248a3d',
    links: [],
  },
  {
    id: 'expense-tracker',
    title: 'Expense Tracker',
    tagline: 'Record, categorise and monitor daily spending.',
    year: '2025',
    role: 'Solo Developer',
    description: ['An app for recording daily expenses, sorting them into categories and keeping an eye on budgets.'],
    highlights: ['Expense categories', 'Budget monitoring'],
    stack: ['JavaScript'],
    tags: ['Finance', 'Web app'],
    color: '#e8334f',
    links: [],
  },
  {
    id: 'weather-app',
    title: 'Weather App',
    tagline: 'Live weather for any city via the OpenWeather API.',
    year: '2024',
    role: 'Solo Developer',
    description: ['A weather app that fetches current conditions for any city from the OpenWeather API.'],
    highlights: ['OpenWeather API integration'],
    stack: ['HTML', 'CSS', 'JavaScript'],
    tags: ['API', 'Vanilla JS'],
    color: '#ff9f0a',
    links: [],
  },
  {
    id: 'calculator',
    title: 'Calculator',
    tagline: 'A clean, responsive calculator.',
    year: '2024',
    role: 'Solo Developer',
    description: ['A calculator built with plain HTML, CSS and JavaScript.'],
    highlights: ['Responsive layout'],
    stack: ['HTML', 'CSS', 'JavaScript'],
    tags: ['Vanilla JS'],
    color: '#48484a',
    links: [],
  },
  {
    id: 'temperature-converter',
    title: 'Temperature Converter',
    tagline: 'Quick conversions between temperature scales.',
    year: '2024',
    role: 'Solo Developer',
    description: ['A temperature converter built with plain HTML, CSS and JavaScript.'],
    highlights: ['Instant conversion'],
    stack: ['HTML', 'CSS', 'JavaScript'],
    tags: ['Vanilla JS'],
    color: '#bf5af2',
    links: [],
  },
]

export const experience: Job[] = [
  {
    period: 'Apr 2025 to Present',
    title: 'Frontend Developer',
    company: 'BCON Soft Technologies, Abokobi',
    summary:
      'Lead frontend development of the BST HR Management System and contribute to a multi-tenant church management SaaS platform. Build reusable UI components with React, TypeScript and Tailwind CSS and integrate them with backend REST APIs.',
  },
  {
    period: 'Feb 2025 to Apr 2025',
    title: 'Accountant',
    company: 'Wedam Mall, Tema',
    summary:
      'Prepared financial reports for management, analysed retail sales trends, ran stock taking and reconciliations, supervised attendants, and handled tax filing.',
  },
  {
    period: 'Oct 2024 to Jan 2025',
    title: 'Customer Service Advisor, DHL Project',
    company: 'Concentrix, Accra',
    summary:
      'Resolved shipment tracking and delivery issues by phone and email, kept accurate customer records, and worked with internal teams on escalations.',
  },
  {
    period: 'Nov 2023 to Sep 2024',
    title: 'Assistant Accountant, National Service',
    company: 'CSIR Institute for Industrial Research, Accra',
    summary:
      'Maintained cash flow statements, performed bank reconciliations, processed tax filings, calculated depreciation on fixed assets, and kept payroll records.',
  },
  {
    period: 'Jul 2022 to Aug 2022',
    title: 'Assistant Accountant, Intern',
    company: 'CSIR Institute for Industrial Research, Accra',
    summary: 'Updated cash flow statements and journals in Scala and issued receipts, vouchers and invoices.',
  },
]
