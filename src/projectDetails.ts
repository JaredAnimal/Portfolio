export interface ProjectMetric {
  caption: string
  /** Add a verified measurement when available; an omitted value stays a placeholder. */
  value?: string
}

export interface ProjectLink {
  label: string
  /** Leave empty until the project destination is ready to share. */
  href?: string
  /** Opens the supplied source in the page instead of navigating away. */
  source?: 'picklebot'
  /** Downloadable release assets should not open another tab. */
  download?: boolean
}

export const dartRobotLinks: ProjectLink[] = [
  { label: 'District showcase video', href: 'https://sites.google.com/sandi.net/sdusdccte-innovation-showcase/home' },
  { label: 'Project files' },
]
