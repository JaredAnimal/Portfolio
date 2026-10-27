export type RoleId = 'teaching' | 'navy' | 'admissions'

export interface Role {
  id: RoleId
  title: string
  organization: string
  date: string
  context: string
  summary: string
  details: string[]
  tags: string[]
}

export const roles: Role[] = [
  {
    id: 'teaching',
    title: 'Student Teacher',
    organization: 'UCLA Henry Samueli School of Engineering and Applied Science',
    date: 'SEP 2026 — PRESENT',
    context: 'Underwater robotics & biomimetic engineering',
    summary: 'Helping engineering concepts become something students can build, test, and demonstrate.',
    details: [
      'Lead hands-on undergraduate instruction in underwater robotics and biomimetic engineering.',
      'Teach fluid dynamics, Arduino programming, soldering, circuitry, logic design, and hardware integration.',
      'Mentor student teams from foundational concepts through assembly, testing, and demonstration.',
    ],
    tags: ['Robotics instruction', 'Hardware integration', 'Student mentorship'],
  },
  {
    id: 'navy',
    title: 'Student Trainee (SSEP)',
    organization: 'U.S. Navy · San Diego, CA',
    date: 'JUN 2026 — SEP 2026',
    context: 'Data analysis & systems sustainment',
    summary: 'Working through complex failure data to better understand the systems behind it.',
    details: [
      'Analyzed complex hardware-failure data for Department of the Navy C5 systems to identify trends and support lifecycle sustainment.',
      'Used failure data to investigate sustainment issues and support improvements to logistics processes.',
    ],
    tags: ['Data analysis', 'Analytical problem-solving', 'Lifecycle sustainment'],
  },
  {
    id: 'admissions',
    title: 'IT Specialist',
    organization: 'UCLA Undergraduate Admissions',
    date: 'SEP 2025 — JUN 2026',
    context: 'Technical support & everyday reliability',
    summary: 'Supporting the hardware, software, and website that help keep admissions moving.',
    details: [
      'Supported more than 100 workstations through hardware maintenance, software deployments, updates, and troubleshooting.',
      'Updated Undergraduate Admissions website content and helped resolve day-to-day technical issues.',
    ],
    tags: ['100+ workstations', 'Technical troubleshooting', 'Systems maintenance'],
  },
]
