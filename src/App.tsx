import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import type { SVGProps } from 'react'
import ProjectArtwork from './components/ProjectArtwork'
import { projects } from './projects'
import type { Project } from './projects'

const CircuitScene = lazy(() => import('./components/CircuitScene'))
const RESUME = `${import.meta.env.BASE_URL}Jared-Ashman-Resume.pdf`
const LINKEDIN = 'https://www.linkedin.com/in/jareddashman/'
const EMAIL = 'jaredashman0209@gmail.com'

function Arrow({ diagonal = false, ...props }: SVGProps<SVGSVGElement> & { diagonal?: boolean }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" {...props}>
    {diagonal ? <path d="M6 18 18 6M6 6h12v12" /> : <path d="M4 12h15m-6-6 6 6-6 6" />}
  </svg>
}

function Download() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" /></svg>
}

function ProjectDialog({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const element = dialog.current
    if (!element || !project) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    element.showModal()
    return () => {
      element.close()
      document.body.style.overflow = previousOverflow
    }
  }, [project])

  return <dialog ref={dialog} className="project-dialog" aria-labelledby="project-dialog-title"
    onCancel={(event) => { event.preventDefault(); onClose() }}
    onClick={(event) => { if (event.target === event.currentTarget) onClose() }}>
    {project && <div className="dialog-inner">
      <button className="dialog-close" onClick={onClose} aria-label="Close project">
        <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
      </button>
      <div className={`dialog-art project-art-${project.id}`}><ProjectArtwork kind={project.id} /></div>
      <div className="dialog-content">
        <div className="eyebrow dialog-eyebrow">PROJECT {project.number}<span>{project.status}</span></div>
        <h2 id="project-dialog-title">{project.title}</h2>
        <p className="dialog-subtitle">{project.subtitle}</p>
        <p>{project.overview}</p>
        <h3>Inside the build</h3>
        <div className="contributions">{project.contributions.map((item) => <div key={item.title}><h4>{item.title}</h4><p>{item.text}</p></div>)}</div>
        <div className="project-tags">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
        <p className="illustration-note">Concept illustration; not a photograph or technical drawing of the actual build.</p>
        <a className="text-link" href={`mailto:${EMAIL}?subject=${encodeURIComponent(`Let's talk about ${project.title}`)}`}>Ask me about this project <Arrow diagonal /></a>
      </div>
    </div>}
  </dialog>
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const menuButton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setMenuOpen(false); menuButton.current?.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [menuOpen])

  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header">
      <div className="header-inner page-width">
        <a href="#" className="brand" aria-label="Jared Ashman, home"><span className="monogram">ja<span>.</span></span><span className="brand-name">Jared Ashman<span>ENGINEERING & EXPLORATION</span></span></a>
        <button ref={menuButton} className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="main-nav" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}>
          <span className={menuOpen ? 'menu-lines is-open' : 'menu-lines'}><i /><i /></span>
        </button>
        <nav id="main-nav" className={menuOpen ? 'main-nav is-open' : 'main-nav'} aria-label="Main navigation">
          <a href="#work" onClick={() => setMenuOpen(false)}>Projects</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
          <a href="#experience" onClick={() => setMenuOpen(false)}>Experience</a>
          <a className="nav-contact" href="#contact" onClick={() => setMenuOpen(false)}>Let’s connect <Arrow diagonal /></a>
        </nav>
      </div>
    </header>

    <main id="main">
      <section className="hero page-width" aria-labelledby="hero-heading">
        <div className="hero-copy">
          <div className="eyebrow hero-eyebrow"><span className="tiny-cross">+</span> HI, I’M JARED</div>
          <h1 id="hero-heading">Curiosity,<br />wired into<br /><em>practice.</em><svg className="hero-spark" width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M24 2v44M2 24h44M8.5 8.5l31 31m0-31-31 31" stroke="currentColor" strokeWidth="1.2" /></svg></h1>
          <p className="hero-intro">I’m a computer engineering student at UCLA.<br className="desktop-break" /> I build across hardware and software, with a<br className="desktop-break" /> soft spot for things that come to life.</p>
          <div className="hero-actions"><a className="button button-primary" href="#work">Explore my work <Arrow /></a><a className="resume-link" href={RESUME} download>My résumé <Download /></a></div>
          <div className="availability"><span /> Seeking electrical engineering internships</div>
        </div>
        <div className="hero-visual" role="group" aria-label="Interactive circuit board illustration">
          <div className="visual-topline"><span>EXPLORATIONS IN HARDWARE</span><span className="visual-cross">+</span></div>
          <div className="hero-circuit"><Suspense fallback={<div className="scene-loading" aria-hidden="true"><span>ja.</span></div>}><CircuitScene /></Suspense></div>
          <div className="scene-callout callout-one"><span className="callout-dot" /><span>A mind for the details.</span></div>
          <div className="scene-callout callout-two"><span>A drive to make it work.</span><span className="callout-dot" /></div>
          <div className="visual-bottomline"><span>FIG. 01 — A CIRCUIT STUDY</span><span className="interaction-hint"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true"><path d="m3 2 9 6-4 1-2 4-3-11Z" /></svg> MOVE TO EXPLORE</span></div>
        </div>
      </section>

      <div className="intro-strip page-width">
        <div className="strip-education"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true"><path d="m3 12 13-7 13 7-13 7-13-7Zm5 3v9c5 4 11 4 16 0v-9m5-3v12" /></svg><span>UCLA<span>B.S. Computer Engineering</span></span></div>
        <div className="strip-gpa"><strong>3.9</strong><span>GPA<br /><span>Always learning.</span></span></div>
        <div className="strip-location"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true"><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2.5" /></svg><span>Los Angeles, CA<span>Building from the West Coast.</span></span></div>
      </div>

      <section id="work" className="work-section page-width" aria-labelledby="work-heading">
        <div className="section-heading"><div><div className="eyebrow"><span className="section-number">01 /</span> LEARNING BY BUILDING</div><h2 id="work-heading">A few things I’ve <em>made.</em></h2></div><p>From the workbench to the water.<br />Ideas are better when you build them.</p></div>
        <div className="project-grid">{projects.map(project => <article className="project-card" key={project.id}>
          <button className={`project-art-button project-art-${project.id}`} onClick={() => setActiveProject(project)} aria-label={`Explore ${project.title}`}>
            <div className="art-topline"><span>{project.number} / {project.id === 'pilight' ? 'SOUND & LIGHT' : project.id === 'rov' ? 'BELOW THE SURFACE' : 'IN MOTION'}</span>{project.id === 'pilight' && <span className="progress-badge"><i />IN PROGRESS</span>}</div>
            <ProjectArtwork kind={project.id} />
            <span className="art-footnote">PROJECT ILLUSTRATION</span><span className="art-open"><Arrow diagonal /></span>
          </button>
          <div className="project-info"><div className="project-title-row"><h3><button onClick={() => setActiveProject(project)}>{project.title}</button></h3><Arrow diagonal /></div><p>{project.summary}</p><div className="project-tags">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div></div>
        </article>)}</div>
      </section>

      <section id="about" className="about-section" aria-labelledby="about-heading">
        <div className="about-inner page-width">
          <div className="about-copy"><div className="eyebrow"><span className="section-number">02 /</span> THE PERSON BEHIND THE PROJECTS</div><h2 id="about-heading">A hands-on builder.<br />An <em>always-curious</em> mind.</h2><p>I’m Jared, a computer engineering student at UCLA who enjoys connecting the physical and digital worlds. Give me a microcontroller, a new problem, or something that needs figuring out, and I’m happy.</p><p>At Bruin Underwater Racing, I’m part of the software team as Computer Vision Simulation Manager. Outside the lab, I co-founded Minim to help make music education more accessible.</p><a href={RESUME} download className="text-link">A little more about me <span className="link-aside">(RÉSUMÉ)</span><Arrow diagonal /></a></div>
          <div className="toolbox"><div className="toolbox-heading"><span className="eyebrow">MY TOOLBOX</span><svg viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true"><rect x="11" y="11" width="22" height="22" rx="2" /><rect x="16" y="16" width="12" height="12" /><path d="M16 5v6m6-6v6m6-6v6M16 33v6m6-6v6m6-6v6M5 16h6m-6 6h6m-6 6h6m22-12h6m-6 6h6m-6 6h6" /></svg></div><div className="toolbox-group"><h3>Closer to the hardware</h3><p>Microcontrollers <span>·</span> Embedded systems<br />Raspberry Pi <span>·</span> Arduino <span>·</span> Robotics</p></div><div className="toolbox-group"><h3>On the software side</h3><p>C++ <span>·</span> Java <span>·</span> JavaScript<br />HTML & CSS <span>·</span> Front-end development</p></div><div className="toolbox-footer"><span className="tiny-cross">+</span> A WORK IN PROGRESS, JUST LIKE ME.</div></div>
        </div>
      </section>

      <section id="experience" className="experience-section page-width" aria-labelledby="experience-heading">
        <div className="section-heading"><div><div className="eyebrow"><span className="section-number">03 /</span> ALONG THE WAY</div><h2 id="experience-heading">Learning beyond <em>the classroom.</em></h2></div><a className="text-link experience-resume" href={RESUME} download>Full résumé <Download /></a></div>
        <div className="experience-list">
          <article className="experience-row"><div className="experience-date">SEP 2025 — JAN 2026</div><div className="experience-role"><h3>IT Specialist</h3><span>UCLA Undergraduate Admissions</span></div><p>Supported a network of over 100 workstations, maintained hardware and software, and kept the admissions website up to date.</p><span className="experience-index" aria-hidden="true">01</span></article>
          <article className="experience-row"><div className="experience-date">JUN 2023 — JUL 2025</div><div className="experience-role"><h3>Co-Founder & Tech Lead</h3><span>Minim · Music education nonprofit</span></div><p>Helped bring music tutoring to underserved kids. Built and launched the website with HTML, CSS, and JavaScript in partnership with Hack Club.</p><span className="experience-index" aria-hidden="true">02</span></article>
        </div>
      </section>

      <section id="contact" className="contact-section" aria-labelledby="contact-heading"><div className="contact-inner page-width"><div className="eyebrow"><span className="contact-dot" /> OPEN TO NEW OPPORTUNITIES</div><div className="contact-main"><h2 id="contact-heading">Let’s build<br />something <em>good.</em></h2><div className="contact-copy"><p>Have an internship opportunity, an interesting<br className="desktop-break" /> project, or just want to talk engineering?<br />I’d love to hear from you.</p><a className="contact-email" href={`mailto:${EMAIL}`}>{EMAIL}<Arrow diagonal /></a><a className="contact-linkedin" href={LINKEDIN} target="_blank" rel="noreferrer">Find me on LinkedIn <Arrow diagonal /><span className="sr-only"> (opens in a new tab)</span></a></div></div><div className="contact-bottom"><span>GOOD THINGS START WITH A CONVERSATION.</span><svg viewBox="0 0 54 54" fill="none" stroke="currentColor" strokeWidth="1.1" aria-hidden="true"><path d="M27 1v52M1 27h52M8.5 8.5l37 37m0-37-37 37" /></svg></div></div></section>
    </main>

    <footer className="site-footer page-width"><a href="#" className="footer-signature" aria-label="Jared Ashman, back to top">Jared Ashman<span>.</span></a><p>Circuits, code & a little curiosity.</p><a href="#">Back to top <Arrow diagonal /></a></footer>
    <ProjectDialog project={activeProject} onClose={() => setActiveProject(null)} />
  </>
}

export default App
