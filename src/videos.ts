import assembly from './assets/videos/wind-turbine/h-rotor-assembly.mp4'
import assemblyPoster from './assets/videos/wind-turbine/h-rotor-assembly.jpg'
import prototype from './assets/videos/wind-turbine/h-rotor-prototype.mp4'
import prototypePoster from './assets/videos/wind-turbine/h-rotor-prototype.jpg'
import test from './assets/videos/wind-turbine/wind-tunnel-test.mp4'
import testPoster from './assets/videos/wind-turbine/wind-tunnel-test.jpg'
import voltage from './assets/videos/wind-turbine/voltage-measurement.mp4'
import voltagePoster from './assets/videos/wind-turbine/voltage-measurement.jpg'
import trackRun from './assets/videos/line-follower/track-run.mp4'
import trackRunPoster from './assets/videos/line-follower/track-run.jpg'

export interface ProjectVideoAsset {
  src: string
  poster: string
  caption: string
  originalUrl?: string
}

export const pidCarVideo: ProjectVideoAsset = {
  src: trackRun,
  poster: trackRunPoster,
  caption: 'PID car following the marked course',
  originalUrl: 'https://github.com/JaredAnimal/Portfolio/releases/download/PIDCar/IMG_4535.1.MOV',
}

export const windTurbineVideos: ProjectVideoAsset[] = [
  { src: assembly, poster: assemblyPoster, caption: 'H-rotor assembly animation' },
  { src: prototype, poster: prototypePoster, caption: 'Wind turbine H-rotor prototype' },
  { src: test, poster: testPoster, caption: 'Wind turbine airflow test' },
  { src: voltage, poster: voltagePoster, caption: 'Wind turbine voltage measurement' },
]
