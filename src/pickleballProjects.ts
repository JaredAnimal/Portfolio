import type { ProjectLink, ProjectMetric } from './projectDetails'
import { getEstimatedReservationsShared } from './reservationTotals'

export type PickleballProjectId = 'reservation-bot' | 'reservation-sharing' | 'net-tensioner'

export interface PickleballProject {
  id: PickleballProjectId
  title: string
  kind: 'Software' | 'Hardware'
  summary: string
  overview: string
  details: string[]
  tags: string[]
  metrics: ProjectMetric[]
  links: ProjectLink[]
  status?: string
}

export const pickleballProjects: PickleballProject[] = [
  {
    id: 'reservation-bot',
    title: 'Picklebot reservation bot',
    kind: 'Software',
    summary: 'A Windows automation tool for the club’s court-reservation workflow.',
    overview: 'Picklebot brings browser automation to court booking. The project is distributed as a Windows installer through UCLA Club Pickleball. Its documented JavaScript implementation uses Node.js and Playwright to coordinate browser actions around a target reservation time.',
    details: [
      'Use JavaScript, Node.js, and Playwright to drive the reservation browser flow.',
      'Coordinate timed reservation actions and repeated interactions with booking controls.',
      'Load login credentials from a local environment file and allow time for Duo verification.',
    ],
    tags: ['JavaScript', 'Node.js', 'Playwright', 'Browser automation'],
    status: 'Beta',
    metrics: [{ caption: 'Booking turnaround', value: '<0.3 s' }],
    links: [{ label: 'Source code', source: 'picklebot' }, { label: 'Download Windows installer', href: 'https://github.com/JaredAnimal/UCLAPickleball/releases/download/picklebot-v0.2.6/Picklebot-Setup-0.2.6.exe', download: true }],
  },
  {
    id: 'reservation-sharing',
    title: 'Reservation-sharing website',
    kind: 'Software',
    summary: 'A shared club calendar for posting court reservations, finding games, and managing who’s playing.',
    overview: 'The UCLA Club Pickleball website gives players a shared place to organize games. A mobile-friendly calendar supports member and guest sign-in, reservation sharing, and player signups, with host and officer tools for managing games and attendees.',
    details: [
      'Build the application with TypeScript on Cloudflare Workers, with shared reservations stored in D1.',
      'Support Google sign-in, roster-linked members, guest players, and host/officer management of reservations and attendees.',
      'Enforce court capacity and practice-time rules on the server, and synchronize reservations with a Google Sheet through an Apps Script bridge.',
    ],
    tags: ['TypeScript', 'Cloudflare Workers', 'D1', 'Google Apps Script'],
    metrics: [{ caption: 'Reservations shared', valueAtDate: getEstimatedReservationsShared }],
    links: [{ label: 'View project repository', href: 'https://github.com/JaredAnimal/UCLAPickleball' }, { label: 'Visit project website', href: 'https://bit.ly/UCLAPB' }],
  },
  {
    id: 'net-tensioner',
    title: '3D-printed net base extension',
    kind: 'Hardware',
    summary: 'Designing an add-on that extends a pickleball net’s base, with the goal of increasing net tension.',
    overview: 'This project starts with a physical adjustment to the net setup: a 3D-printed add-on for the base. I’m designing the extension to increase the base’s effective length, with the goal of increasing tension in the net.',
    details: [
      'Design a 3D-printed add-on for the pickleball net’s base.',
      'Increase the base’s effective length to explore a way of increasing net tension.',
    ],
    tags: ['3D printing', 'Mechanical design', 'Prototyping'],
    status: 'In design',
    metrics: [{ caption: 'Added base length' }, { caption: 'Net tension' }],
    links: [{ label: 'Design files' }, { label: 'Build photos' }],
  },
]
