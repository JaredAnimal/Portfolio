import { useEffect, useId, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { STLLoader } from 'three/addons/loaders/STLLoader.js'
import modelUrl from '../assets/models/net-extender-prototype.stl?url'
import posterUrl from '../assets/models/net-extender-prototype.png'
import './NetExtenderPrototype.css'

type ViewerState = 'loading' | 'ready' | 'fallback'

export default function NetExtenderPrototype() {
  const figureRef = useRef<HTMLElement>(null)
  const hostRef = useRef<HTMLDivElement>(null)
  const resetRef = useRef<() => void>(() => {})
  const motionRef = useRef<() => void>(() => {})
  const [state, setState] = useState<ViewerState>('loading')
  const [rotationRequested, setRotationRequested] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const rotationRef = useRef(rotationRequested)
  const descriptionId = useId()

  useEffect(() => {
    rotationRef.current = rotationRequested
    motionRef.current()
  }, [rotationRequested])

  useEffect(() => {
    const host = hostRef.current
    const figure = figureRef.current
    if (!host || !figure) return
    const abort = new AbortController()
    let disposed = false
    let ready = false
    let failed = false
    let inView = false
    let interacting = false
    let frame = 0
    let previousTime = 0
    let radius = 3
    let geometry: THREE.BufferGeometry | undefined
    let edgeGeometry: THREE.EdgesGeometry | undefined
    let renderer: THREE.WebGLRenderer

    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })
    } catch {
      setState('fallback')
      return
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.1
    const canvas = renderer.domElement
    canvas.className = 'net-prototype__canvas'
    canvas.setAttribute('aria-hidden', 'true')
    host.appendChild(canvas)

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-4, 4, 3, -3, .1, 100)
    const initialPosition = new THREE.Vector3(7, 4.5, 9)
    camera.position.copy(initialPosition)
    const controls = new OrbitControls(camera, canvas)
    controls.enablePan = false
    controls.enableDamping = false
    controls.autoRotateSpeed = 1 // One full turn per minute, independent of frame rate.
    controls.minZoom = .65
    controls.maxZoom = 3
    controls.minPolarAngle = .15
    controls.maxPolarAngle = Math.PI * .88
    controls.target.set(0, 0, 0)
    controls.update()
    controls.saveState()

    const material = new THREE.MeshStandardMaterial({ color: '#84916d', roughness: .6, metalness: .12, side: THREE.DoubleSide })
    const edgeMaterial = new THREE.LineBasicMaterial({ color: '#39472e', transparent: true, opacity: .25 })
    scene.add(new THREE.HemisphereLight('#fff9e9', '#697454', 2.8))
    const key = new THREE.DirectionalLight('#fff7e5', 3)
    key.position.set(5, 8, 7)
    scene.add(key)
    const fill = new THREE.DirectionalLight('#e5eada', 1.8)
    fill.position.set(-5, 3, -4)
    scene.add(fill)

    const render = () => {
      if (disposed || failed) return
      figure.dataset.angle = controls.getAzimuthalAngle().toFixed(6)
      renderer.render(scene, camera)
    }
    const canRotate = () => ready && !failed && !disposed && rotationRef.current && inView && !document.hidden && !interacting
    const stop = () => {
      if (frame) cancelAnimationFrame(frame)
      frame = 0
      previousTime = 0
      controls.autoRotate = false
      figure.dataset.rotating = 'false'
    }
    const tick = (time: number) => {
      frame = 0
      if (!canRotate()) { stop(); return }
      const delta = previousTime ? Math.min((time - previousTime) / 1000, .05) : 0
      previousTime = time
      controls.update(delta)
      frame = requestAnimationFrame(tick)
    }
    const syncMotion = () => {
      if (!canRotate()) { stop(); return }
      controls.autoRotate = true
      figure.dataset.rotating = 'true'
      if (!frame) frame = requestAnimationFrame(tick)
    }
    motionRef.current = syncMotion
    const resize = () => {
      const width = host.clientWidth, height = host.clientHeight
      if (!width || !height || disposed) return
      const aspect = width / height
      const halfHeight = radius * 1.12 / Math.min(1, aspect)
      camera.left = -halfHeight * aspect
      camera.right = halfHeight * aspect
      camera.top = halfHeight
      camera.bottom = -halfHeight
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
      render()
    }
    const reset = () => {
      const wasRotating = controls.autoRotate
      controls.autoRotate = false
      controls.reset()
      controls.autoRotate = wasRotating
      render()
    }
    resetRef.current = reset
    const keyboard = (event: KeyboardEvent) => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home'].includes(event.key)) return
      event.preventDefault()
      if (event.key === 'Home') { reset(); return }
      const offset = camera.position.clone().sub(controls.target)
      const spherical = new THREE.Spherical().setFromVector3(offset)
      if (event.key === 'ArrowLeft') spherical.theta -= .15
      if (event.key === 'ArrowRight') spherical.theta += .15
      if (event.key === 'ArrowUp') spherical.phi -= .12
      if (event.key === 'ArrowDown') spherical.phi += .12
      spherical.phi = THREE.MathUtils.clamp(spherical.phi, controls.minPolarAngle, controls.maxPolarAngle)
      camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical))
      const wasRotating = controls.autoRotate
      controls.autoRotate = false
      controls.update()
      controls.autoRotate = wasRotating
      render()
    }
    const startInteraction = () => { interacting = true; syncMotion() }
    const endInteraction = () => { interacting = false; syncMotion() }
    const fallback = () => {
      if (disposed) return
      failed = true
      stop()
      setState('fallback')
    }
    const contextLost = (event: Event) => { event.preventDefault(); fallback() }
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const motionPreferenceChanged = () => {
      if (reducedMotion.matches) {
        rotationRef.current = false
        setRotationRequested(false)
        syncMotion()
      }
    }
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(host)
    const visibilityObserver = new IntersectionObserver(entries => {
      inView = entries[0]?.isIntersecting ?? false
      syncMotion()
    }, { threshold: .05 })
    visibilityObserver.observe(host)
    controls.addEventListener('change', render)
    controls.addEventListener('start', startInteraction)
    controls.addEventListener('end', endInteraction)
    host.addEventListener('keydown', keyboard)
    canvas.addEventListener('webglcontextlost', contextLost)
    document.addEventListener('visibilitychange', syncMotion)
    reducedMotion.addEventListener('change', motionPreferenceChanged)
    resize()

    void fetch(modelUrl, { signal: abort.signal }).then(response => {
      if (!response.ok) throw new Error('Prototype file unavailable')
      return response.arrayBuffer()
    }).then(bytes => {
      if (disposed || failed) return
      geometry = new STLLoader().parse(bytes)
      geometry.rotateX(-Math.PI / 2) // CAD Z-up to the viewer's Y-up.
      geometry.computeBoundingBox()
      const size = geometry.boundingBox!.getSize(new THREE.Vector3())
      const scale = 4 / Math.max(size.x, size.y, size.z)
      if (!Number.isFinite(scale) || scale <= 0) throw new Error('Empty prototype geometry')
      geometry.center()
      geometry.scale(scale, scale, scale)
      geometry.computeVertexNormals()
      geometry.computeBoundingSphere()
      radius = geometry.boundingSphere!.radius
      scene.add(new THREE.Mesh(geometry, material))
      edgeGeometry = new THREE.EdgesGeometry(geometry, 35)
      scene.add(new THREE.LineSegments(edgeGeometry, edgeMaterial))
      ready = true
      resize()
      setState('ready')
      syncMotion()
    }).catch(error => {
      if (error?.name !== 'AbortError') fallback()
    })

    return () => {
      disposed = true
      abort.abort()
      stop()
      motionRef.current = () => {}
      resetRef.current = () => {}
      resizeObserver.disconnect()
      visibilityObserver.disconnect()
      controls.removeEventListener('change', render)
      controls.removeEventListener('start', startInteraction)
      controls.removeEventListener('end', endInteraction)
      controls.dispose()
      host.removeEventListener('keydown', keyboard)
      canvas.removeEventListener('webglcontextlost', contextLost)
      document.removeEventListener('visibilitychange', syncMotion)
      reducedMotion.removeEventListener('change', motionPreferenceChanged)
      geometry?.dispose()
      edgeGeometry?.dispose()
      material.dispose()
      edgeMaterial.dispose()
      renderer.dispose()
      canvas.remove()
    }
  }, [])

  return <figure ref={figureRef} className="net-prototype" data-prototype-scene="" data-state={state} data-rotating="false" data-angle="0">
    <div ref={hostRef} className="net-prototype__viewport" tabIndex={state === 'ready' ? 0 : undefined} role="group" aria-label="Net extender prototype 3D viewer" aria-describedby={descriptionId}>
      <img className="net-prototype__poster" src={posterUrl} alt="Static rendering of the supplied pickleball net extender prototype, showing three hollow adapter pieces." />
      {state === 'loading' && <span className="net-prototype__status" role="status">Loading prototype…</span>}
    </div>
    <figcaption>
      <div><strong>Net extender prototype</strong><p id={descriptionId}>{state === 'ready' ? 'Drag or use arrow keys to rotate. Scroll or pinch to zoom.' : state === 'fallback' ? 'Static preview. The 3D viewer is unavailable on this device.' : 'Loading the supplied prototype model.'}</p></div>
      {state === 'ready' && <div className="net-prototype__controls" role="group" aria-label="Prototype view controls">
        <button type="button" onClick={() => setRotationRequested(value => !value)}>{rotationRequested ? 'Pause rotation' : 'Resume rotation'}</button>
        <button type="button" onClick={() => resetRef.current()}>Reset view</button>
      </div>}
      <a className="net-prototype__download" href={modelUrl} download="net-extender-prototype.stl">Download prototype (STL)</a>
    </figcaption>
  </figure>
}
