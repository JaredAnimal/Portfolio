import { useEffect, useId, useRef, useState } from 'react'
import * as THREE from 'three'
import './PickleballNetScene.css'

type Point3 = [number, number, number]
type Point2 = [number, number]
// USA Pickleball 2026, 3.B.2–3.B.7. Scene units are meters.
const NET_WIDTH = 6.6294 // Minimum fabric width: 21 ft 9 in.
const SIDELINE_X = 3.048
const SIDE_HEIGHT = .9144
const CENTER_HEIGHT = .8636
const POST_RADIUS = .035
const POST_X = 6.7056 / 2 + POST_RADIUS // 22 ft between the posts' inside faces.
const netTop = (x: number) => CENTER_HEIGHT + (SIDE_HEIGHT - CENTER_HEIGHT) * (x / SIDELINE_X) ** 2
const POST_TOP = netTop(NET_WIDTH / 2) + .055

const dimensions: { id: string; label: string; from: Point3; to: Point3; offset: Point3; labelAt: Point2; fallback: [Point2, Point2, Point2, Point2] }[] = [
  { id: 'width', label: 'NET WIDTH · ≥6.63 m', from: [-NET_WIDTH / 2, netTop(NET_WIDTH / 2), 0], to: [NET_WIDTH / 2, netTop(NET_WIDTH / 2), 0], offset: [0, .45, 0], labelAt: [.5, .12], fallback: [[122, 165], [568, 185], [122, 120], [568, 140]] },
  { id: 'height', label: 'SIDE · 0.9144 m', from: [-SIDELINE_X, 0, 0], to: [-SIDELINE_X, SIDE_HEIGHT, 0], offset: [-.65, 0, 0], labelAt: [.13, .79], fallback: [[140, 271], [140, 166], [70, 271], [70, 166]] },
  { id: 'center-height', label: 'CENTER · 0.8636 m', from: [0, 0, 0], to: [0, CENTER_HEIGHT, 0], offset: [.4, 0, .14], labelAt: [.5, .89], fallback: [[345, 280], [345, 184], [371, 280], [371, 184]] },
  { id: 'tension', label: 'TENSION · NOT SPECIFIED', from: [2.2, netTop(2.2), .014], to: [2.2, netTop(2.2), .014], offset: [0, 0, 0], labelAt: [.79, .27], fallback: [[493, 187], [493, 187], [493, 187], [493, 187]] },
]

function drawDimensions(svg: SVGSVGElement, width: number, height: number, project?: (point: Point3) => Point2) {
  if (!width || !height) return
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
  const fallbackScale = Math.min(width / 720, height / 420)
  const fallbackX = (width - 720 * fallbackScale) / 2
  const fallbackY = (height - 420 * fallbackScale) / 2
  for (const dimension of dimensions) {
    const group = svg.querySelector(`[data-net-dimension="${dimension.id}"]`)!
    const offset = (point: Point3): Point3 => point.map((value, index) => value + dimension.offset[index]) as Point3
    const [from, to, start, end] = project
      ? [dimension.from, dimension.to, offset(dimension.from), offset(dimension.to)].map(project)
      : dimension.fallback.map(([x, y]) => [fallbackX + x * fallbackScale, fallbackY + y * fallbackScale] as Point2)
    const coordinate = ([x, y]: Point2) => `${x.toFixed(2)},${y.toFixed(2)}`
    const label: Point2 = [dimension.labelAt[0] * width, dimension.labelAt[1] * height]
    const midpoint: Point2 = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2]
    const isTension = dimension.id === 'tension'
    group.querySelector('.pickleball-net__witness')!.setAttribute('d', isTension ? '' : `M${coordinate(from)}L${coordinate(start)}M${coordinate(to)}L${coordinate(end)}`)
    group.querySelector('.pickleball-net__measure')!.setAttribute('d', isTension ? '' : `M${coordinate(start)}L${coordinate(end)}`)
    // Exterior callouts keep labels readable as the model turns, including on phones.
    const labelEdge: Point2 = [label[0], label[1] + (label[1] < midpoint[1] ? 10 : -10)]
    group.querySelector('.pickleball-net__leader')!.setAttribute('d', isTension ? `M${coordinate(labelEdge)}L${coordinate(from)}` : `M${coordinate(midpoint)}L${coordinate(labelEdge)}`)
    const text = group.querySelector('text')!
    text.setAttribute('x', `${label[0]}`)
    text.setAttribute('y', `${label[1]}`)
  }
}

function NetFallback() {
  const patternId = useId()
  return <svg className="pickleball-net__fallback" viewBox="0 0 720 420" aria-hidden="true">
    <defs><pattern id={patternId} width="10" height="10" patternUnits="userSpaceOnUse"><path d="M10 0H0V10" fill="none" stroke="#66705a" strokeWidth=".8" /></pattern></defs>
    <path d="M65 320 201 228H666L531 320Z" fill="#dce0ce" />
    <g stroke="#4d583a" strokeWidth="8" strokeLinecap="round"><path d="M112 270V159m466 131V179M112 270l466 20M82 289l62-39" /></g>
    <path d="M122 165Q345 192 568 185V261L122 241Z" fill={`url(#${patternId})`} stroke="#657052" strokeWidth="2" />
    <path d="M122 165Q345 192 568 185" stroke="#f6f1df" strokeWidth="6" fill="none" />
    <path d="m122 241 446 20" stroke="#d9d8c3" strokeWidth="5" />
    <path d="m554 289 49 2m-9 9 36-23" stroke="#4d583a" strokeWidth="8" strokeLinecap="round" />
  </svg>
}

/** Regulation net dimensions with a conceptual base extension. */
export default function PickleballNetScene() {
  const hostRef = useRef<HTMLDivElement>(null)
  const dimensionsRef = useRef<SVGSVGElement>(null)
  const rotateRef = useRef<(direction: number) => void>(() => {})
  const resetRef = useRef<() => void>(() => {})
  const [ready, setReady] = useState(false)
  const descriptionId = useId()
  const arrowId = useId().replace(/:/g, '')

  useEffect(() => {
    const host = hostRef.current
    const dimensionSvg = dimensionsRef.current
    if (!host || !dimensionSvg) return
    const drawFallbackDimensions = () => drawDimensions(dimensionSvg, host.clientWidth, host.clientHeight)
    drawFallbackDimensions()
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })
    } catch {
      const observer = new ResizeObserver(drawFallbackDimensions)
      observer.observe(host)
      return () => observer.disconnect()
    }

    const scene = new THREE.Scene()
    const model = new THREE.Group()
    scene.add(model)
    const camera = new THREE.OrthographicCamera(-5, 5, 3, -3, .1, 80)
    const lookAt = new THREE.Vector3(0, .65, 0)
    const materials: THREE.Material[] = []
    const geometries: THREE.BufferGeometry[] = []
    const meshMaterial = (color: string, roughness = .85) => {
      const material = new THREE.MeshStandardMaterial({ color, roughness })
      materials.push(material)
      return material
    }
    const frameMaterial = meshMaterial('#4d583a', .65)
    const tapeMaterial = meshMaterial('#f4efdc')
    tapeMaterial.side = THREE.DoubleSide
    const footMaterial = meshMaterial('#303a2c')
    const groundMaterial = meshMaterial('#e3e5d6')
    const netMaterial = new THREE.LineBasicMaterial({ color: '#48563d', transparent: true, opacity: .7 })
    materials.push(netMaterial)

    function tube(from: THREE.Vector3, to: THREE.Vector3, radius: number, material: THREE.Material) {
      const vector = to.clone().sub(from)
      const geometry = new THREE.CylinderGeometry(radius, radius, vector.length(), 14)
      geometries.push(geometry)
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.copy(from).add(to).multiplyScalar(.5)
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vector.normalize())
      model.add(mesh)
      return mesh
    }
    function box(width: number, height: number, depth: number, position: [number, number, number], material: THREE.Material) {
      const geometry = new THREE.BoxGeometry(width, height, depth)
      geometries.push(geometry)
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.set(...position)
      model.add(mesh)
      return mesh
    }
    const vector = (x: number, y: number, z = 0) => new THREE.Vector3(x, y, z)
    // The lower rail joins the portable supports; both bases use the frame material.
    tube(vector(-POST_X, .06), vector(POST_X, .06), .03, frameMaterial)
    for (const side of [-1, 1]) {
      const x = side * POST_X
      tube(vector(x, .06), vector(x, POST_TOP), POST_RADIUS, frameMaterial)
      // The extension replaces the right support's crossbar and feet.
      if (side === -1) {
        tube(vector(x, .045, -.55), vector(x, .045, .55), .03, frameMaterial)
        for (const z of [-.55, .55]) box(.16, .06, .17, [x, .03, z], footMaterial)
      }
      box(.05, netTop(NET_WIDTH / 2) - .08, .025, [side * NET_WIDTH / 2, (netTop(NET_WIDTH / 2) + .08) / 2, 0], tapeMaterial)
    }
    const extensionX = POST_X + .3
    tube(vector(POST_X - .15, .06), vector(extensionX, .06), .045, frameMaterial)
    box(.22, .1, .14, [extensionX - .08, .065, 0], frameMaterial)
    tube(vector(extensionX, .045, -.66), vector(extensionX, .045, .66), .03, frameMaterial)
    for (const z of [-.66, .66]) box(.13, .06, .15, [extensionX, .03, z], footMaterial)
    tube(vector(0, .06), vector(0, CENTER_HEIGHT - .02), .015, frameMaterial)

    const netBottom = .08
    const netPositions: number[] = []
    const tapePositions: number[] = []
    const columns = 64
    const rows = 12
    for (let column = 0; column <= columns; column++) {
      const x = -NET_WIDTH / 2 + column * NET_WIDTH / columns
      netPositions.push(x, netBottom, 0, x, netTop(x), 0)
      if (column < columns) {
        const next = x + NET_WIDTH / columns
        const y = netTop(x), nextY = netTop(next)
        tapePositions.push(x, y, .012, next, nextY, .012, x, y - .0508, .012,
          next, nextY, .012, next, nextY - .0508, .012, x, y - .0508, .012)
      }
    }
    for (let row = 0; row <= rows; row++) {
      for (let column = 0; column < columns; column++) {
        const x = -NET_WIDTH / 2 + column * NET_WIDTH / columns, next = x + NET_WIDTH / columns
        const ratio = row / rows
        netPositions.push(x, netBottom + (netTop(x) - netBottom) * ratio, 0,
          next, netBottom + (netTop(next) - netBottom) * ratio, 0)
      }
    }
    const netGeometry = new THREE.BufferGeometry()
    netGeometry.setAttribute('position', new THREE.Float32BufferAttribute(netPositions, 3))
    const tapeGeometry = new THREE.BufferGeometry()
    tapeGeometry.setAttribute('position', new THREE.Float32BufferAttribute(tapePositions, 3))
    tapeGeometry.computeVertexNormals()
    geometries.push(netGeometry, tapeGeometry)
    model.add(new THREE.LineSegments(netGeometry, netMaterial), new THREE.Mesh(tapeGeometry, tapeMaterial))
    box(NET_WIDTH, .025, .025, [0, netBottom, 0], tapeMaterial)

    const floorGeometry = new THREE.PlaneGeometry(10, 5)
    geometries.push(floorGeometry)
    const floor = new THREE.Mesh(floorGeometry, groundMaterial)
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -.02
    model.add(floor)
    const courtMaterial = new THREE.LineBasicMaterial({ color: '#f9f6e9' })
    materials.push(courtMaterial)
    const courtGeometry = new THREE.BufferGeometry().setFromPoints([
      vector(-4.1, -.01, -1.8), vector(4.1, -.01, -1.8), vector(4.1, -.01, -1.8), vector(4.1, -.01, 1.8),
      vector(4.1, -.01, 1.8), vector(-4.1, -.01, 1.8), vector(-4.1, -.01, 1.8), vector(-4.1, -.01, -1.8),
      vector(-4.1, -.01, -.85), vector(4.1, -.01, -.85), vector(-4.1, -.01, .85), vector(4.1, -.01, .85),
    ])
    geometries.push(courtGeometry)
    model.add(new THREE.LineSegments(courtGeometry, courtMaterial))
    scene.add(new THREE.HemisphereLight('#fff7e6', '#657055', 2.8))
    const light = new THREE.DirectionalLight('#fff6dc', 3)
    light.position.set(-3, 6, 5)
    scene.add(light)

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15
    renderer.setClearColor(0x000000, 0)
    renderer.domElement.className = 'pickleball-net__canvas'
    renderer.domElement.setAttribute('aria-hidden', 'true')
    host.appendChild(renderer.domElement)

    let angle = .38
    let lost = false
    let dragging = false
    let pointerX = 0
    const render = () => {
      if (lost) return
      camera.position.set(Math.sin(angle) * 11, 3.8, Math.cos(angle) * 11)
      camera.lookAt(lookAt)
      renderer.render(scene, camera)
      drawDimensions(dimensionSvg, host.clientWidth, host.clientHeight, point => {
        const projected = new THREE.Vector3(...point).project(camera)
        return [(projected.x + 1) * host.clientWidth / 2, (1 - projected.y) * host.clientHeight / 2]
      })
    }
    const rotate = (amount: number) => {
      angle = THREE.MathUtils.clamp(angle + amount, -.72, .72)
      render()
    }
    rotateRef.current = direction => rotate(direction * .15)
    resetRef.current = () => { angle = .38; render() }
    const resize = () => {
      const width = host.clientWidth, height = host.clientHeight
      if (!width || !height) return
      const aspect = width / height
      const halfHeight = Math.max(2.55, 4.3 / aspect)
      camera.left = -halfHeight * aspect
      camera.right = halfHeight * aspect
      camera.top = halfHeight
      camera.bottom = -halfHeight
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
      if (lost) drawFallbackDimensions()
      else render()
    }
    const down = (event: PointerEvent) => {
      if (event.button !== 0) return
      dragging = true
      pointerX = event.clientX
      renderer.domElement.setPointerCapture(event.pointerId)
    }
    const move = (event: PointerEvent) => {
      if (!dragging) return
      rotate((event.clientX - pointerX) * .006)
      pointerX = event.clientX
    }
    const up = () => { dragging = false }
    const keyboard = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight' && event.key !== 'Home') return
      event.preventDefault()
      if (event.key === 'Home') resetRef.current()
      else rotateRef.current(event.key === 'ArrowLeft' ? -1 : 1)
    }
    const contextLost = (event: Event) => { event.preventDefault(); lost = true; drawFallbackDimensions(); setReady(false) }
    const contextRestored = () => { lost = false; resize(); setReady(true) }
    renderer.domElement.addEventListener('pointerdown', down)
    renderer.domElement.addEventListener('pointermove', move)
    renderer.domElement.addEventListener('pointerup', up)
    renderer.domElement.addEventListener('pointercancel', up)
    renderer.domElement.addEventListener('webglcontextlost', contextLost)
    renderer.domElement.addEventListener('webglcontextrestored', contextRestored)
    host.addEventListener('keydown', keyboard)
    const observer = new ResizeObserver(resize)
    observer.observe(host)
    resize()
    setReady(true)

    return () => {
      observer.disconnect()
      host.removeEventListener('keydown', keyboard)
      renderer.domElement.removeEventListener('pointerdown', down)
      renderer.domElement.removeEventListener('pointermove', move)
      renderer.domElement.removeEventListener('pointerup', up)
      renderer.domElement.removeEventListener('pointercancel', up)
      renderer.domElement.removeEventListener('webglcontextlost', contextLost)
      renderer.domElement.removeEventListener('webglcontextrestored', contextRestored)
      rotateRef.current = () => {}
      resetRef.current = () => {}
      geometries.forEach(geometry => geometry.dispose())
      materials.forEach(material => material.dispose())
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return <figure className={`pickleball-net${ready ? ' is-rendered' : ''}`} data-net-scene="">
    <div ref={hostRef} className="pickleball-net__viewport" tabIndex={ready ? 0 : undefined} role="group" aria-label="Pickleball net concept visualization" aria-describedby={descriptionId}>
      <NetFallback />
      <svg ref={dimensionsRef} className="pickleball-net__dimensions" role="img" aria-label="Regulation net: minimum width 6.63 meters, sideline height 0.9144 meters, center height 0.8636 meters. The rulebook does not specify a tension force in newtons.">
        <defs><marker id={arrowId} viewBox="0 0 6 6" markerWidth="6" markerHeight="6" refX="5.5" refY="3" orient="auto-start-reverse" markerUnits="userSpaceOnUse"><path d="M0 0 6 3 0 6Z" fill="currentColor" /></marker></defs>
        {dimensions.map(dimension => <g key={dimension.id} data-net-dimension={dimension.id}>
          <path className="pickleball-net__witness" />
          <path className="pickleball-net__measure" markerStart={dimension.id === 'tension' ? undefined : `url(#${arrowId})`} markerEnd={dimension.id === 'tension' ? undefined : `url(#${arrowId})`} />
          <path className="pickleball-net__leader" markerEnd={dimension.id === 'tension' ? `url(#${arrowId})` : undefined} />
          <text textAnchor="middle" dominantBaseline="middle">{dimension.label}</text>
        </g>)}
      </svg>
    </div>
    <figcaption>
      <div><strong>Net base extension</strong><p id={descriptionId}>Concept visualization with regulation net dimensions. Side and center heights allow ±0.00635 m. The rules do not specify a tension force in newtons.{ready ? ' Drag or use arrow keys to rotate.' : ' Static view.'}</p><a className="pickleball-net__source" href="https://usapickleball.org/docs/rules/USAP-Official-Rulebook.pdf#page=13" target="_blank" rel="noreferrer">USA Pickleball 2026 rules · 3.B</a></div>
      {ready && <div className="pickleball-net__controls" role="group" aria-label="Net view controls">
        <button type="button" aria-label="Rotate net left" onClick={() => rotateRef.current(-1)}>←</button>
        <button type="button" onClick={() => resetRef.current()}>Reset view</button>
        <button type="button" aria-label="Rotate net right" onClick={() => rotateRef.current(1)}>→</button>
      </div>}
    </figcaption>
  </figure>
}
