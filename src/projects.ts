export type ProjectKind = 'rov' | 'pilight' | 'robot'

export interface Project {
  id: ProjectKind
  number: string
  title: string
  subtitle: string
  summary: string
  tags: string[]
  status: string
  overview: string
  contributions: { title: string; text: string }[]
}

export const projects: Project[] = [
  {
    id: 'rov',
    number: '01',
    title: 'Underwater ROV',
    subtitle: 'An idea, taken below the surface.',
    summary: 'An underwater robot built from scratch, from microcontroller firmware to hull design and underwater testing.',
    tags: ['Robotics', 'Embedded systems'],
    status: 'Built & tested',
    overview: 'A hands-on exploration of what it takes to make a robot work underwater. I built an ROV from the ground up, working across the physical structure, embedded firmware, and testing in the water.',
    contributions: [
      { title: 'Firmware', text: 'Designed the microcontroller firmware for the underwater robot.' },
      { title: 'Structure', text: 'Designed and built the hull structure as part of the complete ROV.' },
      { title: 'Testing', text: 'Took the robot into the water to test the build beyond the workbench.' },
    ],
  },
  {
    id: 'pilight',
    number: '02',
    title: 'PiLight',
    subtitle: 'Making sound a little more visible.',
    summary: 'Connecting a Raspberry Pi and Arduino Uno to turn the frequency and volume of analog signals into light.',
    tags: ['Signal processing', 'Microcontrollers'],
    status: 'In progress',
    overview: 'PiLight explores the connection between sound and light. The project uses a Raspberry Pi together with an Arduino Uno to interpret analog signals and use their frequency and volume to control lighting.',
    contributions: [
      { title: 'Hardware', text: 'Working with a Raspberry Pi and an Arduino Uno together.' },
      { title: 'Signals', text: 'Interpreting analog signals to extract frequency and volume.' },
      { title: 'Light', text: 'Using the extracted signal information to control lights. This project is a work in progress.' },
    ],
  },
  {
    id: 'robot',
    number: '03',
    title: 'Dart-launching robot',
    subtitle: 'Movement meets a little friendly aim.',
    summary: 'An omni-wheeled robot with a dart launcher, aerodynamics testing, and a locally served web interface.',
    tags: ['Robotics', 'Web interfaces'],
    status: 'Built & tested',
    overview: 'A robot that combines omni-wheel movement with a dart-launching mechanism. The project brought physical testing and a web-based control interface into the same build.',
    contributions: [
      { title: 'Robot', text: 'Built an omni-wheeled robot with the ability to launch darts.' },
      { title: 'Testing', text: 'Performed aerodynamics testing as part of developing the launcher.' },
      { title: 'Interface', text: 'Implemented a web-based user interface using a local server.' },
    ],
  },
]
