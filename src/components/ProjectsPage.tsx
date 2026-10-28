import { projects } from '../projects'
import { pickleballProjects } from '../pickleballProjects'
import { projectHref } from './ProjectPage'
import type { ProjectPageId } from './ProjectPage'
import { ProjectMetrics } from './ProjectDetails'
import type { ProjectMetric } from '../projectDetails'
import './ProjectsPage.css'

type Entry = { id: ProjectPageId; title: string; summary: string; tags: string[]; metrics: ProjectMetric[] }

function Arrow({ direction = 'forward' }: { direction?: 'forward' | 'back' | 'diagonal' }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true" focusable="false"><path d={direction === 'diagonal' ? 'M6 18 18 6M6 6h12v12' : direction === 'back' ? 'M20 12H4m6-6-6 6 6 6' : 'M4 12h16m-6-6 6 6-6 6'} /></svg>
}

export default function ProjectsPage() {
  const engineering: Entry[] = [...projects, { id: 'dart-robot', title: 'Dart-launching robot', summary: 'A robotic dart launcher featured in the district innovation showcase.', tags: ['Robotics', 'Mechanical design'], metrics: [] }]
  return <main id="main" className="projects-page page-width">
    <nav className="project-page-breadcrumb" aria-label="Projects breadcrumb"><a href="#top"><Arrow direction="back" />Home</a></nav>
    <header className="projects-page-header"><h1>Projects</h1><p>Hardware, software, and club projects, with design details, results, and source material.</p></header>
    {[{ title: 'Engineering', items: engineering }, { title: 'Pickleball', items: pickleballProjects }].map(group => <section className="projects-collection" key={group.title} aria-labelledby={`collection-${group.title.toLowerCase()}`}><h2 id={`collection-${group.title.toLowerCase()}`}>{group.title}</h2><div className="projects-directory">{group.items.map(item => <article className="projects-directory-card" key={item.id}><a href={projectHref(item.id)} className="projects-directory-title"><h3>{item.title}</h3><Arrow direction="diagonal" /></a><p>{item.summary}</p><div className="project-tags">{item.tags.map(tag => <span key={tag}>{tag}</span>)}</div><ProjectMetrics metrics={item.metrics} compact /><a href={projectHref(item.id)} className="text-link">View project <Arrow /><span className="sr-only">: {item.title}</span></a></article>)}</div></section>)}
  </main>
}
