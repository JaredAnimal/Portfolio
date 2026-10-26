import { useId } from 'react'
import type { ProjectKind } from '../projects'

type Props = { kind: ProjectKind; className?: string }

const ink = '#586047'
const dark = '#3e4937'
const copper = '#ae7956'
const paper = '#eee9d8'

function ESP32({ x, y, rotate = 0, scale = 1 }: { x: number; y: number; rotate?: number; scale?: number }) {
  return <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`} stroke={ink} strokeLinejoin="round">
    <rect x="0" y="5" width="126" height="79" rx="5" fill="#526347" strokeWidth="1.2" />
    <rect width="126" height="79" rx="5" fill="#84926a" strokeWidth="1.5" />
    <g fill="#c3a572" strokeWidth=".6">
      {Array.from({ length: 14 }, (_, i) => <g key={i}>
        <rect x={10 + i * 7.7} y="-5" width="3" height="11" rx=".7" />
        <rect x={10 + i * 7.7} y="74" width="3" height="11" rx=".7" />
      </g>)}
    </g>
    <path d="M10 19h16v11h14m-28 29h16V47h15m60 12H90V46H77" fill="none" stroke="#bbc39b" strokeWidth="1.1" />
    <rect x="36" y="15" width="51" height="50" rx="2" fill="#c4c7af" strokeWidth="1.2" />
    <path d="M42 22h16v5H46v5h12v5H45" fill="none" stroke={ink} strokeWidth="1.2" />
    <path d="M42 43h39m-39 4h39" stroke="#a1a88b" strokeWidth=".7" />
    <text x="43" y="58" fontFamily="monospace" fontSize="8" fill={dark} stroke="none" letterSpacing="1">ESP32</text>
    <rect x="-6" y="28" width="22" height="23" rx="2" fill="#c6c7b4" strokeWidth="1.3" />
    <rect x="-6" y="32" width="9" height="15" rx="1" fill={dark} strokeWidth=".8" />
    <rect x="100" y="25" width="10" height="8" rx="1" fill={dark} strokeWidth=".8" />
    <rect x="99" y="47" width="10" height="8" rx="1" fill={dark} strokeWidth=".8" />
    <circle cx="115" cy="13" r="2.8" fill={paper} /><circle cx="115" cy="66" r="2.8" fill={paper} />
    <circle cx="24" cy="16" r="2" fill="#d7b96d" strokeWidth=".6" />
  </g>
}

function PiLight() {
  const bands = [10, 16, 24, 42, 72, 54, 34, 20, 28, 62, 92, 68, 42, 27, 47, 58, 32, 21, 14, 8]
  return <>
    <ellipse cx="262" cy="251" rx="176" ry="25" fill="#727852" opacity=".09" />
    <g transform="translate(72 44)" stroke={ink}>
      <path d="M0 98h157M0 98V0" fill="none" strokeWidth=".8" opacity=".4" />
      <path d="M0 65h157M0 32h157" fill="none" strokeWidth=".6" opacity=".15" strokeDasharray="2 4" />
      {bands.map((height, i) => <rect key={i} x={7 + i * 7.3} y={98 - height} width="4" height={height} rx="1.2" fill={i > 7 && i < 13 ? copper : '#849271'} stroke="none" opacity={.55 + (height / 200)} />)}
      <text x="0" y="116" fontFamily="monospace" fontSize="8" letterSpacing="1.4" fill={ink} stroke="none">FREQUENCY / FFT</text>
    </g>
    <g fill="none" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M250 100h40v48" stroke={ink} opacity=".6" />
      <path d="m286 142 4 6 4-6" stroke={ink} opacity=".6" />
    </g>
    <g transform="translate(282 50)" fill={ink} fontFamily="monospace" fontSize="8" letterSpacing="1.3" opacity=".75">
      <text>PROCESS / RESPOND</text>
      <path d="M0 10h135" stroke={ink} strokeWidth=".6" opacity=".35" />
    </g>
    <ESP32 x={255} y={157} rotate={-8} scale={1.2} />
    <g fill="none" strokeWidth="2.2" strokeLinecap="round">
      <path d="M365 251c39 1 65 16 49 32s-47 1-51 15" stroke={copper} />
      <path d="M357 251c30 5 49 19 39 29s-44 7-44 18" stroke="#d1b97c" />
      <path d="M349 252c26 5 36 19 28 27s-34 6-37 18" stroke="#667451" />
    </g>
    <g transform="translate(81 281) rotate(-2 174 10)">
      <rect width="348" height="20" rx="3" fill="#d8d1ae" stroke={ink} strokeWidth="1" />
      {Array.from({ length: 11 }, (_, i) => <g key={i} transform={`translate(${10 + i * 31} 4)`}>
        <circle cx="7" cy="6" r="13" fill="#e5bc68" opacity={i % 3 === 0 ? '.2' : '.09'} />
        <rect width="14" height="12" rx="2" fill="#e5bc68" opacity=".3" />
        <rect x="2" y="1" width="10" height="10" rx="1" fill={i % 3 === 0 ? '#f9e6a2' : '#d7cc8c'} stroke="#ae9663" strokeWidth=".7" />
        <path d="M17 3h9m-9 5h9" stroke="#a59b73" strokeWidth=".6" />
      </g>)}
    </g>
    <g fill="none" stroke={ink} strokeWidth=".9" opacity=".5">
      <path d="M156 194h42l15-9m-58 9 6-4m-6 4 6 4" />
      <path d="M96 191h25v36m-25-36 5-4m-5 4 5 4" />
      <circle cx="121" cy="227" r="2" fill={paper} />
    </g>
    <g fill={ink} fontFamily="monospace" fontSize="8" letterSpacing="1.4" opacity=".75"><text x="69" y="249">REACTIVE LIGHT</text></g>
  </>
}

function Wheel({ x, y, rotate = 0 }: { x: number; y: number; rotate?: number }) {
  return <g transform={`translate(${x} ${y}) rotate(${rotate})`} stroke={dark} strokeLinejoin="round">
    <ellipse cx="7" cy="0" rx="17" ry="25" fill="#59674f" strokeWidth="1.5" />
    <path d="M0-25h8M0 25h8" strokeWidth="1.5" />
    <ellipse rx="17" ry="25" fill="#7b876a" strokeWidth="1.7" />
    {[-16, -8, 0, 8, 16].map((n, i) => <path key={i} d={`M-12 ${n}l22 2`} fill="none" stroke="#4d5942" strokeWidth="2.5" strokeLinecap="round" />)}
    <ellipse rx="7" ry="11" fill="#c2c1a4" strokeWidth="1.2" /><ellipse rx="2.5" ry="4" fill={ink} />
  </g>
}

function LineFollower() {
  return <>
    <path d="M-9 277c74 70 105-47 168-27s112 85 176 44c74-47 33-133 106-148s64-44 85-55" fill="none" stroke="#555b43" strokeWidth="17" strokeLinecap="round" opacity=".72" />
    <path d="M-9 277c74 70 105-47 168-27s112 85 176 44c74-47 33-133 106-148s64-44 85-55" fill="none" stroke="#84896b" strokeWidth="1" strokeDasharray="3 8" opacity=".5" />
    <ellipse cx="270" cy="236" rx="147" ry="33" fill="#647052" opacity=".12" />
    <g fill="none" stroke={ink} strokeWidth=".8" opacity=".45">
      <path d="M91 83h89m-89 6V77m89 6v-6" />
      <path d="M91 97h58" strokeDasharray="2 4" />
    </g>
    <Wheel x={309} y={148} rotate={-20} />
    <Wheel x={153} y={190} rotate={-20} />
    <g stroke={ink} strokeLinejoin="round" strokeWidth="1.4">
      <path d="m140 162 161-43 103 61-164 47Z" fill="#b7bba0" />
      <path d="m140 162 100 65v19l-100-64Z" fill="#8d9878" />
      <path d="m240 227 164-47v19l-164 47Z" fill="#687958" />
      <path d="m154 162 145-36 91 54-147 40Z" fill="#c9ccb3" strokeWidth=".9" />
      <path d="m172 168 137-37m-112 52 135-36m-111 51 136-36m-113 51 138-37" opacity=".26" strokeWidth="1" />
      <path d="m278 144 25-7 40 24-26 7Z" fill="#899676" strokeWidth="1" />
      <path d="m278 144v10l39 24v-10m0 10 26-7v-10" fill="#6b7b58" strokeWidth="1" />
      <path d="m190 178 11-4m128 27 12-4" strokeWidth="2" />
      <circle cx="164" cy="164" r="2.3" fill={dark} /><circle cx="298" cy="131" r="2.3" fill={dark} /><circle cx="380" cy="180" r="2.3" fill={dark} /><circle cx="244" cy="216" r="2.3" fill={dark} />
    </g>
    <g transform="translate(187 154) matrix(.76 .44 -.75 .23 0 0)"><ESP32 x={0} y={0} scale={.9} /></g>
    <g fill="none" strokeWidth="2" strokeLinecap="round">
      <path d="M258 189c34 14 22 36 1 58" stroke={copper} />
      <path d="M266 187c34 17 28 38 10 60" stroke="#d2bb83" />
      <path d="M271 185c35 18 35 43 21 63" stroke="#5a6c4d" />
    </g>
    <Wheel x={383} y={202} rotate={-20} />
    <Wheel x={228} y={245} rotate={-20} />
    <g stroke={ink} strokeLinejoin="round">
      <path d="m251 237 92-26 29 20-92 27Z" fill="#a5af8b" strokeWidth="1.2" />
      <path d="m280 258 92-27v10l-92 27Z" fill="#667b54" strokeWidth="1.2" />
      <path d="m251 237 29 21v10l-29-22Z" fill="#839370" strokeWidth="1.2" />
      {/* Eight conceptual brightness sensors, one for each documented input. */}
      {Array.from({ length: 8 }, (_, i) => <g key={i} data-sensor={i + 1} transform={`translate(${260 + i * 11.2} ${237 - i * 3.2})`}>
        <path d="m0 0 7-2 11 7-7 2Z" fill="#e2d9b4" strokeWidth=".7" />
        <ellipse cx="9" cy="3" rx="3" ry="1.7" transform="rotate(28 9 3)" fill={dark} strokeWidth=".6" />
      </g>)}
    </g>
    <g fill="none" stroke={ink} strokeWidth=".9" opacity=".6">
      <path d="M347 252h94v-26m-94 26-5-2" /><circle cx="342" cy="250" r="2" fill={paper} />
      <path d="M199 153H92v-27" /><circle cx="199" cy="153" r="2" fill={paper} />
    </g>
    <g fill={ink} fontFamily="monospace" fontSize="8" letterSpacing="1.3" opacity=".75"><text x="71" y="116">ESP32 / PID</text><text x="371" y="216">8 × BRIGHTNESS</text></g>
  </>
}

export default function ProjectArtwork({ kind, className }: Props) {
  const uid = useId().replace(/:/g, '')
  return <svg className={className} viewBox="0 0 520 340" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <defs>
      <pattern id={`${uid}-grid`} width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0v24" stroke="#929577" strokeWidth=".65" opacity=".16" /></pattern>
      <radialGradient id={`${uid}-wash`}><stop stopColor="#d9d6b9" stopOpacity=".72" /><stop offset="1" stopColor="#e8e3cd" stopOpacity="0" /></radialGradient>
    </defs>
    <rect width="520" height="340" fill={`url(#${uid}-grid)`} />
    <ellipse cx="262" cy="180" rx="237" ry="161" fill={`url(#${uid}-wash)`} />
    {kind === 'pilight' ? <PiLight /> : <LineFollower />}
    <g stroke={ink} strokeWidth=".8" opacity=".4"><path d="M22 24h9m-4.5-4.5v9M489 316h9m-4.5-4.5v9" /></g>
  </svg>
}
