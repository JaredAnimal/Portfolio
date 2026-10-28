import { useEffect, useId, useRef, useState } from 'react'
import * as THREE from 'three'
import './PickleballNetScene.css'

function NetFallback() {
  const patternId = useId()
  return <svg className="pickleball-net__fallback" viewBox="0 0 720 420" aria-hidden="true">
    <defs><pattern id={patternId} width="10" height="10" patternUnits="userSpaceOnUse"><path d="M10 0H0V10" fill="none" stroke="#66705a" strokeWidth=".8" /></pattern></defs>
    <path d="M65 320 201 228H666L531 320Z" fill="#dce0ce" />
    <g stroke="#4d583a" strokeWidth="8" strokeLinecap="round"><path d="M112 270V115m466 175V135M112 270l466 20M82 289l62-39m400 59 65-40" /></g>
    <path d="m122 121 446 20v120l-446-20Z" fill={`url(#${patternId})`} stroke="#657052" strokeWidth="2" />
    <path d="m122 121 446 20" stroke="#f6f1df" strokeWidth="12" />
    <path d="m122 241 446 20" stroke="#d9d8c3" strokeWidth="5" />
    <path d="m554 289 49 2m-9 9 36-23" stroke="#b28d50" strokeWidth="10" strokeLinecap="round" />
  </svg>
}

/** A conceptual portable net, not a dimensioned model of the proposed part. */
export default function PickleballNetScene() {
  const hostRef = useRef<HTMLDivElement>(null)
  const rotateRef = useRef<(direction: number) => void>(() => {})
  const resetRef = useRef<() => void>(() => {})
  const [ready, setReady] = useState(false)
  const descriptionId = useId()

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })
    } catch {
      return
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
    const extensionMaterial = meshMaterial('#b08c50', .65)
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
    // The lower rail joins the two portable supports. Gold marks the conceptual add-on.
    tube(vector(-3.1, .13), vector(3.1, .13), .045, frameMaterial)
    for (const side of [-1, 1]) {
      const x = side * 3.1
      tube(vector(x, .13), vector(x, 1.58), .045, frameMaterial)
      tube(vector(x, .09, -.55), vector(x, .09, .55), .045, frameMaterial)
      for (const z of [-.55, .55]) box(.16, .07, .17, [x, .065, z], footMaterial)
      box(.09, 1.25, .025, [side * 3, .865, 0], tapeMaterial)
    }
    tube(vector(2.86, .13), vector(3.4, .13), .065, extensionMaterial)
    box(.22, .15, .18, [3.32, .13, 0], extensionMaterial)
    tube(vector(3.4, .09, -.66), vector(3.4, .09, .66), .04, extensionMaterial)
    for (const z of [-.66, .66]) box(.13, .065, .15, [3.4, .06, z], footMaterial)
    tube(vector(0, .13), vector(0, 1.38), .025, frameMaterial)

    const netTop = (x: number) => 1.49 - .12 * (1 - (x / 3) ** 2)
    const netBottom = .27
    const netPositions: number[] = []
    const tapePositions: number[] = []
    const columns = 64
    const rows = 12
    for (let column = 0; column <= columns; column++) {
      const x = -3 + column * 6 / columns
      netPositions.push(x, netBottom, 0, x, netTop(x), 0)
      if (column < columns) {
        const next = x + 6 / columns
        const y = netTop(x), nextY = netTop(next)
        tapePositions.push(x, y, .012, next, nextY, .012, x, y - .075, .012,
          next, nextY, .012, next, nextY - .075, .012, x, y - .075, .012)
      }
    }
    for (let row = 0; row <= rows; row++) {
      for (let column = 0; column < columns; column++) {
        const x = -3 + column * 6 / columns, next = x + 6 / columns
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
    box(6.05, .045, .025, [0, netBottom, 0], tapeMaterial)

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
      render()
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
    const contextLost = (event: Event) => { event.preventDefault(); lost = true; setReady(false) }
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
    </div>
    <figcaption>
      <div><strong>Net base extension</strong><p id={descriptionId}>Concept visualization; the gold section highlights the proposed extension.{ready ? ' Drag or use arrow keys to rotate.' : ' Static view.'}</p></div>
      {ready && <div className="pickleball-net__controls" role="group" aria-label="Net view controls">
        <button type="button" aria-label="Rotate net left" onClick={() => rotateRef.current(-1)}>←</button>
        <button type="button" onClick={() => resetRef.current()}>Reset view</button>
        <button type="button" aria-label="Rotate net right" onClick={() => rotateRef.current(1)}>→</button>
      </div>}
    </figcaption>
  </figure>
}
