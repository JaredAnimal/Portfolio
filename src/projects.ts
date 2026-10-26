export type ProjectKind = 'pilight' | 'line-follower'

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
    overview: 'I’m designing an ESP32-based line-following car that uses eight brightness sensors to detect a line. The project brings sensing and control together, with firmware in development in the Arduino IDE to implement PID control using sensor feedback.',
    contributions: [
      { title: 'Line detection', text: 'Designing the car around eight brightness sensors to detect the line.' },
      { title: 'Embedded firmware', text: 'Developing ESP32 firmware in the Arduino IDE.' },
      { title: 'Feedback control', text: 'Implementing PID control using sensor feedback as part of the ongoing firmware development.' },
    ],
  },
]
