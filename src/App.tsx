import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import type { SVGProps } from 'react'
import BrandMark from './components/BrandMark'
import ProjectPage from './components/ProjectPage'
import type { ProjectPageId } from './components/ProjectPage'
import type { BoardPart } from './components/CircuitScene'
import { projects } from './projects'

const CircuitScene = lazy(() => import('./components/CircuitScene'))
const RESUME = `${import.meta.env.BASE_URL}Jared-Ashman-Resume.pdf`
const LINKEDIN = 'https://www.linkedin.com/in/jareddashman/'
const EMAIL = 'jaredashman0209@gmail.com'

const roles = [
  { id: 'teaching', title: 'Student Teacher', organization: 'UCLA Henry Samueli School of Engineering and Applied Science', date: 'SEP 2026 — PRESENT', context: 'Underwater robotics & biomimetic engineering', summary: 'Helping engineering concepts become something students can build, test, and demonstrate.', details: ['Lead hands-on undergraduate instruction in underwater robotics and biomimetic engineering.', 'Teach fluid dynamics, Arduino programming, soldering, circuitry, logic design, and hardware integration.', 'Mentor student teams from foundational concepts through assembly, testing, and demonstration.'], tags: ['Robotics instruction', 'Hardware integration', 'Student mentorship'] },
  { id: 'navy', title: 'Student Trainee (SSEP)', organization: 'U.S. Navy · San Diego, CA', date: 'JUN 2026 — SEP 2026', context: 'Data analysis & systems sustainment', summary: 'Working through complex failure data to better understand the systems behind it.', details: ['Analyzed complex hardware-failure data for Department of the Navy C5 systems to identify trends and support lifecycle sustainment.', 'Used failure data to investigate sustainment issues and support improvements to logistics processes.'], tags: ['Data analysis', 'Analytical problem-solving', 'Lifecycle sustainment'] },
  { id: 'admissions', title: 'IT Specialist', organization: 'UCLA Undergraduate Admissions', date: 'SEP 2025 — JUN 2026', context: 'Technical support & everyday reliability', summary: 'Supporting the hardware, software, and website that help keep admissions moving.', details: ['Supported more than 100 workstations through hardware maintenance, software deployments, updates, and troubleshooting.', 'Updated Undergraduate Admissions website content and helped resolve day-to-day technical issues.'], tags: ['100+ workstations', 'Technical troubleshooting', 'Systems maintenance'] },
]

function Arrow({ diagonal = false, ...props }: SVGProps<SVGSVGElement> & { diagonal?: boolean }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" {...props}>{diagonal ? <path d="M6 18 18 6M6 6h12v12" /> : <path d="M4 12h15m-6-6 6 6-6 6" />}</svg>
}
function Download() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" /></svg> }
function PhotoSlot({ label, className = '' }: { label: string; className?: string }) { return <div className={`photo-slot ${className}`.trim()} data-photo-slot="" role="img" aria-label={label} /> }
function readProjectRoute(): ProjectPageId | null {
  const match = window.location.hash.match(/^#\/projects\/(pilight|line-follower|dart-robot)\/?$/)
  return match ? match[1] as ProjectPageId : null
}
const partTitles: Record<BoardPart, string> = { projects: 'Projects', experience: 'Experience', transcript: 'Transcript', about: 'About me', pickleball: 'UCLA Club Pickleball', resume: 'My résumé' }

function BoardDialog({ part, onClose }: { part: BoardPart | null; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const element = dialog.current
    if (!element || !part) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    element.showModal()
    return () => { element.close(); document.body.style.overflow = previousOverflow }
  }, [part])
  return <dialog ref={dialog} className="board-dialog" aria-labelledby="board-story-title" onCancel={event => { event.preventDefault(); onClose() }} onClick={event => { if (event.target === event.currentTarget) onClose() }}>
    {part && <div className="board-story">
      <button type="button" className="board-story-close" aria-label="Close story" onClick={onClose}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg></button>
      <BrandMark className="board-story-mark" /><div className="eyebrow">ONE PART OF THE WHOLE</div><h2 id="board-story-title">{partTitles[part]}</h2>
      {part === 'projects' && <><p>Turning signals into light, and feedback into motion. These are the ideas I’m working on at the moment.</p><div className="board-story-links">{projects.map(project => <a href={`#/projects/${project.id}`} key={project.id} onClick={onClose}><span>{project.title}<small>{project.tags.join(' · ')}</small></span><Arrow diagonal /></a>)}</div></>}
      {part === 'experience' && <><p>Hands-on robotics instruction, Navy hardware-failure data analysis, and technical support for more than 100 workstations. Each role adds a different perspective to how I approach a problem.</p><a className="text-link" href="#experience" onClick={onClose}>Explore my work experience <Arrow /></a></>}
      {part === 'transcript' && <><p>The academic foundations behind the projects.</p><dl className="academic-record"><div><dt>UNIVERSITY</dt><dd>University of California, Los Angeles</dd></div><div><dt>DEGREE</dt><dd>B.S. Computer Engineering</dd></div><div><dt>EXPECTED GRADUATION</dt><dd>June 2029</dd></div><div><dt>ACADEMIC STANDING</dt><dd>3.9 GPA · Dean’s List</dd></div></dl><div className="transcript-space" data-document-slot="" role="img" aria-label="Reserved space for a future transcript" /><p className="document-status">Transcript not uploaded yet.</p></>}
      {part === 'about' && <><p>I’m Jared, a computer engineering student at UCLA. I’m interested in the places where circuits, code, and real-world problems meet.</p><p>I’m also the Computer Vision Simulation Manager on the Bruin Underwater Racing software team, and a member of UCLA Club Pickleball.</p><a className="text-link" href="#about" onClick={onClose}>A little more about me <Arrow /></a></>}
      {part === 'pickleball' && <><p>A different side of life at UCLA. Club pickleball is another part of who I am, alongside the circuits and code.</p><a className="text-link" href="#pickleball" onClick={onClose}>Off the workbench <Arrow /></a></>}
      {part === 'resume' && <><p>My education, technical experience, current projects, and activities in one place.</p><p>UCLA Computer Engineering · Expected June 2029<br />Active Secret Clearance · Sponsored by the Department of the Navy</p><a className="button button-primary board-resume-download" href={RESUME} download>Download my résumé <Download /></a></>}
    </div>}
  </dialog>
}

function Home({ onSelectPart }: { onSelectPart: (part: BoardPart) => void }) {
  return <main id="main">
    <section className="hero page-width" aria-labelledby="hero-heading">
      <div className="hero-copy">
        <div className="eyebrow hero-eyebrow"><span className="tiny-cross">+</span> HI, I’M JARED</div>
        <h1 id="hero-heading">The parts<br />that make<br /><em>me.</em><svg className="hero-spark" width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M24 2v44M2 24h44M8.5 8.5l31 31m0-31-31 31" stroke="currentColor" strokeWidth="1.2" /></svg></h1>
        <p className="hero-intro">I’m a computer engineering student at UCLA.<br className="desktop-break" /> A little hardware, a little software, and a lot<br className="desktop-break" /> of curiosity. Every component has a story.</p>
        <div className="hero-actions"><a className="button button-primary" href="#work">Explore my work <Arrow /></a><a className="resume-link" href={RESUME} download>My résumé <Download /></a></div>
        <div className="availability"><span /> Seeking electrical engineering internships</div>
        <div className="clearance-note"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true"><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z" /><path d="m8 12 3 3 5-6" /></svg><div><strong>Active Secret Clearance</strong><span>Sponsored by the Department of the Navy</span></div></div>
      </div>
      <div className="hero-visual" role="group" aria-label="Interactive circuit board: the parts that make me">
        <div className="visual-topline"><span>A FEW PARTS. ONE PERSON.</span><span className="visual-cross">+</span></div>
        <div className="hero-circuit"><Suspense fallback={<div className="scene-loading" aria-hidden="true"><BrandMark /></div>}><CircuitScene onSelect={onSelectPart} /></Suspense></div>
        <div className="visual-bottomline"><span>FIG. 01 — THE PARTS THAT MAKE ME</span><span className="interaction-hint">CHOOSE A COMPONENT ↗</span></div>
        <p className="board-caption">Click or tap a component to get to know me.</p>
      </div>
    </section>

    <div className="intro-strip page-width">
      <div className="strip-education"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true"><path d="m3 12 13-7 13 7-13 7-13-7Zm5 3v9c5 4 11 4 16 0v-9m5-3v12" /></svg><span>UCLA<span>B.S. Computer Engineering</span><span>Expected June 2029</span></span></div>
      <div className="strip-gpa"><strong>3.9</strong><span>GPA<br /><span>Dean’s List</span></span></div>
      <div className="strip-location"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true"><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2.5" /></svg><span>Los Angeles, CA<span>Building from the West Coast.</span></span></div>
    </div>

    <section id="work" className="work-section page-width" aria-labelledby="work-heading">
      <div className="section-heading"><div><div className="eyebrow"><span className="section-number">01 /</span> LEARNING BY BUILDING</div><h2 id="work-heading">Ideas on <em>the workbench.</em></h2></div><p>From signals to light. From feedback to motion.<br />Learning how it all connects.</p></div>
      <div className="project-grid">{projects.map(project => <article className="project-card" key={project.id}>
        <a className={`project-art-button project-art-${project.id}`} href={`#/projects/${project.id}`} aria-label={`Explore ${project.title}`}><PhotoSlot label={`${project.title} photo space`} className="project-photo-slot" /><div className="art-topline"><span>{project.number} / {project.eyebrow}</span><span className="progress-badge"><i />{project.status.toUpperCase()}</span></div><span className="art-open"><Arrow diagonal /></span></a>
        <div className="project-info"><div className="project-title-row"><h3><a href={`#/projects/${project.id}`}>{project.title}</a></h3><Arrow diagonal /></div><p>{project.summary}</p><div className="project-tags">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div></div>
      </article>)}</div>
    </section>

    <section id="experience" className="experience-section experience-expanded page-width" aria-labelledby="experience-heading">
      <div className="section-heading"><div><div className="eyebrow"><span className="section-number">02 /</span> WORK, PAST & PRESENT</div><h2 id="experience-heading">Experience that <em>shapes me.</em></h2></div><a className="text-link experience-resume" href={RESUME} download>Full résumé <Download /></a></div>
      <p className="experience-intro">From teaching in the lab to working through Navy hardware-failure data, these roles have brought different kinds of engineering problems into focus.</p>
      <div className="experience-list">{roles.map((role, index) => <article key={role.id} className="experience-row experience-story">
        <figure className="experience-photo"><PhotoSlot label={`Photo space for ${role.organization}`} /><figcaption>0{index + 1} / {role.context}</figcaption></figure>
        <div className="experience-story-content"><div className="experience-date">{role.date}</div><div className="experience-role"><h3>{role.title}</h3><span>{role.organization}</span></div><p className="experience-lead">{role.summary}</p><ul className="experience-details">{role.details.map(detail => <li key={detail}>{detail}</li>)}</ul><div className="project-tags">{role.tags.map(tag => <span key={tag}>{tag}</span>)}</div></div>
      </article>)}</div>
    </section>

    <section id="pickleball" className="pickleball-section" aria-labelledby="pickleball-heading"><div className="pickleball-inner page-width">
      <div className="pickleball-copy"><div className="eyebrow"><span className="section-number">03 /</span> OFF THE WORKBENCH</div><h2 id="pickleball-heading">UCLA Club<br /><em>Pickleball.</em></h2><p>A different side of life at UCLA. Alongside the circuits, code, and engineering projects, I’m involved in UCLA Club Pickleball.</p><span className="pickleball-detail">PART OF THE TEAM. PART OF THE WHOLE.</span></div>
      <PhotoSlot label="UCLA Club Pickleball team photo space" className="pickleball-main-photo" /><div className="pickleball-photo-pair"><PhotoSlot label="UCLA pickleball court photo space" /><PhotoSlot label="UCLA pickleball club photo space" /></div>
    </div></section>

    <section id="about" className="about-section" aria-labelledby="about-heading"><div className="about-inner page-width">
      <div className="about-copy"><div className="eyebrow"><span className="section-number">04 /</span> CONNECTING THE PARTS</div><h2 id="about-heading">A hands-on builder.<br />An <em>always-curious</em> mind.</h2><p>I’m Jared, a computer engineering student at UCLA, with graduation expected in June 2029. I’m drawn to the places where circuits, code, and real-world problems meet.</p><p>I teach hands-on underwater robotics and biomimetic engineering at UCLA. My experience also includes analyzing Navy hardware-failure data and supporting a network of more than 100 admissions workstations.</p><p>I’m the Computer Vision Simulation Manager on the Bruin Underwater Racing (BUR) software team, and I’m involved in UCLA Club Pickleball.</p><p className="academic-note">University City High School · Salutatorian, Class of 2025</p><div className="about-links"><a href={RESUME} download className="text-link">My résumé <Download /></a><button type="button" className="text-link" onClick={() => onSelectPart('transcript')}>Academic record <Arrow diagonal /></button></div></div>
      <div className="toolbox"><div className="toolbox-heading"><span className="eyebrow">MY TOOLBOX</span><svg viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true"><rect x="11" y="11" width="22" height="22" rx="2" /><rect x="16" y="16" width="12" height="12" /><path d="M16 5v6m6-6v6m6-6v6M16 33v6m6-6v6m6-6v6M5 16h6m-6 6h6m-6 6h6m22-12h6m-6 6h6m-6 6h6" /></svg></div><div className="toolbox-group"><h3>Closer to the hardware</h3><p>ESP32 <span>·</span> Arduino <span>·</span> Microcontrollers<br />Circuitry <span>·</span> Digital logic <span>·</span> Soldering</p></div><div className="toolbox-group"><h3>On the software side</h3><p>C++ <span>·</span> Python <span>·</span> Arduino IDE<br />Hardware/software integration</p></div><div className="toolbox-group"><h3>Working with signals</h3><p>FFT <span>·</span> Signal processing<br />Hardware-failure data analysis</p></div><div className="toolbox-footer"><span className="tiny-cross">+</span> A WORK IN PROGRESS, JUST LIKE ME.</div></div>
    </div></section>

    <section id="contact" className="contact-section" aria-labelledby="contact-heading"><div className="contact-inner page-width"><div className="eyebrow"><span className="contact-dot" /> OPEN TO NEW OPPORTUNITIES</div><div className="contact-main"><h2 id="contact-heading">Let’s build<br />something <em>good.</em></h2><div className="contact-copy"><p>Have an internship opportunity, an interesting<br className="desktop-break" /> project, or just want to talk engineering?<br />I’d love to hear from you.</p><a className="contact-email" href={`mailto:${EMAIL}`}>{EMAIL}<Arrow diagonal /></a><a className="contact-linkedin" href={LINKEDIN} target="_blank" rel="noreferrer">Find me on LinkedIn <Arrow diagonal /><span className="sr-only"> (opens in a new tab)</span></a></div></div><div className="contact-bottom"><span>GOOD THINGS START WITH A CONVERSATION.</span><svg viewBox="0 0 54 54" fill="none" stroke="currentColor" strokeWidth="1.1" aria-hidden="true"><path d="M27 1v52M1 27h52M8.5 8.5l37 37m0-37-37 37" /></svg></div></div></section>
  </main>
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [projectId, setProjectId] = useState<ProjectPageId | null>(readProjectRoute)
  const [activePart, setActivePart] = useState<BoardPart | null>(null)
  const menuButton = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const updateRoute = () => { setProjectId(readProjectRoute()); setMenuOpen(false); setActivePart(null) }
    window.addEventListener('hashchange', updateRoute)
    return () => window.removeEventListener('hashchange', updateRoute)
  }, [])
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (projectId) {
        window.scrollTo({ top: 0, behavior: 'instant' })
        const heading = document.querySelector<HTMLElement>('.project-page h1')
        heading?.setAttribute('tabindex', '-1'); heading?.focus({ preventScroll: true })
      } else { document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ behavior: 'instant' }) }
    })
    document.title = projectId ? `${projectId === 'dart-robot' ? 'Dart-launching robot' : projects.find(project => project.id === projectId)?.title} — Jared Ashman` : 'Jared Ashman — The parts that make me'
    return () => cancelAnimationFrame(frame)
  }, [projectId])
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
      <nav id="main-nav" className={menuOpen ? 'main-nav is-open' : 'main-nav'} aria-label="Main navigation"><a href="#work" onClick={() => setMenuOpen(false)}>Projects</a><a href="#experience" onClick={() => setMenuOpen(false)}>Experience</a><a href="#pickleball" onClick={() => setMenuOpen(false)}>Pickleball</a><a href="#about" onClick={() => setMenuOpen(false)}>About</a><a className="nav-contact" href="#contact" onClick={() => setMenuOpen(false)}>Let’s connect <Arrow diagonal /></a></nav>
    </div></header>
    {projectId ? <ProjectPage projectId={projectId} /> : <Home onSelectPart={setActivePart} />}
    <footer className="site-footer page-width"><a href="#top" className="footer-signature" aria-label="Jared Ashman, back to home">Jared Ashman<span>.</span></a><p>Every part has a story.</p><button type="button" className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })}>Back to top <Arrow diagonal /></button></footer>
    <BoardDialog part={activePart} onClose={() => setActivePart(null)} />
  </>
}

export default App
