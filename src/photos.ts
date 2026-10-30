import windTurbine from './assets/photos/wind-turbine/completed-turbine.jpg'
import pickleballTeam from './assets/photos/pickleball/team.jpg'
import pickleballCourt from './assets/photos/pickleball/on-court.jpg'
import pickleballDoubles from './assets/photos/pickleball/doubles.jpg'
import sunflowerWorkbench from './assets/photos/sunflower/workbench.jpg'
import sunflowerHull from './assets/photos/sunflower/hull-and-mounts.jpg'
import sunflowerElectronics from './assets/photos/sunflower/poolside-electronics.jpg'
import sunflowerWorkshopMonitor from './assets/photos/sunflower/workshop-monitor.jpg'
import sunflowerPoolside from './assets/photos/sunflower/poolside.jpg'
import sunflowerPoolMonitor from './assets/photos/sunflower/pool-monitor.jpg'
import robotPlatform from './assets/photos/line-follower/robot-platform.png'
import imageofPID from './assets/photos/line-follower/imageofPID.png'
import brightLightDisplay from './assets/photos/brightlight/esp32-led-display.png'
import brightLightBench from './assets/photos/brightlight/esp32-bench-test.png'
import brightLightMain from './assets/photos/brightlight/led-matrix.png'
import dartTeam from './assets/photos/dart-robot/team-with-robot.jpg'
import dartWiring from './assets/photos/dart-robot/robot-wiring.jpg'
import districtShowcase from './assets/photos/dart-robot/district-showcase.png'
import dartFlowSimulation from './assets/photos/dart-robot/dart-flow-simulation.jpg'
import launchAngleChart from './assets/photos/dart-robot/launch-angle-chart.png'
import underwaterRobotics from './assets/photos/experience/underwater-robotics.jpg'
import navyShips from './assets/photos/experience/navy-ships.jpg'
import uclaWebPortals from './assets/photos/experience/ucla-web-portals.jpg'
import type { RoleId } from './experience'
import type { ProjectKind } from './projects'

export interface PortfolioPhoto {
  id: string
  subject: 'pickleball' | 'sunflower' | 'pilight' | 'line-follower' | 'dart-robot' | 'wind-turbine' | RoleId
  src: string
  alt: string
  caption: string
  width: number
  height: number
}

// The first photograph in each set is its lead image.
export const pickleballPhotos: PortfolioPhoto[] = [
  { id: 'pickleball-team', subject: 'pickleball', src: pickleballTeam, width: 2600, height: 1733, caption: 'UCLA Club Pickleball', alt: 'UCLA Club Pickleball team gathered on an indoor court, with players holding paddles.' },
  { id: 'pickleball-on-court', subject: 'pickleball', src: pickleballCourt, width: 1733, height: 2600, caption: 'On the court', alt: 'A pickleball player in a ready stance on an indoor court.' },
  { id: 'pickleball-doubles', subject: 'pickleball', src: pickleballDoubles, width: 1733, height: 2600, caption: 'Doubles on court', alt: 'Two pickleball players with paddles standing together on an indoor court.' },
]

export const sunflowerPhotos: PortfolioPhoto[] = [
  { id: 'sunflower-workbench', subject: 'sunflower', src: sunflowerWorkbench, width: 1536, height: 2048, caption: 'USS Sunflower on the workbench', alt: 'USS Sunflower lying on a workshop table, showing its patterned cylindrical body, colored motor mounts, propellers, and front camera.' },
  { id: 'sunflower-hull', subject: 'sunflower', src: sunflowerHull, width: 1536, height: 2048, caption: 'Hull and motor mounts', alt: 'USS Sunflower standing upright on a workbench, showing the patterned hull, colored mounting brackets, and upper propeller housing.' },
  { id: 'sunflower-electronics', subject: 'sunflower', src: sunflowerElectronics, width: 1536, height: 2048, caption: 'Poolside electronics', alt: 'A laptop, wired circuit boards, power supply, and coiled cables arranged beside the pool for USS Sunflower.' },
  { id: 'sunflower-workshop-monitor', subject: 'sunflower', src: sunflowerWorkshopMonitor, width: 1536, height: 2048, caption: 'Camera monitor in the workshop', alt: 'A handheld monitor displaying the workshop camera view, with a seated person visible on the screen.' },
  { id: 'sunflower-poolside', subject: 'sunflower', src: sunflowerPoolside, width: 1536, height: 2048, caption: 'USS Sunflower beside the pool', alt: 'USS Sunflower standing beside a swimming pool with its cables and tether spread across the pool deck.' },
  { id: 'sunflower-pool-monitor', subject: 'sunflower', src: sunflowerPoolMonitor, width: 1536, height: 2048, caption: 'Camera view at the pool', alt: 'A camera monitor showing pool water and the waterline, with figures visible along the pool edge.' },
]

export const lineFollowerPhotos: PortfolioPhoto[] = [
  { id: 'line-follower-platform', subject: 'line-follower', src: robotPlatform, width: 691, height: 361, caption: 'Robot platform', alt: 'A red two-wheeled line-following robot with exposed circuit boards, wiring, and front-mounted sensors.' },
  { id: 'line-follower-sum-error', subject: 'line-follower', src: imageofPID, width: 1178, height: 722, caption: 'SUM vs. ERROR', alt: 'PID line-following car SUM vs. ERROR graph showing the sensor sum plotted against error.' },
]

export const brightLightMainPhoto: PortfolioPhoto = {
  id: 'brightlight-led-matrix', subject: 'pilight', src: brightLightMain, width: 700, height: 356, caption: 'BrightLight LED frequency display', alt: 'BrightLight LED matrix in a dark enclosure showing illuminated red audio-frequency bars.',
}

// Portrait build photographs appear only in the full project page gallery.
export const brightLightPhotos: PortfolioPhoto[] = [
  { id: 'brightlight-esp32-display', subject: 'pilight', src: brightLightDisplay, width: 690, height: 1130, caption: 'ESP32 and LED display', alt: 'BrightLight ESP32 wired on a breadboard beside an illuminated LED matrix, with the controller labeled.' },
  { id: 'brightlight-esp32-bench', subject: 'pilight', src: brightLightBench, width: 514, height: 766, caption: 'ESP32 bench testing', alt: 'BrightLight ESP32 breadboard setup connected to test equipment, with waveform traces visible on an oscilloscope.' },
]

export const dartRobotPhotos: PortfolioPhoto[] = [
  { id: 'dart-showcase', subject: 'dart-robot', src: districtShowcase, width: 2758, height: 1488, caption: 'District innovation showcase', alt: 'Showcase video still of Jared Ashman holding the dart-launching robot, with its launcher and wiring visible.' },
  { id: 'dart-flow-simulation', subject: 'dart-robot', src: dartFlowSimulation, width: 619, height: 323, caption: 'Dart flow simulation', alt: 'Simulation visualization of a dart-shaped body surrounded by flow arrows and a colored fluid-temperature scale.' },
  { id: 'dart-launch-angle', subject: 'dart-robot', src: launchAngleChart, width: 607, height: 463, caption: 'Launch angle and horizontal distance', alt: 'Dart launch angle scatter plot comparing angles in degrees with horizontal distance travelled in millimeters.' },
  { id: 'dart-team', subject: 'dart-robot', src: dartTeam, width: 4032, height: 3024, caption: 'With the dart-launching robot', alt: 'Jared and a friend standing together with the dart-launching robot at a showcase.' },
  { id: 'dart-wiring', subject: 'dart-robot', src: dartWiring, width: 4032, height: 3024, caption: 'Robot wiring', alt: 'Dart-launching robot wiring, motors, and circuit boards arranged on a workbench beside a notebook.' },
]

export const projectPhotos: Partial<Record<ProjectKind | 'dart-robot', PortfolioPhoto[]>> = {
  'wind-turbine': [{ id: 'wind-turbine-main', subject: 'wind-turbine', src: windTurbine, width: 447, height: 447, caption: 'Wind turbine', alt: 'A wind turbine with colorful blades, a white tail, and a wired generator mounted on a pole beside a pond.' }],
  pilight: [brightLightMainPhoto],
  'line-follower': lineFollowerPhotos,
  'dart-robot': dartRobotPhotos,
  sunflower: sunflowerPhotos,
}

export const rolePhotos: Record<RoleId, PortfolioPhoto> = {
  teaching: { id: 'teaching-underwater-robot', subject: 'teaching', src: underwaterRobotics, width: 2417, height: 1370, caption: 'Biomimetic underwater robot', alt: 'A white ray-shaped underwater robot with broad flexible fins submerged above the floor markings of a swimming pool.' },
  navy: { id: 'navy-ships', subject: 'navy', src: navyShips, width: 2478, height: 1651, caption: 'U.S. Navy ships at sea', alt: 'Two U.S. Navy ships underway at sea with a helicopter flying above the farther ship.' },
  admissions: { id: 'admissions-web-portals', subject: 'admissions', src: uclaWebPortals, width: 597, height: 335, caption: 'UCLA web portals', alt: 'UCLA MyUCLA and URSA portal screenshots, shown alongside the admissions IT support role.' },
}
