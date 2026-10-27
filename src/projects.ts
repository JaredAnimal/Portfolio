import type { ProjectLink, ProjectMetric } from './projectDetails'

export type ProjectKind = 'pilight' | 'line-follower' | 'sunflower'

export interface Project {
  id: ProjectKind
  number: string
  title: string
  eyebrow: string
  subtitle: string
  summary: string
  tags: string[]
  status: string
  overview: string
  contributions: { title: string; text: string }[]
  metrics: ProjectMetric[]
  links: ProjectLink[]
}

export const projects: Project[] = [
  {
    id: 'pilight',
    number: '01',
    title: 'PiLight',
    eyebrow: 'Frequency → light',
    subtitle: 'Finding the light in a signal.',
    summary: 'An ESP32-based reactive LED system using Python and FFT analysis to turn frequency information into light.',
    tags: ['ESP32', 'Python', 'FFT'],
    status: 'In development',
    metrics: [{ caption: 'Response latency' }, { caption: 'Frequency resolution' }],
    links: [{ label: 'Source code' }, { label: 'Demo video' }],
    overview: 'PiLight connects signal processing with a visible response. I’m developing an ESP32-based reactive LED system, writing Python code that uses fast Fourier transform (FFT) analysis to extract frequency information and control LED behavior.',
    contributions: [
      { title: 'Embedded platform', text: 'Developing the reactive LED system around an ESP32 microcontroller.' },
      { title: 'Frequency analysis', text: 'Writing Python signal-processing code that uses FFT analysis to extract frequency information.' },
      { title: 'Reactive light', text: 'Using the frequency information to control LED behavior as the system takes shape.' },
    ],
  },
  {
    id: 'line-follower',
    number: '02',
    title: 'PID Line-Following Car',
    eyebrow: 'Sensing → control',
    subtitle: 'A little feedback. A clearer path.',
    summary: 'An ESP32 car in progress, using eight brightness sensors and firmware designed to implement PID line-following control.',
    tags: ['ESP32', 'Arduino IDE', 'PID control'],
    status: 'In progress',
    metrics: [{ caption: 'Tracking error' }, { caption: 'Control loop rate' }],
    links: [{ label: 'Source code' }, { label: 'Build video' }],
    overview: 'I’m designing an ESP32-based line-following car that uses eight brightness sensors to detect a line. The project brings sensing and control together, with firmware in development in the Arduino IDE to implement PID control using sensor feedback.',
    contributions: [
      { title: 'Line detection', text: 'Designing the car around eight brightness sensors to detect the line.' },
      { title: 'Embedded firmware', text: 'Developing ESP32 firmware in the Arduino IDE.' },
      { title: 'Feedback control', text: 'Implementing PID control using sensor feedback as part of the ongoing firmware development.' },
    ],
  },
  {
    id: 'sunflower',
    number: '03',
    title: 'Sunflower',
    eyebrow: 'Design → dive',
    subtitle: 'Taking the next idea underwater.',
    summary: 'An underwater robotics course project with Team OceanGate, bringing a cylindrical body, motor layout, and custom mounting design together.',
    tags: ['Underwater robotics', 'CAD', 'Mechanical design'],
    status: 'Course project',
    overview: 'Sunflower is the underwater robot I developed with Team OceanGate for my underwater robotics course. Our design snapshot explores a cylindrical body with internal wiring, a six-motor layout, and custom motor mounts. It also documents plans for controller input, 3D-printed parts, and a shark-fin detail.',
    contributions: [
      { title: 'Movement underwater', text: 'The team’s CAD layout places two motors centrally for vertical movement, with four front and rear motors for horizontal movement and yaw control.' },
      { title: 'Body and motor mounts', text: 'Custom split clamps and supporting brackets attach the motors to the cylindrical body, with openings to route wiring inside.' },
      { title: 'Control and fabrication', text: 'The design explores PS4 controller input, 3D-printed parts, and a shark fin with segmented laser engraving around the body.' },
    ],
    metrics: [{ caption: 'Dive depth' }, { caption: 'Underwater runtime' }],
    links: [{ label: 'Full design snapshot' }, { label: 'Build video' }],
  },
]
