import { projects } from '../projects'
import type { Project } from '../projects'
import './ProjectPage.css'

export type ProjectPageId = 'pilight' | 'line-follower' | 'dart-robot'
type Props = { projectId: ProjectPageId }

function Arrow({ back = false }: { back?: boolean }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true" focusable="false">
    {back ? <path d="M20 12H4m6-6-6 6 6 6" /> : <path d="M4 12h16m-6-6 6 6-6 6" />}
  </svg>
}

function PhotoSpace({ title, number, caption, wide = false }: { title: string; number: string; caption: string; wide?: boolean }) {
  return <figure className={`project-page-photo ${wide ? 'project-page-photo-wide' : ''}`}>
    <div className="blank-photo" data-photo-slot="" role="img" aria-label={`Reserved space for a ${title} project photograph`} />
    <figcaption><span>{number} / {caption}</span><span>PHOTOGRAPHY TO FOLLOW</span></figcaption>
  </figure>
}

function RelatedProject({ href, eyebrow, title, description }: { href: string; eyebrow: string; title: string; description: string }) {
  return <a className="project-page-related" href={href}>
    <div><span className="project-page-kicker">{eyebrow}</span><h2>{title}</h2><p>{description}</p></div>
    <span className="project-page-related-arrow"><Arrow /></span>
  </a>
}

export default function ProjectPage({ projectId }: Props) {
  const isBackstory = projectId === 'dart-robot'
  const project = isBackstory ? null : projects.find(item => item.id === projectId)
  const title = project?.title ?? 'Dart-launching robot'
  const status = project?.status ?? 'Earlier project'
  const tags = project?.tags ?? ['Robotics', 'Project backstory']

  return <main id="main" className="project-page">
    <article className="project-page-inner page-width">
      <nav className="project-page-breadcrumb" aria-label="Project breadcrumb">
        <a href="#work"><Arrow back />Back to projects</a><span aria-hidden="true">/</span><span>{title}</span>
      </nav>

      <header className="project-page-header">
        <div className="project-page-title-group">
          <p className="project-page-kicker">{isBackstory ? 'PROJECT BACKSTORY' : `PROJECT ${project?.number} / ${project?.eyebrow}`}</p>
          <h1>{title}</h1>
          <p className="project-page-lead">{project?.subtitle ?? 'The earlier build behind a new direction.'}</p>
        </div>
        <dl className="project-page-metadata">
          <div><dt>STATUS</dt><dd><span className="project-page-status-dot" />{status}</dd></div>
          <div><dt>{isBackstory ? 'CONTEXT' : 'WORKING WITH'}</dt><dd className="project-page-tags">{tags.map(tag => <span key={tag}>{tag}</span>)}</dd></div>
        </dl>
      </header>

      {projectId === 'line-follower' && <aside className="project-page-origin" aria-label="Project inspiration">
        <span className="project-page-origin-line" aria-hidden="true" />
        <div><p>Inspired by my dart-launching robot.</p><a href="#/projects/dart-robot">Explore the earlier project <Arrow /></a></div>
      </aside>}

      <PhotoSpace title={title} number="01" caption="PROJECT OVERVIEW" wide />

      <section className="project-page-overview" aria-labelledby="project-overview-title">
        <div><p className="project-page-kicker">THE IDEA</p><h2 id="project-overview-title">{isBackstory ? 'Where the next idea started.' : 'From a question to a project.'}</h2></div>
        <div className="project-page-overview-copy"><p>{project?.overview ?? 'My earlier dart-launching robot inspired the PID line-following car I’m currently developing.'}</p>
          {isBackstory && <a className="project-page-inline-link" href="#/projects/line-follower">Follow the idea to the line-following car <Arrow /></a>}
        </div>
      </section>

      {project && <ProjectContributions project={project} />}

      <div className="project-page-photo-grid">
        <PhotoSpace title={title} number="02" caption="A CLOSER LOOK" />
        <PhotoSpace title={title} number="03" caption="ON THE WORKBENCH" />
      </div>

      <section className="project-page-next" aria-label="Continue exploring">
        {projectId === 'pilight' && <RelatedProject href="#/projects/line-follower" eyebrow="ANOTHER IDEA ON THE WORKBENCH" title="PID Line-Following Car" description="Exploring sensing and feedback control with an ESP32." />}
        {projectId === 'line-follower' && <RelatedProject href="#/projects/pilight" eyebrow="ANOTHER IDEA ON THE WORKBENCH" title="PiLight" description="Connecting frequency information with reactive light." />}
        {isBackstory && <RelatedProject href="#/projects/line-follower" eyebrow="THE NEXT CHAPTER" title="PID Line-Following Car" description="The current project inspired by this earlier robot." />}
      </section>
      <div className="project-page-bottom"><a href="#work"><Arrow back />All projects</a><a href="mailto:jaredashman0209@gmail.com">Let’s talk about the build <Arrow /></a></div>
    </article>
  </main>
}

function ProjectContributions({ project }: { project: Project }) {
  return <section className="project-page-contributions" aria-labelledby="project-focus-title">
    <div className="project-page-section-head"><p className="project-page-kicker">INSIDE THE PROJECT</p><h2 id="project-focus-title">What I’m working on.</h2></div>
    <div className="project-page-contribution-grid">{project.contributions.map((contribution, index) => <section key={contribution.title}>
      <span className="project-page-contribution-number">0{index + 1}</span><h3>{contribution.title}</h3><p>{contribution.text}</p>
    </section>)}</div>
  </section>
}
