import pilight from '../assets/illustrations/pilight.png'
import lineFollower from '../assets/illustrations/line-follower.png'
import dartRobot from '../assets/illustrations/dart-robot.png'
import teaching from '../assets/illustrations/teaching.png'
import navy from '../assets/illustrations/navy.png'
import admissions from '../assets/illustrations/admissions.png'
import pickleball from '../assets/illustrations/pickleball.png'
import './PlaceholderArt.css'

export type PlaceholderKind = 'pilight' | 'line-follower' | 'dart-robot' | 'sunflower' | 'wind-turbine' | 'teaching' | 'navy' | 'admissions' | 'pickleball'
type PlaceholderVariant = 'default' | 'detail' | 'secondary'

const illustrations: Record<Exclude<PlaceholderKind, 'sunflower' | 'wind-turbine'>, string> = {
  pilight,
  'line-follower': lineFollower,
  'dart-robot': dartRobot,
  teaching,
  navy,
  admissions,
  pickleball,
}

type Props = {
  kind: PlaceholderKind
  label: string
  className?: string
  variant?: PlaceholderVariant
}

/** Temporary artwork: swap this component for real photography when available. */
export default function PlaceholderArt({ kind, label, className = '', variant = 'default' }: Props) {
  if (kind === 'wind-turbine') return <div className={`photo-slot placeholder-art placeholder-art-wind ${className}`.trim()} data-photo-slot="" data-photo-pending="wind-turbine" role="img" aria-label={`${label} — project photography to follow`}>
    <div className="photo-pending-copy" aria-hidden="true"><svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M32 28v30M20 58h24M32 25l-3-20h6l-3 20Zm-3 4L12 42l-3-5 20-8Zm6 0 20 8-3 5-17-13Z" /><circle cx="32" cy="28" r="3" /></svg><span>{label}</span><small>PROJECT PHOTOS TO COME</small></div>
  </div>
  if (kind === 'sunflower') return <div className={`photo-slot placeholder-art placeholder-art-sunflower ${className}`.trim()} data-photo-slot="" data-photo-pending="sunflower" role="img" aria-label={`${label} — project photography to follow`}>
    <div className="photo-pending-copy" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M8 14h9l3-5h8l3 5h9v25H8V14Z" /><circle cx="24" cy="26" r="8" /><path d="M34 19h3M4 8h5M6.5 5.5v5M39 44h5m-2.5-2.5v5" /></svg><span>{label}</span><small>PROJECT PHOTOS TO COME</small></div>
  </div>
  return <div
    className={`photo-slot placeholder-art placeholder-art-${kind} placeholder-art--${variant} ${className}`.trim()}
    data-photo-slot=""
    data-placeholder-illustration={kind}
  >
    <img src={illustrations[kind]} alt={`${label} — temporary concept illustration; real photography to follow`} width="1536" height="1024" loading="lazy" decoding="async" />
    <span className="placeholder-art__caption" aria-hidden="true">CONCEPT ILLUSTRATION</span>
  </div>
}
