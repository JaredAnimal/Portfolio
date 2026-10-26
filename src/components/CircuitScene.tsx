import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import './CircuitScene.css'

const GOLD = '#bda465'
const CREAM = '#e3dbc4'

export type BoardPart = 'projects' | 'experience' | 'transcript' | 'about' | 'pickleball' | 'resume'

type BoardSpot = {
  part: BoardPart
  label: string
  point: [number, number, number]
  labelPosition: [number, number]
  fallback: [number, number]
  radius: number
  hitSize: [number, number, number]
}

// Each story belongs to a physical component. Label positions surround the board
// while the numbered touch targets follow their projected component positions.
const BOARD_SPOTS: BoardSpot[] = [
  { part: 'about', label: 'About', point: [-2.8, 0.69, 0.95], labelPosition: [0.18, 0.22], fallback: [0.2344, 0.4277], radius: 0.59, hitSize: [0.9, 0.65, 0.95] },
  { part: 'pickleball', label: 'Pickleball', point: [-2.45, 0.28, -1.5], labelPosition: [0.5, 0.17], fallback: [0.4018, 0.3106], radius: 0.22, hitSize: [0.5, 0.3, 0.5] },
  { part: 'transcript', label: 'Transcript', point: [1.16, 0.35, -1.7], labelPosition: [0.82, 0.22], fallback: [0.6780, 0.4658], radius: 0.4, hitSize: [0.65, 0.3, 0.6] },
  { part: 'resume', label: 'Résumé', point: [-0.64, 0.35, 1.62], labelPosition: [0.18, 0.77], fallback: [0.3351, 0.5358], radius: 0.27, hitSize: [0.55, 0.35, 0.5] },
  { part: 'projects', label: 'Projects', point: [0, 0.43, 0], labelPosition: [0.5, 0.82], fallback: [0.4955, 0.496], radius: 1.05, hitSize: [1.75, 0.4, 1.75] },
  { part: 'experience', label: 'Experience', point: [2.45, 0.82, 1.15], labelPosition: [0.82, 0.77], fallback: [0.7013, 0.668], radius: 0.45, hitSize: [0.65, 0.85, 1.0] },
]

function BoardFallback({ onSelect, onHighlight, activePart }: { onSelect?: (part: BoardPart) => void; onHighlight: (part: BoardPart | null) => void; activePart: BoardPart | null }) {
  return (
    <svg className="circuit-scene__fallback" viewBox="0 0 640 490" aria-hidden="true">
      <defs>
        <linearGradient id="board-fill" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#68724f" /><stop offset="1" stopColor="#3d4935" />
        </linearGradient>
        <filter id="board-shadow"><feDropShadow dx="0" dy="24" stdDeviation="18" floodColor="#413b22" floodOpacity=".2" /></filter>
      </defs>
      <g transform="translate(320 245) rotate(25) skewX(-15) scale(.72 .576) translate(-240 -155)" filter="url(#board-shadow)">
        <rect x="0" y="0" width="480" height="310" rx="18" fill="url(#board-fill)" stroke="#7d845c" strokeWidth="3" />
        <g stroke={GOLD} strokeWidth="3" fill="none" opacity=".85">
          <path d="M45 50H140L175 85V120H210M30 80H105L150 125H210M40 190H115L150 155H210M30 245H135L170 210H210M45 275H155L185 240V200" />
          <path d="M270 110H320L355 75H430M270 140H350L390 100H450M270 170H330L370 210H440M270 195H310L360 245H435M235 80V40H350M235 225V270H360" />
        </g>
        <g fill={GOLD}>
          {[40, 70, 100, 130, 160, 190, 220, 250].map(y => <circle key={y} cx="458" cy={y} r="5" />)}
          {[25, 455].flatMap(x => [25, 285].map(y => <circle key={`${x}-${y}`} cx={x} cy={y} r="10" />))}
        </g>
        <g fill="#2b3027">{[25, 455].flatMap(x => [25, 285].map(y => <circle key={`${x}-${y}`} cx={x} cy={y} r="5" />))}</g>
        <rect x="185" y="100" width="100" height="108" rx="4" fill="#20271f" stroke="#79806b" />
        <g stroke="#d6c89f" strokeWidth="5">{[115, 132, 149, 166, 183, 200].flatMap(y => [175, 287].map(x => <path key={`${x}-${y}`} d={`M${x} ${y}h10`} />))}</g>
        <text x="235" y="148" textAnchor="middle" fill="#bfc6b0" fontFamily="monospace" fontSize="16">CORE — 01</text>
        <text x="235" y="171" textAnchor="middle" fill="#8d967f" fontFamily="monospace" fontSize="9">BUILT WITH CURIOSITY</text>
        <g fill={CREAM} stroke="#b8ae8d"><rect x="60" y="115" width="32" height="48" rx="4" /><rect x="340" y="115" width="40" height="28" rx="4" /><rect x="340" y="160" width="40" height="28" rx="4" /><rect x="124" y="248" width="32" height="24" rx="3" /></g>
        <circle cx="85" cy="55" r="8" fill="#d5b460" />
        <rect x="330" y="30" width="40" height="30" rx="3" fill="#252d25" />
        <rect x="-10" y="200" width="60" height="48" rx="5" fill="#b1b0a0" /><rect x="-11" y="207" width="20" height="33" fill="#3b4035" />
        <text x="45" y="42" fill="#d9dac1" fontFamily="monospace" fontSize="12">JARED ASHMAN</text>
        <text x="45" y="290" fill="#bfc6a9" fontFamily="monospace" fontSize="10">IDEAS → HARDWARE</text>
        {([
          { part: 'about', x: -12, y: 198, width: 65, height: 52 },
          { part: 'pickleball', x: 69, y: 39, width: 32, height: 32 },
          { part: 'transcript', x: 324, y: 24, width: 52, height: 42 },
          { part: 'resume', x: 118, y: 242, width: 44, height: 36 },
          { part: 'projects', x: 179, y: 94, width: 112, height: 120 },
          { part: 'experience', x: 443, y: 160, width: 30, height: 60 },
        ] as const).map(spot => <rect
          key={spot.part}
          x={spot.x} y={spot.y} width={spot.width} height={spot.height} rx="5"
          className="circuit-scene__fallback-target"
          data-active={activePart === spot.part}
          onClick={() => onSelect?.(spot.part)}
          onPointerEnter={() => onHighlight(spot.part)}
          onPointerLeave={() => onHighlight(null)}
        />)}
      </g>
    </svg>
  )
}

export default function CircuitScene({ className = '', onSelect }: { className?: string; onSelect?: (part: BoardPart) => void }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const hotspotRefs = useRef<Partial<Record<BoardPart, HTMLButtonElement>>>({})
  const lineRefs = useRef<Partial<Record<BoardPart, SVGPathElement>>>({})
  const selectRef = useRef(onSelect)
  selectRef.current = onSelect
  const highlightRef = useRef<(part: BoardPart | null) => void>(() => {})
  const [activePart, setActivePart] = useState<BoardPart | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const host = hostRef.current
    if (!host || isReady) return
    const positionFallback = () => {
      const width = host.clientWidth, height = host.clientHeight
      const scale = Math.min(width / 640, height / 490)
      const offsetX = (width - 640 * scale) / 2, offsetY = (height - 490 * scale) / 2
      BOARD_SPOTS.forEach(spot => {
        const button = hotspotRefs.current[spot.part]
        const line = lineRefs.current[spot.part]
        const x = offsetX + spot.fallback[0] * 640 * scale, y = offsetY + spot.fallback[1] * 490 * scale
        const labelX = spot.labelPosition[0] * width, labelY = spot.labelPosition[1] * height
        if (button) {
          button.style.left = `${x}px`
          button.style.top = `${y}px`
          button.style.setProperty('--label-x', `${labelX - x}px`)
          button.style.setProperty('--label-y', `${labelY - y}px`)
        }
        line?.setAttribute('d', `M${x},${y} L${labelX},${labelY}`)
      })
    }
    const observer = new ResizeObserver(positionFallback)
    observer.observe(host)
    positionFallback()
    return () => observer.disconnect()
  }, [isReady])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' })
    } catch {
      return
    }

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 60)
    camera.position.set(7.7, 10.2, 10.6)
    camera.lookAt(0, 0, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.45
    renderer.setClearColor(0x000000, 0)
    renderer.domElement.className = 'circuit-scene__canvas'
    renderer.domElement.setAttribute('aria-hidden', 'true')
    host.appendChild(renderer.domElement)

    const hemi = new THREE.HemisphereLight('#fff7df', '#766b50', 2.2)
    scene.add(hemi)
    const key = new THREE.DirectionalLight('#fff4d8', 4.2)
    key.position.set(-4, 10, 6)
    key.castShadow = true
    key.shadow.mapSize.set(1024, 1024)
    key.shadow.camera.left = -6
    key.shadow.camera.right = 6
    key.shadow.camera.top = 6
    key.shadow.camera.bottom = -6
    key.shadow.normalBias = 0.03
    key.shadow.bias = -0.0002
    key.shadow.radius = 4
    scene.add(key)
    const fill = new THREE.DirectionalLight('#fcf5e7', 1.2)
    fill.position.set(5, 4, -5)
    scene.add(fill)

    const board = new THREE.Group()
    board.position.y = 0.3
    board.rotation.y = -0.3
    scene.add(board)

    const materials = {
      pcb: new THREE.MeshStandardMaterial({ color: '#4c5b39', roughness: 0.76, metalness: 0.08 }),
      gold: new THREE.MeshStandardMaterial({ color: GOLD, roughness: 0.42, metalness: 0.72 }),
      trace: new THREE.MeshStandardMaterial({ color: '#b4a66c', roughness: 0.65, metalness: 0.4 }),
      black: new THREE.MeshStandardMaterial({ color: '#252d25', roughness: 0.75 }),
      dark: new THREE.MeshStandardMaterial({ color: '#141d17', roughness: 0.9 }),
      cream: new THREE.MeshStandardMaterial({ color: CREAM, roughness: 0.7 }),
      metal: new THREE.MeshStandardMaterial({ color: '#bcc0b0', roughness: 0.3, metalness: 0.8 }),
      copper: new THREE.MeshStandardMaterial({ color: '#b67f49', roughness: 0.4, metalness: 0.7 }),
    }

    function box(w: number, h: number, d: number, x: number, y: number, z: number, material: THREE.Material, parent: THREE.Object3D = board) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material)
      mesh.position.set(x, y, z)
      mesh.castShadow = true
      mesh.receiveShadow = true
      parent.add(mesh)
      return mesh
    }

    function cylinder(radius: number, height: number, x: number, y: number, z: number, material: THREE.Material, segments = 20) {
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, segments), material)
      mesh.position.set(x, y, z)
      mesh.castShadow = true
      mesh.receiveShadow = true
      board.add(mesh)
      return mesh
    }

    // A rounded, milled PCB silhouette with real mounting holes.
    const shape = new THREE.Shape()
    const w = 6.1, d = 4.2, r = 0.2
    shape.moveTo(-w / 2 + r, -d / 2)
    shape.lineTo(w / 2 - r, -d / 2)
    shape.quadraticCurveTo(w / 2, -d / 2, w / 2, -d / 2 + r)
    shape.lineTo(w / 2, d / 2 - r)
    shape.quadraticCurveTo(w / 2, d / 2, w / 2 - r, d / 2)
    shape.lineTo(-w / 2 + r, d / 2)
    shape.quadraticCurveTo(-w / 2, d / 2, -w / 2, d / 2 - r)
    shape.lineTo(-w / 2, -d / 2 + r)
    shape.quadraticCurveTo(-w / 2, -d / 2, -w / 2 + r, -d / 2)
    for (const x of [-2.76, 2.76]) {
      for (const z of [-1.8, 1.8]) {
        const hole = new THREE.Path()
        hole.absarc(x, z, 0.087, 0, Math.PI * 2, true)
        shape.holes.push(hole)
      }
    }
    const pcbGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.13, bevelEnabled: true, bevelSize: 0.014, bevelThickness: 0.014, bevelSegments: 2, steps: 1, curveSegments: 12 })
    pcbGeo.rotateX(-Math.PI / 2)
    const pcb = new THREE.Mesh(pcbGeo, materials.pcb)
    pcb.castShadow = true
    pcb.receiveShadow = true
    board.add(pcb)

    for (const x of [-2.76, 2.76]) {
      for (const z of [-1.8, 1.8]) {
        const rim = new THREE.Mesh(new THREE.RingGeometry(0.09, 0.15, 24), materials.gold)
        rim.rotation.x = -Math.PI / 2
        rim.position.set(x, 0.148, z)
        board.add(rim)
        cylinder(0.12, 0.25, x, -0.14, z, materials.copper)
      }
    }

    // Flat metallic traces are deliberately geometric, like a routed board.
    function trace(points: [number, number][], width = 0.026) {
      for (let i = 1; i < points.length; i++) {
        const [x1, z1] = points[i - 1], [x2, z2] = points[i]
        const length = Math.hypot(x2 - x1, z2 - z1)
        const mesh = box(width, 0.008, length, (x1 + x2) / 2, 0.151, (z1 + z2) / 2, materials.trace)
        mesh.rotation.y = Math.atan2(x2 - x1, z2 - z1)
        mesh.castShadow = false
      }
    }

    const paths: [number, number][][] = [
      [[-2.5, -1.45], [-1.65, -1.45], [-1.15, -0.95], [-1.15, -0.4], [-0.7, -0.4]],
      [[-2.5, -1.18], [-1.8, -1.18], [-1.4, -0.78], [-1.4, -0.12], [-0.7, -0.12]],
      [[-2.5, -0.91], [-2.05, -0.91], [-1.65, -0.51], [-1.65, 0.15], [-0.7, 0.15]],
      [[-2.45, 0.3], [-1.8, 0.3], [-1.4, 0.7], [-0.95, 0.7], [-0.7, 0.45]],
      [[-2.45, 0.6], [-1.95, 0.6], [-1.4, 1.15], [-0.8, 1.15], [-0.42, 0.77]],
      [[-2.4, 1.62], [-1.5, 1.62], [-1.2, 1.32], [-0.15, 1.32], [-0.15, 0.77]],
      [[0.2, 0.77], [0.2, 1.63], [1.2, 1.63], [1.65, 1.18], [2.35, 1.18]],
      [[0.5, 0.77], [0.5, 1.35], [1.1, 1.35], [1.55, 0.9], [2.35, 0.9]],
      [[0.75, 0.45], [1.25, 0.45], [1.55, 0.75], [2.35, 0.75]],
      [[0.75, 0.18], [1.5, 0.18], [1.85, 0.53], [2.35, 0.53]],
      [[0.75, -0.1], [1.6, -0.1], [1.95, 0.25], [2.35, 0.25]],
      [[0.75, -0.4], [1.3, -0.4], [1.6, -0.7], [2.35, -0.7]],
      [[0.5, -0.76], [0.5, -1.37], [1.5, -1.37], [1.85, -1.02], [2.35, -1.02]],
      [[0.2, -0.76], [0.2, -1.65], [1.65, -1.65], [2, -1.3], [2.35, -1.3]],
      [[-0.18, -0.76], [-0.18, -1.8], [-1.7, -1.8]],
      [[-0.45, -0.76], [-0.45, -1.52], [-1.2, -1.52]],
    ]
    paths.forEach(path => {
      trace(path)
      const [x, z] = path[0]
      cylinder(0.05, 0.01, x, 0.158, z, materials.gold, 12)
    })

    // Central controller and fine gull-wing leads on all four sides.
    box(1.45, 0.2, 1.4, 0, 0.27, 0, materials.black)
    box(1.33, 0.012, 1.28, 0, 0.378, 0, materials.dark)
    for (let i = 0; i < 8; i++) {
      const v = -0.55 + i * 0.158
      for (const sign of [-1, 1]) {
        box(0.24, 0.035, 0.07, sign * 0.78, 0.19, v, materials.metal)
        box(0.07, 0.035, 0.24, v, 0.19, sign * 0.755, materials.metal)
      }
    }
    cylinder(0.033, 0.01, -0.5, 0.392, -0.47, materials.cream, 12)

    // Ceramic components with silver end caps.
    function ceramic(x: number, z: number, horizontal = false, scale = 1) {
      const g = new THREE.Group()
      const bw = 0.24 * scale, bd = 0.47 * scale
      box(bw, 0.15 * scale, bd, 0, 0.23, 0, materials.cream, g)
      box(bw + 0.015, 0.16 * scale, 0.08 * scale, 0, 0.23, -bd / 2 + 0.035, materials.metal, g)
      box(bw + 0.015, 0.16 * scale, 0.08 * scale, 0, 0.23, bd / 2 - 0.035, materials.metal, g)
      g.position.set(x, 0, z)
      g.rotation.y = horizontal ? Math.PI / 2 : 0
      board.add(g)
    }
    ceramic(-1.94, -0.2, false, 1.25)
    ceramic(-2.38, -0.2, false, 1.25)
    ceramic(1.58, -0.95, true)
    ceramic(1.58, -0.6, true)
    ceramic(-1.2, 1.62, true, 0.7)
    ceramic(-0.64, 1.62, true, 0.7)
    ceramic(1.18, 0.85, false, 0.65)
    ceramic(1.53, 0.85, false, 0.65)

    // Low-profile secondary chips.
    for (const [x, z] of [[-1.9, 1.15], [1.16, -1.7]]) {
      box(0.46, 0.12, 0.36, x, 0.23, z, materials.black)
      for (let i = 0; i < 3; i++) {
        box(0.06, 0.025, 0.55, x - 0.14 + i * 0.14, 0.16, z, materials.metal)
      }
    }

    // A double-row gold pin header gives the right edge a physical silhouette.
    box(0.47, 0.18, 2.9, 2.45, 0.25, 0, materials.black)
    for (let row = 0; row < 2; row++) {
      for (let i = 0; i < 12; i++) {
        box(0.055, 0.58, 0.055, 2.33 + row * 0.23, 0.49, -1.28 + i * 0.233, materials.gold)
      }
    }

    // USB connector: brushed shell, dark socket and gold internal tongue.
    box(0.78, 0.48, 0.83, -2.8, 0.38, 0.95, materials.metal)
    box(0.02, 0.32, 0.64, -3.2, 0.38, 0.95, materials.dark)
    box(0.026, 0.055, 0.4, -3.215, 0.38, 0.95, materials.gold)
    box(0.19, 0.14, 0.28, -2.4, 0.22, 1.0, materials.black)

    // Warm amber status light. It is steady, not a decorative flashing effect.
    const ledMat = new THREE.MeshStandardMaterial({ color: '#edc568', emissive: '#e7ab40', emissiveIntensity: 0.65, roughness: 0.4 })
    cylinder(0.09, 0.055, -2.45, 0.19, -1.5, ledMat)

    const textures: THREE.Texture[] = []
    function label(text: string, width: number, depth: number, x: number, z: number, y = 0.158, color = '#d7dcc4', font = '500 42px monospace') {
      const canvas = document.createElement('canvas')
      canvas.width = 768
      canvas.height = 128
      const context = canvas.getContext('2d')
      if (!context) return
      context.font = font
      context.fillStyle = color
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.fillText(text, 384, 65)
      const texture = new THREE.CanvasTexture(canvas)
      texture.colorSpace = THREE.SRGBColorSpace
      texture.anisotropy = 4
      textures.push(texture)
      const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false })
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), material)
      mesh.rotation.x = -Math.PI / 2
      mesh.position.set(x, y, z)
      board.add(mesh)
    }
    label('CORE — 01', 1.06, 0.18, 0, -0.12, 0.39, '#c9d0bd', '500 46px monospace')
    label('BUILT WITH CURIOSITY', 1.02, 0.14, 0, 0.16, 0.391, '#84917c', '400 32px monospace')
    label('JARED ASHMAN', 1.85, 0.3, -1.7, -1.84)
    label('IDEAS → HARDWARE', 2.0, 0.28, -1.24, 1.91)
    label('01', 0.35, 0.15, 2.42, 1.67)
    label('REV. A', 0.7, 0.16, 1.4, 1.92)

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ color: '#3d3a25', opacity: 0.17 }))
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -0.14
    ground.receiveShadow = true
    scene.add(ground)

    const glowRings = new Map<BoardPart, THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>>()
    const hitBoxes: THREE.Mesh[] = []
    BOARD_SPOTS.forEach(spot => {
      const ringMaterial = new THREE.MeshBasicMaterial({ color: '#e6cc81', transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })
      const ring = new THREE.Mesh(new THREE.RingGeometry(spot.radius, spot.radius + 0.035, 48), ringMaterial)
      ring.rotation.x = -Math.PI / 2
      ring.position.set(spot.point[0], spot.point[1] + 0.015, spot.point[2])
      board.add(ring)
      glowRings.set(spot.part, ring)

      const hit = new THREE.Mesh(new THREE.BoxGeometry(...spot.hitSize), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }))
      hit.position.set(spot.point[0], spot.point[1] - spot.hitSize[1] / 3, spot.point[2])
      hit.userData.part = spot.part
      board.add(hit)
      hitBoxes.push(hit)
    })

    let alive = true
    let contextAvailable = true
    let frame = 0
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const target = { x: 0, y: -0.3 }
    const projected = new THREE.Vector3()
    const updateHotspots = () => {
      board.updateMatrixWorld()
      const width = host.clientWidth, height = host.clientHeight
      BOARD_SPOTS.forEach(spot => {
        projected.set(...spot.point).applyMatrix4(board.matrixWorld).project(camera)
        const x = (projected.x + 1) * width / 2
        const y = (1 - projected.y) * height / 2
        const labelX = width * spot.labelPosition[0]
        const labelY = height * spot.labelPosition[1]
        const button = hotspotRefs.current[spot.part]
        if (button) {
          button.style.left = `${x}px`
          button.style.top = `${y}px`
          button.style.setProperty('--label-x', `${labelX - x}px`)
          button.style.setProperty('--label-y', `${labelY - y}px`)
        }
        // The outer labels stay legible as their leaders follow the PCB.
        lineRefs.current[spot.part]?.setAttribute('d', `M${x},${y} L${labelX},${labelY}`)
      })
    }
    const render = () => {
      if (!alive || !contextAvailable) { frame = 0; return }
      board.rotation.x += (target.x - board.rotation.x) * 0.09
      board.rotation.y += (target.y - board.rotation.y) * 0.09
      renderer.render(scene, camera)
      updateHotspots()
      if (Math.abs(target.x - board.rotation.x) + Math.abs(target.y - board.rotation.y) > 0.0001) {
        frame = requestAnimationFrame(render)
      } else {
        frame = 0
      }
    }
    const requestRender = () => { if (!frame && alive) frame = requestAnimationFrame(render) }
    highlightRef.current = part => {
      glowRings.forEach((ring, ringPart) => { ring.material.opacity = part === ringPart ? 0.9 : 0 })
      requestRender()
    }
    const highlight = (part: BoardPart | null) => {
      setActivePart(part)
      highlightRef.current(part)
      renderer.domElement.style.cursor = part ? 'pointer' : ''
    }
    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    const getPart = (event: PointerEvent | MouseEvent): BoardPart | null => {
      if (!contextAvailable) return null
      const rect = host.getBoundingClientRect()
      pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1)
      raycaster.setFromCamera(pointer, camera)
      return raycaster.intersectObjects(hitBoxes, false)[0]?.object.userData.part ?? null
    }
    const resize = () => {
      if (!alive || host.clientWidth === 0 || host.clientHeight === 0) return
      const aspect = host.clientWidth / host.clientHeight
      camera.aspect = aspect
      // Fit both narrow phone canvases and a wide desktop hero comfortably.
      camera.fov = aspect < 0.95 ? 40 : 33
      camera.updateProjectionMatrix()
      renderer.setSize(host.clientWidth, host.clientHeight)
      requestRender()
    }
    const pointerMove = (event: PointerEvent) => {
      if ((event.target as Element).closest('[data-board-part], .circuit-scene__fallback')) return
      highlight(getPart(event))
      if (motionQuery.matches || event.pointerType !== 'mouse') return
      const rect = host.getBoundingClientRect()
      target.x = ((event.clientY - rect.top) / rect.height - 0.5) * 0.12
      target.y = -0.3 + ((event.clientX - rect.left) / rect.width - 0.5) * 0.25
      requestRender()
    }
    const clickComponent = (event: MouseEvent) => {
      const part = getPart(event)
      if (part) { highlight(part); selectRef.current?.(part) }
    }
    const reset = () => { target.x = 0; target.y = -0.3; highlight(null); requestRender() }
    const contextLost = (event: Event) => { event.preventDefault(); contextAvailable = false; setIsReady(false) }
    const contextRestored = () => { contextAvailable = true; setIsReady(true); requestRender() }
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(host)
    host.addEventListener('pointermove', pointerMove)
    host.addEventListener('pointerleave', reset)
    renderer.domElement.addEventListener('click', clickComponent)
    renderer.domElement.addEventListener('webglcontextlost', contextLost)
    renderer.domElement.addEventListener('webglcontextrestored', contextRestored)
    motionQuery.addEventListener('change', reset)
    resize()
    setIsReady(true)

    return () => {
      alive = false
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      host.removeEventListener('pointermove', pointerMove)
      host.removeEventListener('pointerleave', reset)
      renderer.domElement.removeEventListener('click', clickComponent)
      renderer.domElement.removeEventListener('webglcontextlost', contextLost)
      renderer.domElement.removeEventListener('webglcontextrestored', contextRestored)
      motionQuery.removeEventListener('change', reset)
      scene.traverse(object => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose()
          const meshMaterials = Array.isArray(object.material) ? object.material : [object.material]
          meshMaterials.forEach(material => material.dispose())
        }
      })
      textures.forEach(texture => texture.dispose())
      highlightRef.current = () => {}
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  const highlight = (part: BoardPart | null) => {
    setActivePart(part)
    highlightRef.current(part)
  }

  return (
    <div ref={hostRef} className={`circuit-scene ${isReady ? 'is-rendered' : ''} ${className}`}>
      <BoardFallback onSelect={onSelect} onHighlight={highlight} activePart={activePart} />
      <svg className="circuit-scene__leaders" aria-hidden="true">
        {BOARD_SPOTS.map(spot => <path key={spot.part} ref={node => { if (node) lineRefs.current[spot.part] = node }} data-active={activePart === spot.part} />)}
      </svg>
      {BOARD_SPOTS.map((spot, index) => (
        <button
          key={spot.part}
          ref={node => { if (node) hotspotRefs.current[spot.part] = node }}
          type="button"
          className="circuit-scene__hotspot"
          data-board-part={spot.part}
          data-active={activePart === spot.part}
          aria-label={`Explore ${spot.part === 'resume' ? 'résumé' : spot.part}`}
          onPointerEnter={() => highlight(spot.part)}
          onPointerLeave={() => highlight(null)}
          onFocus={() => highlight(spot.part)}
          onBlur={() => highlight(null)}
          onClick={() => { highlight(spot.part); onSelect?.(spot.part) }}
        >
          <span className="circuit-scene__marker" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
          <span className="circuit-scene__label" aria-hidden="true">{spot.label}<svg viewBox="0 0 16 16" fill="none"><path d="M4 12 12 4M4 4h8v8" stroke="currentColor" strokeWidth="1" /></svg></span>
        </button>
      ))}
    </div>
  )
}
