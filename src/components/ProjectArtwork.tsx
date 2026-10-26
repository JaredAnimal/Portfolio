import { useId } from 'react'

type Props = { kind: 'rov' | 'pilight' | 'robot'; className?: string }

const ink = '#586047'
const pale = '#d5d4b9'
const dark = '#3e4937'
const copper = '#ae7956'
const paper = '#eee9d8'

function BoardPins({ x, y, count = 9, vertical = false }: { x: number; y: number; count?: number; vertical?: boolean }) {
  return <g fill="#c3a572" stroke={ink} strokeWidth="0.7">
    {Array.from({ length: count }, (_, i) => <rect key={i} x={x + (vertical ? 0 : i * 7)} y={y + (vertical ? i * 7 : 0)} width={vertical ? 8 : 3} height={vertical ? 3 : 8} rx="0.7" />)}
  </g>
}

function ROV() {
  return <>
    <g fill="none" stroke="#73978c" strokeWidth="1" opacity="0.32">
      <path d="M48 254c35-17 58 17 92 0s57-17 92 0 57 17 92 0 57-17 92 0 34 13 58 1" />
      <path d="M62 277c35-17 58 17 92 0s57-17 92 0 57 17 92 0 57-17 92 0" />
    </g>
    <ellipse cx="260" cy="252" rx="165" ry="44" fill="#75968a" opacity="0.10" />
    <ellipse cx="260" cy="248" rx="125" ry="26" fill="#547669" opacity="0.09" />
    <g stroke={ink} strokeLinejoin="round" strokeLinecap="round">
      <path d="M144 136 300 92 404 153 246 198Z" fill={pale} strokeWidth="1.5" />
      <path d="M157 139 298 101 388 154 248 190Z" fill={paper} strokeWidth="1" />
      <path d="M149 220 300 178 401 236 245 281Z" fill="#bec3aa" strokeWidth="1.5" />
      <path d="M163 222 300 187 386 236 246 273Z" fill="#dce1cc" strokeWidth="1" />
      <path d="M149 220 245 275 401 232" strokeWidth="8" fill="none" />
      <path d="M145 135v88m102-28v83m154-125v81M300 94v85" strokeWidth="9" fill="none" />
      <path d="M145 135v88m102-28v83m154-125v81M300 94v85" stroke="#d8d7bc" strokeWidth="4" fill="none" />
      <path d="M145 135 300 92 402 153 247 196Z" strokeWidth="9" fill="none" />
      <path d="M145 135 300 92 402 153 247 196Z" stroke="#d8d7bc" strokeWidth="4" fill="none" />
      <path d="M149 220 300 178 401 236M146 166 247 226 402 183" strokeWidth="2" fill="none" opacity=".45" />
      <path d="M184 190 280 164 336 197 241 224Z" fill="#77856a" strokeWidth="1.5" />
      <path d="M184 190v10l57 34v-10m0 10 95-27v-10" fill="#5c6a51" strokeWidth="1.5" />
      <path d="M213 185 258 173 284 188 239 201Z" fill={dark} strokeWidth="1" />
      <path d="M226 183 245 178 262 188 243 193Z" fill="#b8bc9e" stroke="none" />
      <path d="M292 186 312 180 328 190 308 195Z" fill="#d1bb84" strokeWidth="1" />
      <path d="M247 190c-32-13-12-47 22-45s57 26 51 43" fill="none" stroke={copper} strokeWidth="3" />
      <path d="M273 191c45 7 41 29 8 39s-73 2-89-10" fill="none" stroke="#556a62" strokeWidth="2.5" />
      <path d="M304 109c2-37 43-39 54-18 8 15-10 22-10 5 0-29 27-52 58-52" fill="none" stroke={copper} strokeWidth="2" strokeDasharray="5 4" />
      <g transform="translate(147 193) rotate(28)">
        <path d="M-27-13h43v30h-43Z" fill="#6c7964" strokeWidth="1.5" />
        <ellipse cx="16" cy="2" rx="12" ry="16" fill="#c6ccb4" strokeWidth="2" />
        <ellipse cx="16" cy="2" rx="8" ry="12" fill={dark} />
        <path d="m16 2-4-8m4 8 5 6m-5-6-4 7" stroke="#cbd1b8" strokeWidth="3" />
        <circle cx="16" cy="2" r="2.5" fill="#bcb79a" strokeWidth="0.5" />
      </g>
      <g transform="translate(356 207) rotate(-16)">
        <path d="M-20-14h38v31h-38Z" fill="#6c7964" strokeWidth="1.5" />
        <ellipse cx="18" cy="1" rx="12" ry="16" fill="#c6ccb4" strokeWidth="2" />
        <ellipse cx="18" cy="1" rx="8" ry="12" fill={dark} />
        <path d="m18 1-4-8m4 8 5 6m-5-6-4 7" stroke="#cbd1b8" strokeWidth="3" />
        <circle cx="18" cy="1" r="2.5" fill="#bcb79a" strokeWidth="0.5" />
      </g>
      <g transform="translate(230 247)">
        <path d="m-20-13 39-11 10 7v20L-10 14-20 7Z" fill="#73816a" strokeWidth="1.3" />
        <ellipse cx="-11" cy="1" rx="9" ry="13" transform="rotate(-24 -11 1)" fill="#c6ccb4" strokeWidth="1.8" />
        <ellipse cx="-11" cy="1" rx="5.5" ry="9" transform="rotate(-24 -11 1)" fill={dark} />
      </g>
      <circle cx="156" cy="138" r="2" fill={dark} />
      <circle cx="297" cy="101" r="2" fill={dark} />
      <circle cx="391" cy="154" r="2" fill={dark} />
      <circle cx="247" cy="188" r="2" fill={dark} />
    </g>
    <g fill="none" stroke={ink} opacity=".55" strokeWidth=".9">
      <path d="M116 139H77v-26m311 113h53v23M249 294v13" />
      <circle cx="116" cy="139" r="2" fill={paper} /><circle cx="388" cy="226" r="2" fill={paper} />
    </g>
    <g fill={ink} fontFamily="monospace" fontSize="8" letterSpacing="1.4" opacity=".75">
      <text x="58" y="103">FIRMWARE</text><text x="423" y="264">TEST / REFINE</text>
    </g>
  </>
}

function PiLight() {
  return <>
    <g stroke={ink} fill="none" strokeWidth="1.1" opacity=".3">
      <path d="M63 79h392" strokeDasharray="2 5" />
      <path d="M63 94v-30m392 30V64" />
    </g>
    <path d="M65 79h22l7-8 8 16 9-30 9 44 9-65 10 85 9-67 9 37 8-20 8 8h29l9-12 9 25 9-49 9 70 9-62 8 34 8-6h30l8-9 8 18 9-33 9 50 9-41 9 17 8-2h57" fill="none" stroke={copper} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <ellipse cx="255" cy="249" rx="176" ry="22" fill="#727852" opacity=".09" />
    <g transform="translate(74 129) rotate(-6 75 61)" stroke={ink} strokeLinejoin="round">
      <rect x="1" y="6" width="158" height="115" rx="8" fill="#5a6d4a" strokeWidth="1.2" />
      <rect width="158" height="115" rx="8" fill="#84926a" strokeWidth="1.5" />
      <path d="M13 39h33v-8h24v20h25m-81 6h17v26h19m41 18V84h33V65h19m-89 35v-9h29v-20" fill="none" stroke="#bac39b" strokeWidth="1.2" />
      <BoardPins x={22} y={9} count={16} />
      <rect x="49" y="42" width="44" height="39" rx="2" fill={dark} strokeWidth="1.1" />
      <rect x="57" y="49" width="28" height="25" rx="1" fill="#6f7a5b" stroke="#a8b18d" strokeWidth=".7" />
      <BoardPins x={51} y={34} count={6} /><BoardPins x={51} y={81} count={6} />
      <rect x="126" y="25" width="38" height="26" rx="2" fill="#c6c7b4" strokeWidth="1.4" />
      <rect x="126" y="63" width="38" height="34" rx="2" fill="#c6c7b4" strokeWidth="1.4" />
      <path d="M143 29v18m-10 31h25m-25 10h25" fill="none" opacity=".65" />
      <rect x="13" y="92" width="23" height="18" rx="1" fill="#c3c4ac" strokeWidth="1" />
      <circle cx="14" cy="23" r="4" fill={paper} /><circle cx="143" cy="12" r="4" fill={paper} /><circle cx="143" cy="105" r="4" fill={paper} />
      <circle cx="108" cy="95" r="3" fill="#d6af61" strokeWidth=".6" />
      <text x="17" y="75" fill="#e6e6ce" stroke="none" fontSize="15" fontFamily="monospace">Pi</text>
    </g>
    <g fill="none" strokeWidth="2.8" strokeLinecap="round">
      <path d="M189 143c39-49 77-48 101 4" stroke={copper} />
      <path d="M198 148c34-32 66-21 86 9" stroke="#dfc58d" />
      <path d="M204 153c31-19 60-9 77 14" stroke="#4d624f" />
    </g>
    <g transform="translate(289 142) rotate(7 65 49)" stroke={ink} strokeLinejoin="round">
      <path d="M0 8 8 0h118l11 10v78l-9 10H8L0 91Z" fill="#b0b596" strokeWidth="1.5" />
      <path d="M0 87v6l9 10h119l9-10v-6" fill="#69765c" strokeWidth="1.1" />
      <rect x="36" y="36" width="69" height="22" rx="1.5" fill={dark} strokeWidth="1" />
      <BoardPins x={40} y={29} count={9} /><BoardPins x={40} y={58} count={9} />
      <rect x="15" y="7" width="102" height="9" rx="1" fill={dark} />
      <rect x="15" y="79" width="75" height="9" rx="1" fill={dark} />
      {Array.from({ length: 13 }, (_, i) => <circle key={i} cx={20 + i * 7.4} cy="11.5" r="1.3" fill="#cdbd93" stroke="none" />)}
      <rect x="-6" y="30" width="26" height="28" rx="2" fill="#c9c8b8" strokeWidth="1.3" />
      <rect x="1" y="68" width="20" height="17" rx="2" fill={dark} />
      <circle cx="121" cy="22" r="3" fill={paper} /><circle cx="121" cy="79" r="3" fill={paper} />
      <text x="100" y="72" fill={ink} stroke="none" fontSize="10" fontFamily="monospace">UNO</text>
    </g>
    <path d="M401 226c27 2 39 20 20 35s-46 15-46 28" stroke={copper} strokeWidth="2" fill="none" />
    <g transform="translate(91 276) rotate(-2 169 10)">
      <rect width="338" height="19" rx="3" fill="#d8d1ae" stroke={ink} strokeWidth="1" />
      {Array.from({ length: 11 }, (_, i) => <g key={i} transform={`translate(${11 + i * 30} 4)`}>
        <rect width="13" height="11" rx="2" fill="#e5bc68" opacity=".27" />
        <rect x="2" y="1" width="9" height="9" rx="1" fill="#f8e8a5" stroke="#ae9663" strokeWidth=".7" />
        <path d="M15 3h9m-9 4h9" stroke="#a59b73" strokeWidth=".6" />
      </g>)}
    </g>
  </>
}

function Wheel({ x, y, rotate = 0 }: { x: number; y: number; rotate?: number }) {
  return <g transform={`translate(${x} ${y}) rotate(${rotate})`} stroke={dark} strokeLinejoin="round">
    <ellipse cx="7" cy="0" rx="20" ry="28" fill="#65705a" strokeWidth="1.5" />
    <path d="M0-28h8M0 28h8" strokeWidth="1.5" />
    <ellipse rx="20" ry="28" fill="#858c71" strokeWidth="1.8" />
    {[-19, -9, 1, 11, 21].map((n, i) => <path key={i} d={`M${-15 + (i === 0 || i === 4 ? 4 : 0)} ${n - 3}l23 8`} fill="none" stroke="#424b3a" strokeWidth="4" strokeLinecap="round" />)}
    <ellipse rx="9" ry="13" fill="#c2c1a4" strokeWidth="1.2" /><ellipse rx="3" ry="5" fill={ink} />
  </g>
}

function Robot() {
  return <>
    <ellipse cx="266" cy="263" rx="168" ry="30" fill="#647052" opacity=".1" />
    <g fill="none" stroke={ink} strokeWidth=".8" opacity=".45">
      <path d="m91 249 142 83m5-13 195-55M98 239l-12 21m150 63-6 12m202-81 8 15" />
      <path d="m379 71 76-27" strokeDasharray="3 4" />
    </g>
    <Wheel x={321} y={169} rotate={-20} />
    <Wheel x={147} y={218} rotate={-20} />
    <g stroke={ink} strokeLinejoin="round" strokeWidth="1.5">
      <path d="m137 183 176-48 108 65-178 51Z" fill="#b7bba0" />
      <path d="m137 183 106 68v22l-106-67Z" fill="#8d9878" />
      <path d="m243 251 178-51v22l-178 51Z" fill="#687958" />
      <path d="m151 182 160-41 95 58-161 44Z" fill="#c9ccb3" strokeWidth=".9" />
      <path d="m172 190 151-40m-127 56 151-41m-128 55 151-40m-105 53 130-36" opacity=".28" strokeWidth="1" />
      <path d="m208 165 79-22 57 34-81 22Z" fill="#7a8969" />
      <path d="m208 165 55 34v20l-55-34Zm55 34 81-22v21l-81 21Z" fill="#52664c" />
      <path d="m220 159 26-35 45-12 27 46-47 14Z" fill="#b9bea1" />
      <path d="m246 124 25 48v34m-41-55 41 21 47-14" fill="none" strokeWidth="2" />
      <path d="m239 132 107-46 21 13-103 50Z" fill="#9a9f7e" />
      <path d="m264 149 103-50v17l-103 50Z" fill="#687457" />
      <path d="m239 132 25 17v17l-25-17Z" fill="#b7ba9b" />
      <path d="m252 130 98-43 9 6-98 45Z" fill={dark} />
      <path d="m263 131 105-47 12 7-107 49Z" fill={copper} stroke="#805c44" strokeWidth="1" />
      <path d="m368 84 16-1-4 8Z" fill="#d8bd8a" stroke="#805c44" strokeWidth="1" />
      <path d="m257 134-13 1 8 7Z" fill="#b67550" stroke="#805c44" strokeWidth=".8" />
      <path d="m313 199 41-12 27 15-42 12Z" fill="#667e5a" />
      <path d="m326 199 15-4 11 6-16 4Z" fill={dark} strokeWidth=".5" />
      <path d="m306 185c36-7 45 12 44 20m-77 8c2 28 60 29 78-5" fill="none" stroke={copper} strokeWidth="2.5" />
      <path d="m281 220 26-7 13 8-27 8Z" fill="#c8b988" strokeWidth=".8" />
      <circle cx="160" cy="185" r="2.4" fill={dark} /><circle cx="310" cy="146" r="2.4" fill={dark} /><circle cx="399" cy="199" r="2.4" fill={dark} /><circle cx="246" cy="240" r="2.4" fill={dark} />
    </g>
    <Wheel x={401} y={225} rotate={-20} />
    <Wheel x={228} y={272} rotate={-20} />
    <g fill="none" stroke={ink} strokeWidth=".9" opacity=".6">
      <path d="M182 157H93v-28m282 91h76v20" /><circle cx="182" cy="157" r="2" fill={paper} /><circle cx="375" cy="220" r="2" fill={paper} />
    </g>
    <g fill={ink} fontFamily="monospace" fontSize="8" letterSpacing="1.4" opacity=".75"><text x="72" y="118">BUILD / ITERATE</text><text x="411" y="255">CONTROL</text></g>
  </>
}

export default function ProjectArtwork({ kind, className }: Props) {
  const uid = useId().replace(/:/g, '')
  return <svg className={className} viewBox="0 0 520 340" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <defs>
      <pattern id={`${uid}-grid`} width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0v24" stroke="#929577" strokeWidth=".65" opacity=".16" /></pattern>
      <radialGradient id={`${uid}-wash`}><stop stopColor={kind === 'rov' ? '#b8c9b8' : '#d9d6b9'} stopOpacity=".72" /><stop offset="1" stopColor="#e8e3cd" stopOpacity="0" /></radialGradient>
    </defs>
    <rect width="520" height="340" fill={`url(#${uid}-grid)`} />
    <ellipse cx="262" cy="180" rx="237" ry="161" fill={`url(#${uid}-wash)`} />
    {kind === 'rov' ? <ROV /> : kind === 'pilight' ? <PiLight /> : <Robot />}
    <g stroke={ink} strokeWidth=".8" opacity=".4"><path d="M22 24h9m-4.5-4.5v9M489 316h9m-4.5-4.5v9" /></g>
  </svg>
}
