import { useState } from 'react'
import type { ProjectLink, ProjectMetric } from '../projectDetails'
import SourceCodeViewer from './SourceCodeViewer'
import './ProjectDetails.css'

export function ProjectMetrics({ metrics, compact = false }: { metrics: ProjectMetric[]; compact?: boolean }) {
  if (!metrics.length) return null
  return <dl className={`project-metrics${compact ? ' project-metrics--compact' : ''}`} aria-label="Project metrics">
    {metrics.map(metric => <div key={metric.caption} data-metric-pending={metric.value ? undefined : ''}>
      <dt>{metric.caption}</dt>
      <dd>{metric.value ?? <><span aria-hidden="true">—</span><span className="sr-only">Measurement to come</span></>}</dd>
    </div>)}
  </dl>
}

function LinkIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="m9 15 6-6m-5-3 2-2a5 5 0 0 1 7 7l-2 2m-3 5-2 2a5 5 0 0 1-7-7l2-2" /></svg>
}

export function ProjectLinks({ links, compact = false }: { links: ProjectLink[]; compact?: boolean }) {
  const [sourceOpen, setSourceOpen] = useState(false)
  if (!links.length) return null
  return <><ul className={`project-links${compact ? ' project-links--compact' : ''}`} aria-label="Project links">
    {links.map(link => <li key={link.label}>
      {link.source === 'picklebot' ? <button type="button" onClick={() => setSourceOpen(true)} aria-haspopup="dialog"><LinkIcon /><span>{link.label}</span></button>
        : link.href ? <a href={link.href} download={link.download || undefined} target={link.download ? undefined : '_blank'} rel={link.download ? undefined : 'noreferrer'}><LinkIcon /><span>{link.label}</span>{!link.download && <span className="sr-only"> (opens in a new tab)</span>}</a>
        : <span className="project-link-pending" data-project-link-slot={link.label}><LinkIcon /><span>{link.label}</span><small>Coming soon</small></span>}
    </li>)}
  </ul>{sourceOpen && <SourceCodeViewer onClose={() => setSourceOpen(false)} />}</>
}
