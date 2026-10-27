export interface ProjectMetric {
  caption: string
  /** Add a verified measurement when available; an omitted value stays a placeholder. */
  value?: string
}

export interface ProjectLink {
  label: string
  /** Leave empty until the project destination is ready to share. */
  href?: string
}

export const dartRobotLinks: ProjectLink[] = [
  { label: 'Build video' },
  { label: 'Project files' },
]
