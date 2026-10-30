import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import type { SVGProps } from 'react'
import BrandMark from './components/BrandMark'
import PlaceholderArt from './components/PlaceholderArt'
import Photo from './components/Photo'
import portrait from './assets/photos/jared-ashman-portrait.jpg'
import { pickleballPhotos, projectPhotos, rolePhotos } from './photos'
import ProjectPage, { projectTitle } from './components/ProjectPage'
import ProjectsPage from './components/ProjectsPage'
import PortfolioMenu from './components/PortfolioMenu'
import { ProjectLinks, ProjectMetrics } from './components/ProjectDetails'
import type { MenuSelection } from './components/PortfolioMenu'
import { roles } from './experience'
import type { RoleId } from './experience'
import type { ProjectPageId } from './components/ProjectPage'
import type { BoardPart } from './components/CircuitScene'
import { featuredProjects } from './projects'
import { pickleballProjects } from './pickleballProjects'
import type { PickleballProjectId } from './pickleballProjects'

const CircuitScene = lazy(() => import('./components/CircuitScene'))
const RESUME = `${import.meta.env.BASE_URL}Jared-Ashman-Resume.pdf`
const LINKEDIN = 'https://www.linkedin.com/in/jareddashman/'
const EMAIL = 'jaredashman0209@gmail.com'



function Arrow({ diagonal = false, ...props }: SVGProps<SVGSVGElement> & { diagonal?: boolean }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" {...props}>{diagonal ? <path d="M6 18 18 6M6 6h12v12" /> : <path d="M4 12h15m-6-6 6 6-6 6" />}</svg>
}
function Download() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" /></svg> }
function LinkedInIcon() { return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 2H3.55C2.69 2 2 2.68 2 3.52v16.96c0 .84.69 1.52 1.55 1.52h16.9c.86 0 1.55-.68 1.55-1.52V3.52c0-.84-.69-1.52-1.55-1.52ZM7.93 18.75H4.98V9.2h2.95v9.55ZM6.45 7.9a1.71 1.71 0 1 1 0-3.42 1.71 1.71 0 0 1 0 3.42Zm12.3 10.85H15.8V14.1c0-1.11-.02-2.54-1.55-2.54-1.55 0-1.79 1.21-1.79 2.46v4.73H9.51V9.2h2.83v1.31h.04c.4-.75 1.36-1.55 2.79-1.55 2.98 0 3.58 1.96 3.58 4.5v5.29Z" /></svg> }
type PortfolioRoute = ProjectPageId | 'index' | null
function readProjectRoute(): PortfolioRoute {
  if (/^#\/projects\/?$/.test(window.location.hash)) return 'index'
  const match = window.location.hash.match(/^#\/projects\/(brightlight|pilight|line-follower|dart-robot|sunflower|wind-turbine|reservation-bot|reservation-sharing|net-tensioner)\/?$/)
  return match ? (match[1] === 'brightlight' ? 'pilight' : match[1]) as ProjectPageId : null
}
function projectMenuSelection(id: ProjectPageId): MenuSelection {
  return pickleballProjects.some(item => item.id === id) ? { type: 'pickleball-project', id: id as PickleballProjectId, parent: 'projects' } : { type: 'project', id }
}
function Home({ onSelectPart, onOpenProject, onOpenRole }: { onSelectPart: (part: BoardPart) => void; onOpenProject: (id: ProjectPageId) => void; onOpenRole: (id: RoleId) => void }) {
  return <main id="main">
    <section className="hero page-width" aria-labelledby="hero-heading">
      <div className="hero-copy">
        <div className="eyebrow hero-eyebrow"><span className="tiny-cross">+</span> HI, I’M JARED</div>
        <h1 id="hero-heading">Curiosity, <br /><em>wired</em> into <br />practice.<svg className="hero-spark" width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M24 2v44M2 24h44M8.5 8.5l31 31m0-31-31 31" stroke="currentColor" strokeWidth="1.2" /></svg></h1>
        <div className="hero-introduction">
          <div className="hero-portrait"><div className="hero-portrait-crop"><img src={portrait} width="896" height="1200" alt="Jared Ashman in a black suit" loading="eager" decoding="async" /></div></div>
          <p className="hero-intro">I’m a computer engineering student at UCLA. I build projects across hardware, software, and robotics.</p>
        </div>
        <div className="hero-actions"><a className="button button-primary" href="#work">Explore my work <Arrow /></a><div className="hero-profile-links"><a className="resume-link" href={RESUME} download>My résumé <Download /></a><a className="resume-link hero-linkedin" href={LINKEDIN} target="_blank" rel="noreferrer"><LinkedInIcon />LinkedIn<span className="sr-only"> (opens in a new tab)</span></a></div></div>
        <div className="availability"><span /> Seeking computer engineering internships</div>
        <div className="clearance-note"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true"><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z" /><path d="m8 12 3 3 5-6" /></svg><div><strong>Active Secret Clearance</strong><span>Sponsored by the Department of the Navy</span></div></div>
      </div>
      <div className="hero-visual" role="group" aria-label="Interactive circuit board: the parts that make me">
        <div className="hero-circuit"><Suspense fallback={<div className="scene-loading" aria-hidden="true"><BrandMark /></div>}><CircuitScene onSelect={onSelectPart} /></Suspense></div>
        <div className="visual-bottomline"><span>FIG. 01 — INTERACTIVE CIRCUIT</span><span className="interaction-hint">CHOOSE A COMPONENT ↗</span></div>
        <p className="board-caption">Click or tap a component to get to know me.</p>
      </div>
    </section>

    <div className="intro-strip page-width">
      <div className="strip-education"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true"><path d="m3 12 13-7 13 7-13 7-13-7Zm5 3v9c5 4 11 4 16 0v-9m5-3v12" /></svg><span>UCLA<span>B.S. Computer Engineering</span><span>Expected June 2029</span></span></div>
      <div className="strip-gpa"><strong>3.9</strong><span>GPA<br /><span>Dean’s List</span></span></div>
      <div className="strip-location"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true"><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2.5" /></svg><span>Los Angeles, CA</span></div>
    </div>

    <section id="work" className="work-section page-width" aria-labelledby="work-heading">
      <div className="section-heading"><div><div className="eyebrow"><span className="section-number">01 /</span> SELECTED PROJECTS</div><h2 id="work-heading">Engineering <em>projects.</em></h2></div></div>
      <div className="project-grid">{featuredProjects.map((project, index) => <article className="project-card" key={project.id}>
        <button type="button" className={`project-art-button project-art-${project.id}`} onClick={() => onOpenProject(project.id)} aria-haspopup="dialog" aria-label={`Explore ${project.title}`}>{projectPhotos[project.id]?.[0] ? <Photo photo={projectPhotos[project.id]![0]} className="project-photo-slot" /> : <PlaceholderArt kind={project.id} label={project.title} className="project-photo-slot" />}<div className="art-topline"><span>0{index + 1} / {project.eyebrow}</span><span className="progress-badge"><i />{project.status.toUpperCase()}</span></div><span className="art-open"><Arrow diagonal /></span></button>
        <div className="project-info"><div className="project-title-row"><h3><button type="button" onClick={() => onOpenProject(project.id)} aria-haspopup="dialog">{project.title}</button></h3><Arrow diagonal /></div><p>{project.summary}</p><div className="project-tags">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div><ProjectMetrics metrics={project.metrics} compact /><ProjectLinks links={project.links} compact /></div>
      </article>)}</div>
      <a className="all-projects-link" href="#/projects">View all projects <Arrow /></a>
    </section>

    <section id="experience" className="experience-section experience-expanded page-width" aria-labelledby="experience-heading">
      <div className="section-heading"><div><div className="eyebrow"><span className="section-number">02 /</span> EXPERIENCE</div><h2 id="experience-heading">Work <em>experience.</em></h2></div><a className="text-link experience-resume" href={RESUME} download>Full résumé <Download /></a></div>
      <p className="experience-intro">From teaching in the lab to working through Navy hardware-failure data, these roles have brought different kinds of engineering problems into focus.</p>
      <div className="experience-list">{roles.map((role, index) => <article key={role.id} className="experience-row experience-story">
        <figure className="experience-photo"><button type="button" className="experience-photo-button" onClick={() => onOpenRole(role.id)} aria-haspopup="dialog" aria-label={`Explore ${role.title}`}><Photo photo={rolePhotos[role.id]} /></button><figcaption>0{index + 1} / {role.context}</figcaption></figure>
        <div className="experience-story-content"><div className="experience-date">{role.date}</div><div className="experience-role"><h3><button type="button" className="job-title-button" onClick={() => onOpenRole(role.id)} aria-haspopup="dialog">{role.title}<Arrow diagonal /></button></h3><span>{role.organization}</span></div><p className="experience-lead">{role.summary}</p><ul className="experience-details">{role.details.map(detail => <li key={detail}>{detail}</li>)}</ul><div className="project-tags">{role.tags.map(tag => <span key={tag}>{tag}</span>)}</div></div>
      </article>)}</div>
    </section>

    <section id="pickleball" className="pickleball-section" aria-labelledby="pickleball-heading"><div className="pickleball-inner page-width">
      <div className="pickleball-copy"><div className="eyebrow"><span className="section-number">03 /</span> CLUB ACTIVITIES</div><h2 id="pickleball-heading"><button type="button" className="pickleball-title" onClick={() => onSelectPart('pickleball')} aria-haspopup="dialog">UCLA Club<br /><em>Pickleball.</em></button></h2><p>I’m a member of UCLA Club Pickleball, where I also build software and hardware to support the club.</p><button type="button" className="text-link pickleball-projects-trigger" onClick={() => onSelectPart('pickleball')} aria-haspopup="dialog">Explore pickleball projects <Arrow /></button></div>
      <button type="button" className="pickleball-open-photo pickleball-main-photo" onClick={() => onSelectPart('pickleball')} aria-haspopup="dialog" aria-label="Explore UCLA Club Pickleball"><Photo photo={pickleballPhotos[0]} /></button><div className="pickleball-photo-pair">{pickleballPhotos.slice(1).map(photo => <Photo key={photo.id} photo={photo} />)}</div>
    </div></section>

    <section id="about" className="about-section" aria-labelledby="about-heading"><div className="about-inner page-width">
      <div className="about-copy"><div className="eyebrow"><span className="section-number">04 /</span> ABOUT</div><h2 id="about-heading">Computer engineering<br /><em>at UCLA.</em></h2><p>I’m Jared, a computer engineering student at UCLA, with graduation expected in June 2029. I’m drawn to the places where circuits, code, and real-world problems meet.</p><p>I teach hands-on underwater robotics and biomimetic engineering at UCLA. My experience also includes analyzing Navy hardware-failure data and supporting a network of more than 100 admissions workstations.</p><p>In 2025–2026, I served as Computer Vision Simulation Manager for the Bruin Underwater Racing software team. I’m also involved in UCLA Club Pickleball.</p><p className="academic-note">University City High School · Salutatorian, Class of 2025</p><div className="about-links"><a href={RESUME} download className="text-link">My résumé <Download /></a><button type="button" className="text-link" onClick={() => onSelectPart('transcript')}>Academic record <Arrow diagonal /></button></div></div>
      <div className="toolbox"><div className="toolbox-heading"><span className="eyebrow">MY TOOLBOX</span><svg viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true"><rect x="11" y="11" width="22" height="22" rx="2" /><rect x="16" y="16" width="12" height="12" /><path d="M16 5v6m6-6v6m6-6v6M16 33v6m6-6v6m6-6v6M5 16h6m-6 6h6m-6 6h6m22-12h6m-6 6h6m-6 6h6" /></svg></div><div className="toolbox-group"><h3>Hardware</h3><p>ESP32 <span>·</span> Arduino <span>·</span> Microcontrollers<br />Circuitry <span>·</span> Digital logic <span>·</span> Soldering</p></div><div className="toolbox-group"><h3>Software</h3><p>C++ <span>·</span> Python <span>·</span> Arduino IDE<br />Hardware/software integration</p></div><div className="toolbox-group"><h3>Signal processing</h3><p>FFT <span>·</span> Signal processing<br />Hardware-failure data analysis</p></div></div>
    </div></section>

    <section id="contact" className="contact-section" aria-labelledby="contact-heading"><div className="contact-inner page-width"><div className="eyebrow"><span className="contact-dot" /> OPEN TO NEW OPPORTUNITIES</div><div className="contact-main"><h2 id="contact-heading">Let’s build<br />something <em>good.</em></h2><div className="contact-copy"><p>Have an internship opportunity, an interesting<br className="desktop-break" /> project, or just want to talk engineering?<br />I’d love to hear from you.</p><a className="contact-email" href={`mailto:${EMAIL}`}>{EMAIL}<Arrow diagonal /></a><a className="contact-linkedin" href={LINKEDIN} target="_blank" rel="noreferrer">Find me on LinkedIn <Arrow diagonal /><span className="sr-only"> (opens in a new tab)</span></a></div></div><div className="contact-bottom"><svg viewBox="0 0 54 54" fill="none" stroke="currentColor" strokeWidth="1.1" aria-hidden="true"><path d="M27 1v52M1 27h52M8.5 8.5l37 37m0-37-37 37" /></svg></div></div></section>
  </main>
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [route, setRoute] = useState<PortfolioRoute>(readProjectRoute)
  const projectId = route === 'index' ? null : route
  const [activeMenu, setActiveMenu] = useState<MenuSelection | null>(null)
  const menuTrigger = useRef<HTMLElement | null>(null)
  const openMenu = (selection: MenuSelection) => { menuTrigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; setActiveMenu(selection); setMenuOpen(false) }
  const menuButton = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const updateRoute = () => { setRoute(readProjectRoute()); setMenuOpen(false); setActiveMenu(null) }
    window.addEventListener('hashchange', updateRoute)
    return () => window.removeEventListener('hashchange', updateRoute)
  }, [])
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (route) {
        window.scrollTo({ top: 0, behavior: 'instant' })
        const heading = document.querySelector<HTMLElement>('.project-page h1, .projects-page h1')
        heading?.setAttribute('tabindex', '-1'); heading?.focus({ preventScroll: true })
      } else { document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ behavior: 'instant' }) }
    })
    document.title = route === 'index' ? 'Projects — Jared Ashman' : projectId ? `${projectTitle(projectId)} — Jared Ashman` : 'Jared Ashman — The parts that make me'
    return () => cancelAnimationFrame(frame)
  }, [route, projectId])
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') { setMenuOpen(false); menuButton.current?.focus() } }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [menuOpen])
  return <>
    <a className="skip-link" href="#main" onClick={event => { event.preventDefault(); const main = document.getElementById('main'); main?.setAttribute('tabindex', '-1'); main?.focus({ preventScroll: true }); main?.scrollIntoView({ behavior: 'instant' }) }}>Skip to content</a>
    <header id="top" className="site-header"><div className="header-inner page-width">
      <a href="#top" className="brand" aria-label="Jared Ashman, home"><BrandMark /><span className="brand-name">Jared Ashman<span>THE PARTS THAT MAKE ME</span></span></a>
      <button type="button" ref={menuButton} className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="main-nav" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}><span className={menuOpen ? 'menu-lines is-open' : 'menu-lines'}><i /><i /></span></button>
      <nav id="main-nav" className={menuOpen ? 'main-nav is-open' : 'main-nav'} aria-label="Main navigation">{(['projects', 'experience', 'pickleball'] as const).map(part => <button type="button" key={part} className="nav-menu" onClick={() => openMenu({ type: 'part', id: part })} aria-haspopup="dialog" aria-controls="portfolio-menu">{part.charAt(0).toUpperCase() + part.slice(1)}<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true"><path d="m4 6 4 4 4-4" /></svg></button>)}<a href="#about" onClick={() => setMenuOpen(false)}>About</a><a className="nav-contact" href="#contact" onClick={() => setMenuOpen(false)}>Let’s connect <Arrow diagonal /></a></nav>
    </div></header>
    {route === 'index' ? <ProjectsPage /> : projectId ? <ProjectPage projectId={projectId} onOpenMenu={id => openMenu(projectMenuSelection(id))} /> : <Home onSelectPart={id => openMenu({ type: 'part', id })} onOpenProject={id => openMenu({ type: 'project', id })} onOpenRole={id => openMenu({ type: 'role', id })} />}
    <footer className="site-footer page-width"><a href="#top" className="footer-signature" aria-label="Jared Ashman, back to home">Jared Ashman<span>.</span></a><button type="button" className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })}>Back to top <Arrow diagonal /></button></footer>
    <PortfolioMenu selection={activeMenu} onSelect={setActiveMenu} onClose={() => setActiveMenu(null)} triggerRef={menuTrigger} />
  </>
}

export default App
