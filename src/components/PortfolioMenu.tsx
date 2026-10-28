import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import BrandMark from './BrandMark'
import PlaceholderArt from './PlaceholderArt'
import Photo from './Photo'
import { pickleballPhotos, sunflowerPhotos } from '../photos'
import { ProjectLinks, ProjectMetrics } from './ProjectDetails'
import { dartRobotLinks } from '../projectDetails'
import type { BoardPart } from './CircuitScene'
import { NetProjectMedia, projectHref } from './ProjectPage'
import type { ProjectPageId } from './ProjectPage'
import { projects } from '../projects'
import { roles } from '../experience'
import type { RoleId } from '../experience'
import { pickleballProjects } from '../pickleballProjects'
import type { PickleballProjectId } from '../pickleballProjects'
import './PortfolioMenu.css'

export type MenuSelection =
  | { type: 'part'; id: BoardPart }
  | { type: 'project'; id: ProjectPageId }
  | { type: 'role'; id: RoleId }
  | { type: 'pickleball-project'; id: PickleballProjectId; parent?: 'projects' | 'pickleball' }

type Props = {
  selection: MenuSelection | null
  onSelect: (selection: MenuSelection) => void
  onClose: () => void
  triggerRef: RefObject<HTMLElement | null>
}

const RESUME = `${import.meta.env.BASE_URL}Jared-Ashman-Resume.pdf`
const TRANSCRIPT = `${import.meta.env.BASE_URL}Jared-Ashman-Transcript.pdf`
const titles: Record<BoardPart, string> = { projects: 'Projects', experience: 'Experience', transcript: 'Transcript', about: 'About me', pickleball: 'UCLA Club Pickleball', resume: 'My résumé' }

function Arrow({ back = false }: { back?: boolean }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d={back ? 'M20 12H4m6-6-6 6 6 6' : 'M4 12h16m-6-6 6 6-6 6'} /></svg>
}
function Choice({ id, title, description, onClick }: { id: string; title: string; description: string; onClick: () => void }) {
  return <button type="button" className="submenu-choice" data-menu-item={id} onClick={onClick} aria-label={`Open ${title}`}><span className="submenu-choice-copy"><span className="submenu-choice-title">{title}</span><small>{description}</small></span><Arrow /></button>
}
function Tags({ values }: { values: string[] }) { return <div className="project-tags">{values.map(value => <span key={value}>{value}</span>)}</div> }
function isVisible(element: HTMLElement | null): element is HTMLElement { return !!element?.isConnected && element.getClientRects().length > 0 && getComputedStyle(element).visibility !== 'hidden' }

export default function PortfolioMenu({ selection, onSelect, onClose, triggerRef }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const returnItem = useRef<string | null>(null)
  const previousView = useRef<string | null>(null)
  const isOpen = selection !== null
  const viewKey = selection ? `${selection.type}:${selection.id}` : null

  useEffect(() => {
    const dialog = dialogRef.current
    if (!isOpen || !dialog) return
    const overflow = document.body.style.overflow
    const origin = triggerRef.current
    document.body.style.overflow = 'hidden'
    dialog.showModal()
    return () => {
      dialog.close()
      document.body.style.overflow = overflow
      previousView.current = null
      returnItem.current = null
      const mobileToggle = document.querySelector<HTMLElement>('.menu-toggle')
      const home = document.querySelector<HTMLElement>('.brand')
      const destination = isVisible(origin) ? origin : isVisible(mobileToggle) ? mobileToggle : home
      destination?.focus({ preventScroll: true })
    }
  }, [isOpen, triggerRef])

  useEffect(() => {
    if (!viewKey || !dialogRef.current?.open) return
    if (returnItem.current) {
      dialogRef.current.querySelector<HTMLElement>(`[data-menu-item="${returnItem.current}"]`)?.focus()
      returnItem.current = null
    } else if (previousView.current && previousView.current !== viewKey) {
      dialogRef.current.querySelector<HTMLElement>('#board-story-title')?.focus({ preventScroll: true })
      dialogRef.current.scrollTop = 0
    }
    previousView.current = viewKey
  }, [viewKey])

  const project = selection?.type === 'project' ? projects.find(item => item.id === selection.id) : undefined
  const role = selection?.type === 'role' ? roles.find(item => item.id === selection.id) : undefined
  const pickleball = selection?.type === 'pickleball-project' || selection?.type === 'project' ? pickleballProjects.find(item => item.id === selection.id) : undefined
  const title = selection?.type === 'part' ? titles[selection.id] : project?.title ?? role?.title ?? pickleball?.title ?? 'Dart-launching robot'
  const parent: BoardPart | null = selection?.type === 'project' ? 'projects' : selection?.type === 'role' ? 'experience' : selection?.type === 'pickleball-project' ? selection.parent ?? 'pickleball' : null
  const goBack = () => { if (parent && selection) { returnItem.current = selection.id; onSelect({ type: 'part', id: parent }) } }

  return <dialog id="portfolio-menu" ref={dialogRef} className="board-dialog" aria-labelledby="board-story-title" onCancel={event => { event.preventDefault(); onClose() }} onClick={event => { if (event.target === event.currentTarget) onClose() }}>
    {selection && <div className="board-story submenu-story">
      <button type="button" className="board-story-close" aria-label="Close story" onClick={onClose}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg></button>
      {parent ? <button type="button" className="submenu-back" onClick={goBack} aria-label={`Back to ${parent}`}><Arrow back />Back to {parent}</button> : <BrandMark className="board-story-mark" />}
      <h2 id="board-story-title" tabIndex={-1}>{title}</h2>

      {selection.type === 'part' && selection.id === 'projects' && <>
        <p>Engineering and pickleball projects. Choose a project for details, results, and links.</p>
        <a className="text-link" href="#/projects" onClick={onClose}>View all projects <Arrow /></a>
        <div className="submenu-list">{projects.map(item => <Choice key={item.id} id={item.id} title={item.title} description={item.tags.join(' · ')} onClick={() => onSelect({ type: 'project', id: item.id })} />)}<Choice id="dart-robot" title="Dart-launching robot" description="Robotics · Mechanical design" onClick={() => onSelect({ type: 'project', id: 'dart-robot' })} />{pickleballProjects.map(item => <Choice key={item.id} id={item.id} title={item.title} description={item.summary} onClick={() => onSelect({ type: 'pickleball-project', id: item.id, parent: 'projects' })} />)}</div>
      </>}
      {selection.type === 'part' && selection.id === 'experience' && <>
        <p>Teaching, data analysis, and technical support. Choose a role to see the work behind it.</p>
        <div className="submenu-list">{roles.map(item => <Choice key={item.id} id={item.id} title={item.title} description={`${item.organization} · ${item.date}`} onClick={() => onSelect({ type: 'role', id: item.id })} />)}</div>
        <a className="text-link" href="#experience" onClick={onClose}>View the full work history <Arrow /></a>
      </>}
      {selection.type === 'part' && selection.id === 'pickleball' && <>
        <Photo photo={pickleballPhotos[0]} className="submenu-media submenu-team-photo" />
        <p>Software and hardware projects for UCLA Club Pickleball.</p>
        <div className="submenu-list" data-pickleball-project-menu="">{pickleballProjects.map(item => <Choice key={item.id} id={item.id} title={item.title} description={item.summary} onClick={() => onSelect({ type: 'pickleball-project', id: item.id })} />)}</div>
        <a className="text-link" href="#pickleball" onClick={onClose}>Back to the club section <Arrow /></a>
      </>}
      {selection.type === 'part' && selection.id === 'transcript' && <>
        <dl className="academic-record"><div><dt>UNIVERSITY</dt><dd>University of California, Los Angeles</dd></div><div><dt>DEGREE</dt><dd>B.S. Computer Engineering</dd></div><div><dt>EXPECTED GRADUATION</dt><dd>June 2029</dd></div><div><dt>ACADEMIC STANDING</dt><dd>3.9 GPA · Dean’s List</dd></div></dl>
        <div className="transcript-download-card"><span className="eyebrow">UCLA · ACADEMIC RECORD</span><h3>Unofficial transcript</h3><p>Three-page student copy.</p><div className="transcript-actions"><a className="text-link" href={TRANSCRIPT} target="_blank" rel="noreferrer">View transcript <Arrow /></a><a className="button button-primary" href={TRANSCRIPT} download="Jared-Ashman-Transcript.pdf">Download transcript <Arrow /></a></div></div>
      </>}
      {selection.type === 'part' && selection.id === 'about' && <><p>I’m Jared, a computer engineering student at UCLA. I’m interested in the places where circuits, code, and real-world problems meet.</p><p>I’m also the Computer Vision Simulation Manager on the Bruin Underwater Racing software team, and a member of UCLA Club Pickleball.</p><a className="text-link" href="#about" onClick={onClose}>A little more about me <Arrow /></a></>}
      {selection.type === 'part' && selection.id === 'resume' && <><p>My education, technical experience, current projects, and activities in one place.</p><p>UCLA Computer Engineering · Expected June 2029<br />Active Secret Clearance · Sponsored by the Department of the Navy</p><a className="button button-primary board-resume-download" href={RESUME} download>Download my résumé <Arrow /></a></>}

      {selection.type === 'project' && !pickleball && <>
        {selection.id === 'sunflower' ? <Photo photo={sunflowerPhotos[0]} className="submenu-media submenu-sunflower-photo" /> : <PlaceholderArt kind={project?.id ?? 'dart-robot'} label={title} className="submenu-media" />}
        {project ? <><p className="submenu-status">{project.status}</p><p>{project.overview}</p><ul className="submenu-details">{project.contributions.map(item => <li key={item.title}><strong>{item.title}.</strong> {item.text}</li>)}</ul><Tags values={project.tags} /></> : <p>I built a dart-launching robot. See the district innovation showcase for the project presentation.</p>}
        {project && <ProjectMetrics metrics={project.metrics} />}
        <ProjectLinks links={project?.links ?? dartRobotLinks} />
        <a className="text-link" href={projectHref(selection.id)} onClick={onClose}>Read full project story <Arrow /></a>
      </>}
      {role && <>
        <p className="submenu-meta">{role.organization}<br />{role.date}</p><PlaceholderArt kind={role.id} label={role.title} className="submenu-media" /><p>{role.summary}</p><ul className="submenu-details">{role.details.map(detail => <li key={detail}>{detail}</li>)}</ul><Tags values={role.tags} />
        <a className="text-link" href="#experience" onClick={onClose}>View the full work history <Arrow /></a>
      </>}
      {pickleball && <>
        {pickleball.id === 'net-tensioner' && <NetProjectMedia />}
        <p className="submenu-status">{pickleball.kind}{pickleball.status ? ` · ${pickleball.status}` : ''}</p><p>{pickleball.overview}</p><ul className="submenu-details">{pickleball.details.map(detail => <li key={detail}>{detail}</li>)}</ul><Tags values={pickleball.tags} />
        <ProjectMetrics metrics={pickleball.metrics} />
        <ProjectLinks links={pickleball.links} />
        <a className="text-link" href={projectHref(pickleball.id)} onClick={onClose}>Read full project story <Arrow /></a>
      </>}
    </div>}
  </dialog>
}
