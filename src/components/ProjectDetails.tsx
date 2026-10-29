import { useEffect, useState } from 'react'
import type { ProjectLink, ProjectMetric } from '../projectDetails'
import SourceCodeViewer from './SourceCodeViewer'
import './ProjectDetails.css'

function DailyMetricValue({ getValue }: { getValue: (date: Date) => string }) {
  const [value, setValue] = useState(() => getValue(new Date()))
  useEffect(() => {
    const refresh = () => setValue(getValue(new Date()))
    refresh()
    const interval = window.setInterval(refresh, 60_000)
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      window.clearInterval(interval)
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [getValue])
  return <>{value}</>
}

export function ProjectMetrics({ metrics, compact = false }: { metrics: ProjectMetric[]; compact?: boolean }) {
  if (!metrics.length) return null
  return <dl className={`project-metrics${compact ? ' project-metrics--compact' : ''}`} aria-label="Project metrics">
    {metrics.map(metric => <div key={metric.caption} data-metric-pending={metric.value || metric.valueAtDate ? undefined : ''}>
      <dt>{metric.caption}</dt>
      <dd title={metric.valueAtDate ? 'Estimated total, updated daily' : undefined}>{metric.valueAtDate ? <DailyMetricValue getValue={metric.valueAtDate} /> : metric.value ?? <><span aria-hidden="true">—</span><span className="sr-only">Measurement to come</span></>}</dd>
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
