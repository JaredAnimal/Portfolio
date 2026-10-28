import { lazy, Suspense } from 'react'
import { projects } from '../projects'
import type { ProjectKind } from '../projects'
import { pickleballProjects } from '../pickleballProjects'
import type { PickleballProjectId } from '../pickleballProjects'
import PlaceholderArt from './PlaceholderArt'
import Photo from './Photo'
import { sunflowerPhotos } from '../photos'
import { ProjectLinks, ProjectMetrics } from './ProjectDetails'
import { dartRobotLinks } from '../projectDetails'
import './ProjectPage.css'

const PickleballNetScene = lazy(() => import('./PickleballNetScene'))
export type ProjectPageId = ProjectKind | 'dart-robot' | PickleballProjectId
export const projectHref = (id: ProjectPageId) => `#/projects/${id === 'pilight' ? 'brightlight' : id}`
export function projectTitle(id: ProjectPageId) { return projects.find(item => item.id === id)?.title ?? pickleballProjects.find(item => item.id === id)?.title ?? 'Dart-launching robot' }
type Props = { projectId: ProjectPageId; onOpenMenu?: (projectId: ProjectPageId) => void }

function Arrow({ back = false }: { back?: boolean }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true" focusable="false"><path d={back ? 'M20 12H4m6-6-6 6 6 6' : 'M4 12h16m-6-6 6 6-6 6'} /></svg>
}

function PhotoSpace({ projectId, title, number, caption, wide = false }: { projectId: ProjectKind | 'dart-robot'; title: string; number: string; caption: string; wide?: boolean }) {
  return <figure className={`project-page-photo ${wide ? 'project-page-photo-wide' : ''}`}>
    <PlaceholderArt kind={projectId} label={title} className="blank-photo" variant={number === '02' ? 'detail' : number === '03' ? 'secondary' : 'default'} />
    <figcaption><span>{number} / {caption}</span></figcaption>
  </figure>
}

export function NetProjectMedia() {
  return <div className="net-project-media"><Suspense fallback={<div className="net-scene-loading">Loading net model…</div>}><PickleballNetScene /></Suspense></div>
}

export default function ProjectPage({ projectId, onOpenMenu }: Props) {
  const project = projects.find(item => item.id === projectId)
  const pickleball = pickleballProjects.find(item => item.id === projectId)
  const title = projectTitle(projectId)
  const status = project?.status ?? pickleball?.status ?? (pickleball ? 'Club project' : 'Robotics project')
  const tags = project?.tags ?? pickleball?.tags ?? ['Robotics', 'Mechanical design']
  const overview = project?.overview ?? pickleball?.overview ?? 'I built a dart-launching robot. See the district innovation showcase for the project presentation.'
  const links = project?.links ?? pickleball?.links ?? dartRobotLinks
  const metrics = project?.metrics ?? pickleball?.metrics ?? []
  const related = projectId === 'pilight' ? projects.find(item => item.id === 'line-follower') : projects.find(item => item.id === 'pilight')

  return <main id="main" className="project-page">
    <article className="project-page-inner page-width">
      <nav className="project-page-breadcrumb" aria-label="Project breadcrumb">
        <a href="#/projects"><Arrow back />All projects</a><span aria-hidden="true">/</span><span>{title}</span>
        {onOpenMenu && <button type="button" className="project-page-menu-button" onClick={() => onOpenMenu(projectId)} aria-haspopup="dialog">Project menu <Arrow /></button>}
      </nav>
      <header className="project-page-header">
        <div className="project-page-title-group"><p className="project-page-kicker">{pickleball ? `PICKLEBALL / ${pickleball.kind}` : project?.eyebrow ?? 'ROBOTICS'}</p><h1>{title}</h1></div>
        <dl className="project-page-metadata"><div><dt>STATUS</dt><dd><span className="project-page-status-dot" />{status}</dd></div><div><dt>WORKING WITH</dt><dd className="project-page-tags">{tags.map(tag => <span key={tag}>{tag}</span>)}</dd></div></dl>
      </header>
      <ProjectLinks links={links} /><ProjectMetrics metrics={metrics} />

      {projectId === 'sunflower' ? <figure className="project-page-photo project-page-photo-wide project-page-photo-real sunflower-lead-figure"><Photo photo={sunflowerPhotos[0]} className="project-page-photo-lead sunflower-crop" loading="eager" /><figcaption><span>{sunflowerPhotos[0].caption}</span></figcaption></figure>
        : projectId === 'net-tensioner' ? <NetProjectMedia />
        : !pickleball && <PhotoSpace projectId={projectId as ProjectKind | 'dart-robot'} title={title} number="01" caption="PROJECT OVERVIEW" wide />}

      <section className="project-page-overview" aria-labelledby="project-overview-title"><div><h2 id="project-overview-title">Overview</h2></div><div className="project-page-overview-copy"><p>{overview}</p></div></section>

      {project && <section className="project-page-contributions" aria-labelledby="project-focus-title"><div className="project-page-section-head"><h2 id="project-focus-title">Design and implementation</h2></div><div className="project-page-contribution-grid">{project.contributions.map((contribution, index) => <section key={contribution.title}><span className="project-page-contribution-number">0{index + 1}</span><h3>{contribution.title}</h3><p>{contribution.text}</p></section>)}</div></section>}
      {pickleball && <section className="project-page-implementation" aria-labelledby="project-implementation-title"><h2 id="project-implementation-title">Implementation</h2><ul>{pickleball.details.map(detail => <li key={detail}>{detail}</li>)}</ul></section>}

      {projectId === 'sunflower' ? <div className="project-page-photo-grid project-page-photo-grid--sunflower" role="group" aria-label="USS Sunflower photo gallery">{sunflowerPhotos.slice(1).map(photo => <figure className="project-page-photo project-page-photo-real" key={photo.id}><Photo photo={photo} className="project-page-photo-detail" /><figcaption><span>{photo.caption}</span></figcaption></figure>)}</div>
        : !pickleball && projectId !== 'wind-turbine' && <div className="project-page-photo-grid"><PhotoSpace projectId={projectId as ProjectKind | 'dart-robot'} title={title} number="02" caption="DETAIL" /><PhotoSpace projectId={projectId as ProjectKind | 'dart-robot'} title={title} number="03" caption="BUILD" /></div>}

      {related && <section className="project-page-next" aria-label="Related project"><a className="project-page-related" href={projectHref(related.id)}><div><span className="project-page-kicker">Related project</span><h2>{related.title}</h2><p>{related.summary}</p></div><span className="project-page-related-arrow"><Arrow /></span></a></section>}
      <div className="project-page-bottom"><a href="#/projects"><Arrow back />All projects</a><a href="mailto:jaredashman0209@gmail.com">Contact Jared <Arrow /></a></div>
    </article>
  </main>
}
