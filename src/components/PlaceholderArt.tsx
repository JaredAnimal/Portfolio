import pilight from '../assets/illustrations/pilight.png'
import lineFollower from '../assets/illustrations/line-follower.png'
import dartRobot from '../assets/illustrations/dart-robot.png'
import teaching from '../assets/illustrations/teaching.png'
import navy from '../assets/illustrations/navy.png'
import admissions from '../assets/illustrations/admissions.png'
import pickleball from '../assets/illustrations/pickleball.png'
import './PlaceholderArt.css'

export type PlaceholderKind = 'pilight' | 'line-follower' | 'dart-robot' | 'teaching' | 'navy' | 'admissions' | 'pickleball'
type PlaceholderVariant = 'default' | 'detail' | 'secondary'

const illustrations: Record<PlaceholderKind, string> = {
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
  return <div
    className={`photo-slot placeholder-art placeholder-art-${kind} placeholder-art--${variant} ${className}`.trim()}
    data-photo-slot=""
    data-placeholder-illustration={kind}
  >
    <img src={illustrations[kind]} alt={`${label} — temporary concept illustration; real photography to follow`} width="1536" height="1024" loading="lazy" decoding="async" />
    <span className="placeholder-art__caption" aria-hidden="true">CONCEPT ILLUSTRATION</span>
  </div>
}
