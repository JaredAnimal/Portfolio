import pickleballTeam from './assets/photos/pickleball/team.jpg'
import pickleballCourt from './assets/photos/pickleball/on-court.jpg'
import pickleballDoubles from './assets/photos/pickleball/doubles.jpg'
import sunflowerWorkbench from './assets/photos/sunflower/workbench.jpg'
import sunflowerHull from './assets/photos/sunflower/hull-and-mounts.jpg'
import sunflowerElectronics from './assets/photos/sunflower/poolside-electronics.jpg'
import sunflowerWorkshopMonitor from './assets/photos/sunflower/workshop-monitor.jpg'
import sunflowerPoolside from './assets/photos/sunflower/poolside.jpg'
import sunflowerPoolMonitor from './assets/photos/sunflower/pool-monitor.jpg'

export interface PortfolioPhoto {
  id: string
  subject: 'pickleball' | 'sunflower'
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
