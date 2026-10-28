import type { ProjectLink, ProjectMetric } from './projectDetails'

export type ProjectKind = 'pilight' | 'line-follower' | 'sunflower' | 'wind-turbine'

export interface Project {
  id: ProjectKind
  number: string
  title: string
  featured: boolean
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
    title: 'BrightLight',
    featured: true,
    eyebrow: 'Signal processing',
    subtitle: 'ESP32 reactive lighting with FFT analysis.',
    summary: 'An ESP32-based reactive LED system using Python and FFT analysis to turn frequency information into light.',
    tags: ['ESP32', 'Python', 'FFT'],
    status: 'In development',
    metrics: [{ caption: 'Response latency', value: '<50 ms' }, { caption: 'Frequency resolution', value: '<2.5 Hz' }],
    links: [{ label: 'Source code' }, { label: 'Demo video' }],
    overview: 'BrightLight is an ESP32-based reactive LED system. Python code uses fast Fourier transform (FFT) analysis to extract frequency information and control LED behavior.',
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
    featured: true,
    eyebrow: 'Feedback control',
    subtitle: 'An ESP32 car with eight-sensor line tracking.',
    summary: 'An ESP32 car in progress, using eight brightness sensors and firmware designed to implement PID line-following control.',
    tags: ['ESP32', 'Arduino IDE', 'PID control'],
    status: 'In progress',
    metrics: [{ caption: 'Tracking error', value: '4%' }, { caption: 'Control loop period', value: '17 ms' }],
    links: [{ label: 'Source code' }],
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
    title: 'USS Sunflower',
    featured: false,
    eyebrow: 'Underwater robotics',
    subtitle: 'A team-built underwater robot with six motors.',
    summary: 'An underwater robotics team project, bringing a cylindrical body, motor layout, and custom mounting design together.',
    tags: ['Underwater robotics', 'CAD', 'Mechanical design'],
    status: 'Course project',
    overview: 'USS Sunflower is the underwater robot I developed with my team for our underwater robotics course. Our design snapshot explores a cylindrical body with internal wiring, a six-motor layout, and custom motor mounts. It also documents plans for controller input, 3D-printed parts, and a shark-fin detail.',
    contributions: [
      { title: 'Movement underwater', text: 'The team’s CAD layout places two motors centrally for vertical movement, with four front and rear motors for horizontal movement and yaw control.' },
      { title: 'Body and motor mounts', text: 'Custom split clamps and supporting brackets attach the motors to the cylindrical body, with openings to route wiring inside.' },
      { title: 'Control and fabrication', text: 'The design explores PS4 controller input, 3D-printed parts, and a shark fin with segmented laser engraving around the body.' },
    ],
    metrics: [{ caption: 'Dive depth', value: '33 ft' }, { caption: 'Underwater runtime', value: '10 min' }],
    links: [{ label: 'Project files' }],
  },
  {
    id: 'wind-turbine',
    number: '04',
    title: 'Wind turbine',
    featured: false,
    eyebrow: 'Energy systems',
    subtitle: 'Building and testing four turbine designs.',
    summary: 'A team wind-turbine project comparing Savonius, horizontal-axis, vertical-axis, and bladeless designs.',
    tags: ['Savonius', 'HAWT', 'VAWT', 'Bladeless'],
    status: 'Tested',
    overview: 'We built a wind turbine and tested four designs: Savonius, horizontal-axis (HAWT), vertical-axis (VAWT), and bladeless. The project explored how different turbine designs respond to wind.',
    contributions: [
      { title: 'Four designs', text: 'Tested Savonius, horizontal-axis, vertical-axis, and bladeless configurations.' },
      { title: 'Building and testing', text: 'Worked as a team to build the turbine and compare the designs through testing.' },
    ],
    metrics: [{ caption: 'Output voltage' }, { caption: 'Max RPM' }],
    links: [{ label: 'Project files' }],
  },
]
