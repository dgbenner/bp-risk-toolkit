import { Suspense, useRef, useMemo, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Canvas, useFrame, useLoader, extend, useThree } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { Water } from 'three/examples/jsm/objects/Water.js'
import { Sky } from 'three/examples/jsm/objects/Sky.js'
import * as THREE from 'three'

extend({ Water, Sky })

const WIRE_COLOR = '#666666'
const WIRE_OPACITY = 0.5
const TARGET_SIZE = 25.5 // dropped 15% from 30
const RIG_POSITION = [-0.8, 4.2, 0] // raised so ~75% of rig sits above the water line
const VIEW_SHIFT = 0.22 // horizontal shift right-on-canvas
const V_SHIFT = 0.15 // vertical shift — positive = scene moves UP on canvas (raises horizon)
const ORBIT_TARGET = [-0.8, 9.0, 0] // tracks the rig's vertical offset

// Shared DRACO decoder — loaded from Google's CDN (small WASM, cached by browser)
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/')

function useRigModel() {
  const baseUrl = import.meta.env.BASE_URL || '/'
  const url = `${baseUrl}rig.glb`.replace(/\/+/g, '/')
  return useLoader(GLTFLoader, url, loader => {
    loader.setDRACOLoader(dracoLoader)
  })
}

const DETAIL_LEVELS = [170, 130, 90, 55, 15] // 5 stages — level 0 is silhouette-only, ramping up to full detail

// Per-level build timelines (decoupled). Each level has its own start/peak/end
// cycle time — so N can begin while N-1 is still fading up toward peak,
// giving proper laddered overlap instead of sequential hand-offs.
// `end: null` on L4 means it stays at full opacity through the hold phase.
const WIRE_LEVEL_TIMELINES = [
  { start: 0,  peak: 3,  end: 8  },   // L0
  { start: 2,  peak: 8,  end: 12 },   // L1
  { start: 5,  peak: 10, end: 13 },   // L2
  { start: 10, peak: 14, end: 21 },   // L3
  { start: 13, peak: 20, end: null }, // L4 — held
]

function levelAlphaFromTimeline(cycle, tl) {
  if (cycle < tl.start) return 0
  if (cycle < tl.peak) {
    // easeOutQuart on the rise — reaches ~25% alpha within 0.5s of start
    // and ~46% within 1s, so visibility matches the labeled start time.
    const t = (cycle - tl.start) / (tl.peak - tl.start)
    return easeOutQuart(t)
  }
  if (tl.end == null) return 1 // held
  if (cycle < tl.end) return 1 - (cycle - tl.peak) / (tl.end - tl.peak)
  return 0
}

// Animation phases (seconds):
// 0–25   : wireframe builds from empty → full detail
// 25–50  : wireframe fades out, textured solid fades in
// 50–65  : textured solid fades out, wireframe fades back in
// 65–80  : wireframe fades from full detail → empty
// Three independent timelines run against one shared cycle clock:
//   · Wire master opacity (when wire is visible at all)
//   · Wire LOD progress   (which level of detail is active)
//   · Solid opacity        (textured model fading in/out)
// Phase markers below identify when each curve changes direction.
// 45s BUILD, 20s HOLD, 10s DECONSTRUCTION = 75s cycle
const PHASE_WIRE_BUILD_END    = 40  // wire master starts fading out
const PHASE_WIRE_FADE_OUT_END = 45  // wire master reaches 0 at the hand-off to hold
const PHASE_SOLID_IN_START    = 9
const PHASE_SOLID_IN_END      = 30  // rig fully rendered — build complete
const PHASE_HOLD_END          = 65  // 20s complete-state hold
const PHASE_WIRE_REAPPEAR_END = 66  // wire ramps back in quickly (1s)
const PHASE_SOLID_OUT_END     = 70  // solid fully dissolved (5s)
const PHASE_CYCLE_END         = 70  // wire LOD fully reversed (5s wire takedown)
const PAUSE_DURATION          = 3   // blank pause after everything fades, before loop restarts
const TOTAL_CYCLE_SECONDS     = PHASE_CYCLE_END + PAUSE_DURATION

// Birds fade in 7–14s.
const BIRDS_IN_START = 7
const BIRDS_IN_END   = 14

// ────────────────────────────────────────────────────────────────
//  Helicopter — loads GLB, auto-detects rotors, flies in at crescendo
// ────────────────────────────────────────────────────────────────

// ── Helipad + flight tuning ──────────────────────────────────────
// Adjust HELI_HELIPAD until the red debug marker sits on your rig's pad.
// Positive X = right, positive Y = up, positive Z = toward camera.
const HELI_SCALE = 0.12
const HELI_HELIPAD_DEFAULT = [2.2, 3.9, -7.1]    // dialed in via slider tuner
const SHOW_ENTRY_TEST_ORBS = false                // diagnostic: 8 small colored dots along the first 1/8 of the heli flight curve, for scale-down calibration
const HELI_HOVER_OFFSET = [3, 14, 7]             // start position relative to pad: higher altitude, longer travel
const SHOW_HELIPAD_MARKER = false                 // flip true to re-open the slider tuner

// Rotors are animated as a stroboscopic array of fixed blade clones — each
// blade set sits at a different angle and flashes opacity independently.
// No actual rotation; the eye integrates the flashes into motion.
const NUM_MAIN_BLADE_SETS = 1    // single blade set — no clones, no strobe
const NUM_TAIL_BLADE_SETS = 1
const STROBE_RATE_HZ = 14
const STROBE_WINDOW = 0.5
const STROBE_FLOOR  = 1          // strobe killed — blades always at full opacity
const MAIN_BASE_ROT_SPEED = 5    // rev/sec — faster rotation, still below aliasing threshold
const TAIL_BASE_ROT_SPEED = 8
const SHOW_BLUR_DISCS = false
const BLUR_DISC_OPACITY = 0.2
const MAIN_DISC_SCALE = 3.6
const TAIL_DISC_SCALE = 0.6

// Helicopter timing — birds are at 100% by cycle 10, then the heli enters.
// Lands at cycle 38 (2s before polygon rendering completes at 40).
const HELI_FLY_IN_START     = 6            // enters 4s earlier
const HELI_FADE_IN_END      = 9            // 3s fade in
const HELI_DESCENT_DURATION = 31           // lands at cycle 37
const HELI_FADE_OUT_START   = 65           // begins fade-out when deconstruction starts
const HELI_HIDE             = 70           // gone at cycle restart

// Drag interaction during HOLD
const HELI_LANDING_TIME     = HELI_FLY_IN_START + HELI_DESCENT_DURATION // cycle 37
const HELI_DRAG_MAX_SPEED   = 1.5          // world units per second — ~2× descent average, calm pace
const HELI_YAW_SPEED        = 1.8          // radians per second — how fast heli turns toward a new heading
const HELI_DEFAULT_YAW      = Math.PI      // default model orientation
const HELI_FLY_OFF_HEIGHT   = 25           // how far heli rises during fly-off (cycle 65→70)

// Collision boundaries (all in world XZ plane; Y is unaffected).
// Slippery projection — heli pushed to boundary, slides along tangentially.
const RIG_EXCLUSION_CENTER  = [RIG_POSITION[0], RIG_POSITION[2]] // (-0.8, 0)
const RIG_EXCLUSION_RADIUS  = 7
const SCENE_OUTER_RADIUS    = 40           // heli can't drift past this far from scene center

function useHelicopterModel() {
  const baseUrl = import.meta.env.BASE_URL || '/'
  const url = `${baseUrl}helicopter_final.glb`.replace(/\/+/g, '/')
  return useLoader(GLTFLoader, url, loader => {
    loader.setDRACOLoader(dracoLoader)
  })
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

// Cached world-space axes for rotor rotation. Using world axes keeps the
// blade planes aligned with the ground regardless of the GLB's internal
// transform hierarchy.
const WORLD_Y = new THREE.Vector3(0, 1, 0)
const WORLD_X = new THREE.Vector3(1, 0, 0)

// Radial gradient texture — opaque in the center, alpha fades to 0 at the edge.
// Applied to rotor discs for a soft motion-blur look.
let radialGradientTexture = null
function getRadialGradientTexture() {
  if (radialGradientTexture) return radialGradientTexture
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  grad.addColorStop(0,    'rgba(255,255,255,1)')
  grad.addColorStop(0.75, 'rgba(255,255,255,1)')
  grad.addColorStop(1,    'rgba(255,255,255,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  radialGradientTexture = tex
  return tex
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3)
}

function easeOutQuart(t) {
  return 1 - Math.pow(1 - t, 4)
}

function HelipadMarker({ position }) {
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 0.05, 24]} />
        <meshBasicMaterial color="#ff3355" transparent opacity={0.85} />
      </mesh>
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 3, 8]} />
        <meshBasicMaterial color="#ff3355" />
      </mesh>
      <axesHelper args={[2]} />
    </group>
  )
}

function Helicopter({ padPosition }) {
  const { scene } = useHelicopterModel()
  const { camera, gl } = useThree()
  const groupRef = useRef()
  const mainRotorRef = useRef(null)
  const tailRotorRef = useRef(null)

  // Drag state (all refs to avoid re-renders; useFrame reads/writes these).
  const dragStateRef = useRef({
    isDragging: false,
    target: null,                    // { x, z } world coords mouse points at
    pos: { x: padPosition[0], z: padPosition[2] }, // current heli XZ at pad height
    flyOffStarted: false,
    flyOffStartPos: { x: 0, y: 0, z: 0 },
  })
  const currentCycleRef = useRef(0)

  // Reusable math objects — avoid allocation per-frame.
  const padPlane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, 1, 0), -padPosition[1]),
    [padPosition],
  )
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const intersection = useMemo(() => new THREE.Vector3(), [])
  const ndc = useMemo(() => new THREE.Vector2(), [])

  // Compute world-space target on the pad plane from screen pixel coords.
  const computeTarget = (clientX, clientY) => {
    const rect = gl.domElement.getBoundingClientRect()
    ndc.set(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1,
    )
    raycaster.setFromCamera(ndc, camera)
    if (raycaster.ray.intersectPlane(padPlane, intersection)) {
      return { x: intersection.x, z: intersection.z }
    }
    return null
  }

  // Document-level pointer tracking with capture-phase listeners. Runs
  // before any bubble-phase handler or stopPropagation, and fires even
  // when the click lands on a DOM overlay sitting on top of the canvas.
  useEffect(() => {
    const canvas = gl.domElement
    const insideCanvas = (e) => {
      const r = canvas.getBoundingClientRect()
      return e.clientX >= r.left && e.clientX <= r.right &&
             e.clientY >= r.top && e.clientY <= r.bottom
    }
    const onDown = (e) => {
      const cycle = currentCycleRef.current
      if (cycle < HELI_FLY_IN_START || cycle >= PHASE_HOLD_END) return
      if (!insideCanvas(e)) return
      const tgt = computeTarget(e.clientX, e.clientY)
      if (tgt) {
        dragStateRef.current.isDragging = true
        dragStateRef.current.target = tgt
      }
    }
    const onMove = (e) => {
      if (!dragStateRef.current.isDragging) return
      const tgt = computeTarget(e.clientX, e.clientY)
      if (tgt) dragStateRef.current.target = tgt
    }
    const onUp = () => { dragStateRef.current.isDragging = false }
    document.addEventListener('pointerdown', onDown, true)
    document.addEventListener('pointermove', onMove, true)
    document.addEventListener('pointerup', onUp, true)
    return () => {
      document.removeEventListener('pointerdown', onDown, true)
      document.removeEventListener('pointermove', onMove, true)
      document.removeEventListener('pointerup', onUp, true)
    }
  }, [camera, gl, padPlane])

  const hasBeenControlledRef = useRef(false)

  const handleHelicopterPointerDown = (e) => {
    const cycle = currentCycleRef.current
    // Drag window: from when the heli becomes visible until HOLD ends.
    if (cycle < HELI_FLY_IN_START || cycle >= PHASE_HOLD_END) return
    e.stopPropagation()
    dragStateRef.current.isDragging = true
    if (e.ray && e.ray.intersectPlane(padPlane, intersection)) {
      dragStateRef.current.target = { x: intersection.x, z: intersection.z }
    }
  }

  // One-time: log the full scene graph + find rotor meshes by common naming
  const { model, materials, mainBladeSets, tailBladeSets } = useMemo(() => {
    const cloned = scene.clone(true)

    // Log the scene graph so you can identify rotor mesh names
    // eslint-disable-next-line no-console
    console.group('Helicopter Scene Graph')
    cloned.traverse(obj => {
      // eslint-disable-next-line no-console
      console.log(`${obj.type}: "${obj.name}"${obj.isMesh ? ' [mesh]' : ''}`)
    })
    // eslint-disable-next-line no-console
    console.groupEnd()

    // Identify rotor meshes. This asset (Sketchfab "prop_helicopter_biggood")
    // names its rotors "ChopChop_TOP" and "ChopChop_BACK". Fall back to the
    // generic regex for future models.
    let mainRotor = null
    let tailRotor = null
    cloned.traverse(obj => {
      const name = (obj.name || '').toLowerCase()
      if (!tailRotor && (name.includes('chopchop_back') || /(tail.*rotor|tail.*blade|rear.*rotor|tail.*prop)/.test(name))) {
        tailRotor = obj
      }
    })
    cloned.traverse(obj => {
      if (obj === tailRotor) return
      const name = (obj.name || '').toLowerCase()
      if (!mainRotor && (name.includes('chopchop_top') || /(main.*rotor|main.*blade|rotor.*main|top.*rotor|rotor$|blade$|blades$|propeller$|prop$)/.test(name))) {
        mainRotor = obj
      }
    })

    if (!mainRotor && !tailRotor) {
      // eslint-disable-next-line no-console
      console.warn(
        '[Helicopter] No rotor meshes auto-detected. The model may be a single combined mesh. ' +
        'Workaround: the whole model can be spun, or we can overlay primitive rotor disks. ' +
        'Check the scene graph log above and paste rotor names back to me.',
      )
    } else {
      // eslint-disable-next-line no-console
      console.info('[Helicopter] Auto-detected rotors:', {
        mainRotor: mainRotor?.name,
        tailRotor: tailRotor?.name,
      })
    }

    // Attach a soft-edged disc to each rotor. At high spin speed the blades
    // smear, and the radial-gradient disc fills the gaps so the rotor reads
    // as a solid rotating plane rather than stroboscopic blades.
    const attachBlurDisc = (rotor, axis, scale) => {
      if (!rotor) return null
      let radius = 2.5
      rotor.traverse(obj => {
        if (obj.isMesh && obj.geometry) {
          obj.geometry.computeBoundingSphere()
          const r = obj.geometry.boundingSphere?.radius
          if (r && r > radius) radius = r
        }
      })
      radius *= scale
      const disc = new THREE.Mesh(
        new THREE.CylinderGeometry(radius, radius, 0.02, 48, 1, false),
        new THREE.MeshBasicMaterial({
          map: getRadialGradientTexture(),
          color: 0xffffff,
          transparent: true,
          opacity: 0,
          depthWrite: false,
          toneMapped: false,
          side: THREE.DoubleSide,
        })
      )
      // CylinderGeometry's axis is Y by default — caps lie in the XZ plane,
      // which is horizontal. That's correct for the main rotor.
      // Tail rotor spins on X, so rotate so the disc's axis aligns with X.
      if (axis === 'x') disc.rotation.z = Math.PI / 2
      rotor.add(disc)
      disc.material.userData.maxOpacity = BLUR_DISC_OPACITY
      return disc.material
    }
    // Create N blade clones at equally spaced angles around the spin axis.
    // Each clone gets its own material and a phase offset so it can flash
    // opacity independently in useFrame. Together the flashing creates a
    // rotation illusion with no actual rotation of the parent.
    const createStroboscopicBlades = (rotor, worldAxis, numSets) => {
      if (!rotor) return []
      const template = rotor.children[0]
      if (!template) return []
      const entries = []
      const grayShades = [0xbbbbbb, 0xc8c8c8, 0xb2b2b2, 0xd0d0d0, 0xbebebe]

      // Transform the world spin axis into the rotor's local space so the
      // clone arrangement is truly perpendicular to the world axis (i.e.,
      // blades fan out in a plane that's parallel to the ground).
      rotor.updateMatrixWorld(true)
      const invWorld = new THREE.Matrix4().copy(rotor.matrixWorld).invert()
      const localSpinAxis = worldAxis.clone().transformDirection(invWorld).normalize()

      for (let i = 0; i < numSets; i++) {
        const clone = i === 0 ? template : template.clone(true)
        const angle = (i / numSets) * Math.PI * 2
        clone.quaternion.setFromAxisAngle(localSpinAxis, angle)

        const setMaterials = []
        const shade = grayShades[i % grayShades.length]
        clone.traverse(o => {
          if (!o.isMesh) return
          const m = new THREE.MeshBasicMaterial({
            color: shade,
            transparent: true,
            opacity: 0,
            toneMapped: false,
          })
          o.material = m
          setMaterials.push(m)
        })
        if (i > 0) rotor.add(clone)
        entries.push({
          materials: setMaterials,
          phase: i / numSets,
          brightness: 0.55 + Math.random() * 0.45, // 55-100% peak brightness
        })
      }
      return entries
    }
    const mainBladeSets = createStroboscopicBlades(mainRotor, WORLD_Y, NUM_MAIN_BLADE_SETS)
    const tailBladeSets = createStroboscopicBlades(tailRotor, WORLD_X, NUM_TAIL_BLADE_SETS)

    const mainDiscMat = SHOW_BLUR_DISCS ? attachBlurDisc(mainRotor, 'y', MAIN_DISC_SCALE) : null
    const tailDiscMat = SHOW_BLUR_DISCS ? attachBlurDisc(tailRotor, 'x', TAIL_DISC_SCALE) : null



    // Preserve the GLB's baked texture. Add the diffuse map as an emissive
    // contribution so the shadow side never drops below ~70% of the painted
    // color — prevents the "heavy gray overlay" on the top of the body.
    const materials = []
    const seen = new Set()
    if (mainDiscMat) materials.push(mainDiscMat)
    if (tailDiscMat) materials.push(tailDiscMat)
    cloned.traverse(child => {
      if (!child.isMesh) return
      // Walk up the parents to check if this mesh belongs to a rotor.
      let p = child
      let onRotor = false
      while (p) {
        if ((p.name || '').toLowerCase().includes('chopchop')) { onRotor = true; break }
        p = p.parent
      }
      if (onRotor) {
        // Rotor meshes are managed by the stroboscopic blade system (their
        // materials are created in createStroboscopicBlades and strobed per
        // frame), so skip them here.
        child.castShadow = false
        child.receiveShadow = false
        return
      }
      const mats = Array.isArray(child.material) ? child.material : [child.material]
      mats.forEach(mat => {
        if (!mat || seen.has(mat)) return
        seen.add(mat)
        if (mat.map && 'emissiveMap' in mat) {
          mat.emissive = new THREE.Color(0xffffff)
          mat.emissiveMap = mat.map
          mat.emissiveIntensity = 0.65
        }
        // Lower roughness + slight metalness = sharper specular highlights
        // on the lit side without changing the base texture color.
        if ('roughness' in mat) mat.roughness = 0.45
        if ('metalness' in mat) mat.metalness = 0.1
        mat.transparent = true
        mat.opacity = 0
        mat.toneMapped = false
        mat.needsUpdate = true
        materials.push(mat)
      })
      child.castShadow = false
      child.receiveShadow = false
    })

    return { model: cloned, mainRotor, tailRotor, materials, mainBladeSets, tailBladeSets }
  }, [scene])

  // Flight curve: sweeping counterclockwise arc from 7.857 o'clock entry
  // (the "purple dot" path from the test orbs), around the rig, down to pad.
  const flightCurve = useMemo(() => {
    const padV = new THREE.Vector3(...padPosition)
    const hourAt = (hour, radius, yOffset) => {
      const θ = (hour * Math.PI) / 6
      return new THREE.Vector3(
        padV.x + Math.sin(θ) * radius,
        padV.y + yOffset,
        padV.z - Math.cos(θ) * radius,
      )
    }
    const ENTRY_HOUR = 8.1
    const entry = hourAt(ENTRY_HOUR,       42, -7)
    const mid1  = hourAt(ENTRY_HOUR - 2.2, 24,  1)
    const mid2  = hourAt(ENTRY_HOUR - 4.2, 19,  6)
    const apex  = hourAt(ENTRY_HOUR - 6.2, 13, 12)
    return new THREE.CatmullRomCurve3([entry, mid1, mid2, apex, padV], false, 'catmullrom', 0.5)
  }, [padPosition])

  useEffect(() => {
    const tailName = /(chopchop_back|tail.*rotor|tail.*blade|rear.*rotor|tail.*prop)/
    const mainName = /(chopchop_top|main.*rotor|main.*blade|rotor.*main|top.*rotor|rotor$|blade$|blades$|propeller$|prop$)/
    model.traverse(obj => {
      const name = (obj.name || '').toLowerCase()
      if (!tailRotorRef.current && tailName.test(name)) tailRotorRef.current = obj
    })
    model.traverse(obj => {
      if (obj === tailRotorRef.current) return
      const name = (obj.name || '').toLowerCase()
      if (!mainRotorRef.current && mainName.test(name)) mainRotorRef.current = obj
    })
  }, [model])

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()
    const cycle = t % TOTAL_CYCLE_SECONDS

    let visible = false
    let opacity = 0
    let pathProgress = 0

    if (cycle >= HELI_FLY_IN_START && cycle < HELI_HIDE) {
      visible = true
      pathProgress = Math.min(1, (cycle - HELI_FLY_IN_START) / HELI_DESCENT_DURATION)

      if (cycle > HELI_FADE_OUT_START) {
        opacity = 1 - (cycle - HELI_FADE_OUT_START) / (HELI_HIDE - HELI_FADE_OUT_START)
      } else {
        opacity = 1
      }
      opacity = Math.max(0, Math.min(1, opacity))
    }

    if (materials) {
      for (let i = 0; i < materials.length; i++) {
        const max = materials[i].userData.maxOpacity ?? 1
        materials[i].opacity = opacity * max
      }
    }

    // Keep a shared cycle ref for pointer-event handlers (they can't read state.clock).
    currentCycleRef.current = cycle

    // When a new cycle begins (heli offscreen), clear user-control flag and
    // snap rotation to the default so the heli doesn't spin in from backward
    // on its first reveal.
    if (cycle < HELI_FLY_IN_START) {
      hasBeenControlledRef.current = false
      dragStateRef.current.isDragging = false
      dragStateRef.current.target = null
      dragStateRef.current.pos.x = padPosition[0]
      dragStateRef.current.pos.z = padPosition[2]
      if (groupRef.current) groupRef.current.rotation.y = HELI_DEFAULT_YAW
    }

    if (groupRef.current) {
      groupRef.current.visible = visible
      if (visible) {
        // Dramatic intro scale: heli starts huge and shrinks to HELI_SCALE
        // by the "purple dot" (index 6 of 8 on the diagnostic dots, at
        // rawP = 6/7 × 0.125). Matches the dot the user picked as the
        // point where the heli should reach normal scale.
        const HELI_INTRO_START_SCALE = 1.0
        const SCALE_DOWN_END_P = (6 / 7) * 0.125
        const introT = Math.min(1, pathProgress / SCALE_DOWN_END_P)
        const scaleNow = HELI_INTRO_START_SCALE + (HELI_SCALE - HELI_INTRO_START_SCALE) * introT
        groupRef.current.scale.setScalar(scaleNow)

        const chaseTarget = (ds) => {
          if (!ds.isDragging || !ds.target) return
          hasBeenControlledRef.current = true
          const dx = ds.target.x - ds.pos.x
          const dz = ds.target.z - ds.pos.z
          const dist = Math.sqrt(dx * dx + dz * dz)
          const maxMove = HELI_DRAG_MAX_SPEED * delta
          if (dist <= maxMove) {
            ds.pos.x = ds.target.x
            ds.pos.z = ds.target.z
          } else {
            ds.pos.x += (dx / dist) * maxMove
            ds.pos.z += (dz / dist) * maxMove
          }
          applyBoundaries(ds)
        }

        const applyBoundaries = (ds) => {
          // Rig exclusion: push heli out to boundary radius.
          let dx = ds.pos.x - RIG_EXCLUSION_CENTER[0]
          let dz = ds.pos.z - RIG_EXCLUSION_CENTER[1]
          let d2 = dx * dx + dz * dz
          if (d2 < RIG_EXCLUSION_RADIUS * RIG_EXCLUSION_RADIUS) {
            const d = Math.sqrt(d2) || 0.001
            const f = RIG_EXCLUSION_RADIUS / d
            ds.pos.x = RIG_EXCLUSION_CENTER[0] + dx * f
            ds.pos.z = RIG_EXCLUSION_CENTER[1] + dz * f
          }
          // Scene outer: pull heli back inside the global radius.
          dx = ds.pos.x
          dz = ds.pos.z
          d2 = dx * dx + dz * dz
          if (d2 > SCENE_OUTER_RADIUS * SCENE_OUTER_RADIUS) {
            const d = Math.sqrt(d2)
            const f = SCENE_OUTER_RADIUS / d
            ds.pos.x = dx * f
            ds.pos.z = dz * f
          }
        }

        if (cycle < HELI_LANDING_TIME) {
          // ── Descent phase: user can steer XZ, but Y follows the natural
          // descent curve from hover altitude down to pad.
          const flightPos = flightCurve.getPoint(easeOutCubic(pathProgress))
          const ds = dragStateRef.current
          ds.flyOffStarted = false
          chaseTarget(ds)
          if (hasBeenControlledRef.current) {
            groupRef.current.position.set(ds.pos.x, flightPos.y, ds.pos.z)
          } else {
            groupRef.current.position.copy(flightPos)
            ds.pos.x = flightPos.x
            ds.pos.z = flightPos.z
          }
        } else if (cycle < PHASE_HOLD_END) {
          // ── HOLD phase: heli is grounded; user drag updates XZ directly.
          const ds = dragStateRef.current
          ds.flyOffStarted = false
          chaseTarget(ds)
          groupRef.current.position.set(ds.pos.x, padPosition[1], ds.pos.z)
        } else {
          // ── Fly-off phase: rise upward from wherever heli was at HOLD end.
          const ds = dragStateRef.current
          if (!ds.flyOffStarted) {
            ds.flyOffStarted = true
            ds.flyOffStartPos.x = ds.pos.x
            ds.flyOffStartPos.y = padPosition[1]
            ds.flyOffStartPos.z = ds.pos.z
            ds.isDragging = false
          }
          const p = Math.min(1, (cycle - PHASE_HOLD_END) / (HELI_HIDE - PHASE_HOLD_END))
          const eased = p * p // easeInQuad — accelerating takeoff
          groupRef.current.position.set(
            ds.flyOffStartPos.x,
            ds.flyOffStartPos.y + eased * HELI_FLY_OFF_HEIGHT,
            ds.flyOffStartPos.z,
          )
        }

        // ── Heading (yaw): while dragging, smoothly face movement direction.
        // During auto fly-in, snap to the curve tangent (the tangent changes
        // smoothly with the curve, so direct assignment looks continuous and
        // avoids the visible "hard turn" from HELI_DEFAULT_YAW into the
        // tangent direction). Otherwise relax back to the default orientation.
        {
          const ds = dragStateRef.current
          let desiredYaw = HELI_DEFAULT_YAW
          let snapYaw = false
          if (ds.isDragging && ds.target && cycle >= HELI_FLY_IN_START && cycle < PHASE_HOLD_END) {
            const dx = ds.target.x - ds.pos.x
            const dz = ds.target.z - ds.pos.z
            if (dx * dx + dz * dz > 0.04) { // min deadzone: only reorient if target is more than ~0.2 units away
              desiredYaw = Math.atan2(dx, dz)
            }
          } else if (cycle < HELI_LANDING_TIME && !hasBeenControlledRef.current) {
            const p = easeOutCubic(pathProgress)
            const tangent = flightCurve.getTangent(Math.min(0.999, p + 0.005))
            if (Math.abs(tangent.x) + Math.abs(tangent.z) > 0.001) {
              let yaw = Math.atan2(tangent.x, tangent.z)
              // Over the last quarter of the VISUAL descent (eased progress
              // 0.75 → 1.0), smoothly rotate 60° CCW so the heli squares up
              // to the pad while still visibly moving, not after it parks.
              const ALIGN_START = 3 / 4
              if (p > ALIGN_START) {
                const t = (p - ALIGN_START) / (1 - ALIGN_START)
                const k = t * t * (3 - 2 * t) // smoothstep
                yaw += (60 * Math.PI / 180) * k
              }
              desiredYaw = yaw
              snapYaw = true
            }
          } else if (cycle < PHASE_HOLD_END && !hasBeenControlledRef.current) {
            // Landed and untouched: hold the landing yaw instead of relaxing
            // back to HELI_DEFAULT_YAW (which would cause a visible spin).
            desiredYaw = groupRef.current.rotation.y
            snapYaw = true
          }
          if (snapYaw) {
            groupRef.current.rotation.y = desiredYaw
          } else {
            const currentYaw = groupRef.current.rotation.y
            let yawDiff = desiredYaw - currentYaw
            while (yawDiff > Math.PI) yawDiff -= Math.PI * 2
            while (yawDiff < -Math.PI) yawDiff += Math.PI * 2
            const maxYawStep = HELI_YAW_SPEED * delta
            if (Math.abs(yawDiff) <= maxYawStep) {
              groupRef.current.rotation.y = desiredYaw
            } else {
              groupRef.current.rotation.y = currentYaw + Math.sign(yawDiff) * maxYawStep
            }
          }
        }

        // Rotor speed ramps up as the helicopter approaches the pad — sells
        // "spooling up for landing." 1x at fly-in start → ~2.8x at touchdown.
        const rotorSpeedMult = 1 + pathProgress * 1.8

        // Slow base rotation of the whole blade array, applied on the
        // world axis so the blade plane stays parallel to the ground
        // regardless of the rotor object's local orientation.
        if (mainRotorRef.current) {
          mainRotorRef.current.rotateOnWorldAxis(
            WORLD_Y, delta * MAIN_BASE_ROT_SPEED * rotorSpeedMult * Math.PI * 2,
          )
        }
        if (tailRotorRef.current) {
          tailRotorRef.current.rotateOnWorldAxis(
            WORLD_X, delta * TAIL_BASE_ROT_SPEED * rotorSpeedMult * Math.PI * 2,
          )
        }

        // Stroboscopic rotor illusion: each blade set has its own phase;
        // opacity peaks briefly in its window and decays otherwise. The
        // collective pattern reads as fast asymmetric motion.
        const strobeRate = STROBE_RATE_HZ * rotorSpeedMult
        const strobeSets = (sets) => {
          if (!sets) return
          for (let i = 0; i < sets.length; i++) {
            const entry = sets[i]
            const phase = (t * strobeRate + entry.phase) % 1
            const dist = Math.min(phase, 1 - phase)
            const pulse = Math.max(0, 1 - dist / STROBE_WINDOW)
            // Lift by STROBE_FLOOR so blades never drop fully to zero.
            const softened = STROBE_FLOOR + pulse * (1 - STROBE_FLOOR)
            const bladeOpacity = opacity * softened * entry.brightness
            for (let j = 0; j < entry.materials.length; j++) {
              entry.materials[j].opacity = bladeOpacity
            }
          }
        }
        strobeSets(mainBladeSets)
        strobeSets(tailBladeSets)
      } else {
        // Helicopter invisible — ensure blade materials are also fully hidden
        const hideSets = (sets) => {
          if (!sets) return
          for (let i = 0; i < sets.length; i++) {
            for (let j = 0; j < sets[i].materials.length; j++) {
              sets[i].materials[j].opacity = 0
            }
          }
        }
        hideSets(mainBladeSets)
        hideSets(tailBladeSets)
      }
    }
  })

  return (
    <group ref={groupRef} visible={false}>
      <primitive object={model} />
    </group>
  )
}

function RigWireframe() {
  const { scene } = useRigModel()

  // Shared uniform that drives the fragment-dissolve in every solid material
  const solidProgressUniform = useRef({ value: 0 })
  // Tracks when this component first rendered, so the animation cycle starts
  // from 0 at mount time — prevents "pop-in" when the rig mounts late.
  const mountTimeRef = useRef(null)

  const { wireRoot, solidRoot, levelMaterials, solidMaterials } = useMemo(() => {
    const cloned = scene.clone(true)

    const box = new THREE.Box3().setFromObject(cloned)
    const size = new THREE.Vector3()
    box.getSize(size)
    const center = new THREE.Vector3()
    box.getCenter(center)
    const maxDim = Math.max(size.x, size.y, size.z)
    const scale = TARGET_SIZE / maxDim

    cloned.position.sub(center)
    cloned.updateMatrixWorld(true)

    // ── Wireframe (multi-level) ──
    const levelMaterials = DETAIL_LEVELS.map(() =>
      new THREE.LineBasicMaterial({
        color: new THREE.Color(WIRE_COLOR),
        transparent: true,
        opacity: 0,
        depthWrite: false,
      })
    )

    const wireRoot = new THREE.Group()
    wireRoot.scale.setScalar(scale)

    cloned.traverse(child => {
      if (child.isMesh && child.geometry) {
        child.updateWorldMatrix(true, false)
        DETAIL_LEVELS.forEach((threshold, i) => {
          const edges = new THREE.EdgesGeometry(child.geometry, threshold)
          const line = new THREE.LineSegments(edges, levelMaterials[i])
          line.matrixAutoUpdate = false
          line.matrix.copy(child.matrixWorld)
          wireRoot.add(line)
        })
      }
    })

    // ── Solid textured model with per-triangle dissolve ──
    const solidRoot = new THREE.Group()
    solidRoot.scale.setScalar(scale)
    solidRoot.add(cloned)

    const solidMaterials = []
    cloned.traverse(child => {
      if (child.isMesh && child.geometry && child.material) {
        // Convert indexed geometry to non-indexed so each triangle has its own 3 unique vertices.
        // This lets us give every triangle its own per-vertex (and thus per-fragment) hash value.
        if (child.geometry.index) {
          child.geometry = child.geometry.toNonIndexed()
        }

        // Assign a random 0–1 hash per triangle, broadcast to all 3 of its vertices.
        const posCount = child.geometry.attributes.position.count
        const triCount = Math.floor(posCount / 3)
        const hashes = new Float32Array(posCount)
        for (let t = 0; t < triCount; t++) {
          const h = Math.random()
          hashes[t * 3] = h
          hashes[t * 3 + 1] = h
          hashes[t * 3 + 2] = h
        }
        child.geometry.setAttribute('aTriHash', new THREE.BufferAttribute(hashes, 1))

        const mats = Array.isArray(child.material) ? child.material : [child.material]
        mats.forEach(mat => {
          mat.transparent = false
          mat.depthWrite = true
          mat.side = THREE.DoubleSide
          mat.onBeforeCompile = shader => {
            shader.uniforms.uProgress = solidProgressUniform.current

            shader.vertexShader = shader.vertexShader
              .replace(
                'void main() {',
                `attribute float aTriHash;
                 varying float vTriHash;
                 void main() {
                   vTriHash = aTriHash;`,
              )

            shader.fragmentShader = shader.fragmentShader
              .replace(
                'void main() {',
                `uniform float uProgress;
                 varying float vTriHash;
                 void main() {`,
              )
              .replace(
                '#include <dithering_fragment>',
                `#include <dithering_fragment>
                 if (vTriHash > uProgress) discard;`,
              )
          }
          mat.customProgramCacheKey = () => 'rig-solid-tri-dissolve-v1'
          mat.needsUpdate = true
          solidMaterials.push(mat)
        })
      }
    })

    return { wireRoot, solidRoot, levelMaterials, solidMaterials }
  }, [scene])

  useFrame((state) => {
    if (mountTimeRef.current === null) mountTimeRef.current = state.clock.getElapsedTime()
    const t = state.clock.getElapsedTime() - mountTimeRef.current
    const cycle = t % TOTAL_CYCLE_SECONDS

    let wireMasterOpacity  // 0..1 multiplier on all wireframe levels
    let wireLODProgress    // 0..1 feeding into the level crossfade
    let solidOpacity       // 0..1 on textured meshes

    // ── Wire master opacity ──
    if (cycle < PHASE_WIRE_BUILD_END) {
      wireMasterOpacity = 1
    } else if (cycle < PHASE_WIRE_FADE_OUT_END) {
      wireMasterOpacity = 1 - (cycle - PHASE_WIRE_BUILD_END) / (PHASE_WIRE_FADE_OUT_END - PHASE_WIRE_BUILD_END)
    } else if (cycle < PHASE_HOLD_END) {
      wireMasterOpacity = 0
    } else if (cycle < PHASE_WIRE_REAPPEAR_END) {
      wireMasterOpacity = (cycle - PHASE_HOLD_END) / (PHASE_WIRE_REAPPEAR_END - PHASE_HOLD_END)
    } else {
      wireMasterOpacity = 1
    }

    // ── Wire LOD progress (used only for deconstruction LOD-reverse) ──
    // During build + hold we use the per-level timelines directly (below)
    // for true laddered overlap; the shared wireLODProgress controls only
    // the reverse LOD crossfade during the deconstruction phase.
    if (cycle < PHASE_HOLD_END) {
      wireLODProgress = 1 // irrelevant during build/hold — per-level takes over
    } else if (cycle < PHASE_CYCLE_END) {
      wireLODProgress = 1 - (cycle - PHASE_HOLD_END) / (PHASE_CYCLE_END - PHASE_HOLD_END)
    } else {
      wireLODProgress = 0 // pause — everything already gone
    }

    // ── Solid opacity ──
    // easeInOutCubic: gentle slow rise at the start (no rapid fire-in),
    // accelerates through the middle, eases into the held state.
    if (cycle < PHASE_SOLID_IN_START) {
      solidOpacity = 0
    } else if (cycle < PHASE_SOLID_IN_END) {
      const t = (cycle - PHASE_SOLID_IN_START) / (PHASE_SOLID_IN_END - PHASE_SOLID_IN_START)
      solidOpacity = easeInOutCubic(t)
    } else if (cycle < PHASE_HOLD_END) {
      solidOpacity = 1
    } else if (cycle < PHASE_SOLID_OUT_END) {
      solidOpacity = 1 - (cycle - PHASE_HOLD_END) / (PHASE_SOLID_OUT_END - PHASE_HOLD_END)
    } else {
      solidOpacity = 0
    }

    // Apply per-level opacity × master opacity.
    // Build + hold: per-level timelines (laddered, independent).
    // Deconstruction: shared reverse-LOD crossfade.
    const N = DETAIL_LEVELS.length
    if (cycle < PHASE_HOLD_END) {
      levelMaterials.forEach((mat, i) => {
        const alpha = levelAlphaFromTimeline(cycle, WIRE_LEVEL_TIMELINES[i])
        mat.opacity = alpha * WIRE_OPACITY * wireMasterOpacity
      })
    } else {
      const step = 1 / N
      levelMaterials.forEach((mat, i) => {
        const peak = (i + 1) * step
        const dist = Math.abs(wireLODProgress - peak)
        const levelAlpha = Math.max(0, 1 - dist / step)
        mat.opacity = levelAlpha * WIRE_OPACITY * wireMasterOpacity
      })
    }

    // Apply solid model dissolve progress (0 = fully dissolved, 1 = fully solid)
    solidProgressUniform.current.value = solidOpacity
  })

  return (
    <group position={RIG_POSITION}>
      <primitive object={wireRoot} />
      <primitive object={solidRoot} />
    </group>
  )
}

function EntryTestOrbs({ padPosition }) {
  // Diagnostic: 8 small static colored dots placed along the first 1/8 of
  // the heli flight curve. Visible at all times so we can read exactly where
  // along the track the helicopter should reach each scale value.
  // Eased with easeOutCubic to match how pathProgress maps to curve position.
  const COLORS = ['#000000', '#ff1a1a', '#ff8800', '#ffee00', '#00cc33', '#0066ff', '#aa00ff', '#ffffff']

  const positions = useMemo(() => {
    const padV = new THREE.Vector3(...padPosition)
    const hourAt = (hour, radius, yOffset) => {
      const θ = (hour * Math.PI) / 6
      return new THREE.Vector3(
        padV.x + Math.sin(θ) * radius,
        padV.y + yOffset,
        padV.z - Math.cos(θ) * radius,
      )
    }
    const ENTRY_HOUR = 8.1
    const entry = hourAt(ENTRY_HOUR,       42, -7)
    const mid1  = hourAt(ENTRY_HOUR - 2.2, 24,  1)
    const mid2  = hourAt(ENTRY_HOUR - 4.2, 19,  6)
    const apex  = hourAt(ENTRY_HOUR - 6.2, 13, 12)
    const curve = new THREE.CatmullRomCurve3([entry, mid1, mid2, apex, padV], false, 'catmullrom', 0.5)

    // 8 dots, evenly spaced in pathProgress from 0 → 0.125, eased the same
    // way the heli samples the curve (easeOutCubic) so dot N marks "heli at
    // pathProgress = N × (0.125/7)."
    const N = COLORS.length
    const out = []
    for (let i = 0; i < N; i++) {
      const rawP = (i / (N - 1)) * 0.125
      const eased = easeOutCubic(rawP)
      out.push(curve.getPoint(eased))
    }
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [padPosition])

  return (
    <group>
      {COLORS.map((color, i) => (
        <mesh key={i} position={positions[i]}>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

function Ocean({ sunPosition }) {
  const ref = useRef()
  const baseUrl = import.meta.env.BASE_URL || '/'
  const normalsUrl = `${baseUrl}waternormals.jpg`.replace(/\/+/g, '/')
  const normals = useLoader(THREE.TextureLoader, normalsUrl)

  const geometry = useMemo(() => new THREE.PlaneGeometry(10000, 10000), [])

  const config = useMemo(() => {
    normals.wrapS = normals.wrapT = THREE.RepeatWrapping
    normals.repeat.set(32, 32) // finer, more detailed wave tiling
    return {
      textureWidth: 256, // reduced from 512 — halves the reflection render cost
      textureHeight: 256,
      waterNormals: normals,
      sunDirection: sunPosition.clone().normalize(),
      sunColor: 0xffffff,
      waterColor: 0xc5d9e6, // much lighter blue — dark tones become airy light-blue instead
      distortionScale: 0.5,
      alpha: 1.0, // water opacity — full
      fog: false,
    }
  }, [normals, sunPosition])

  useEffect(() => {
    if (!ref.current?.material) return
    const mat = ref.current.material
    mat.transparent = true

    // Patch the water shader to reduce reflection intensity.
    // The default shader blends reflectionSample * 0.9 with the water color;
    // we cut that down so the rig's mirror image is subtler.
    if (!mat.userData.__reflectivityTuned) {
      mat.fragmentShader = mat.fragmentShader
        .replace(/reflectionSample\.rgb \* 0\.9/g, 'reflectionSample.rgb * 0.45')
        .replace('float rf0 = 0.3;', 'float rf0 = 0.12;')
        // Lift darkest water values toward waterColor so it doesn't read as gloomy shadows.
        // gl_FragColor.rgb is the final water color; we blend it toward waterColor by a fixed amount.
        .replace(
          'gl_FragColor = vec4( outgoingLight, alpha );',
          'gl_FragColor = vec4( mix( outgoingLight, waterColor, 0.25 ), alpha );'
        )
      mat.userData.__reflectivityTuned = true
    }
    mat.needsUpdate = true
  }, [])

  useFrame((_, delta) => {
    if (ref.current?.material?.uniforms?.['time']) {
      ref.current.material.uniforms['time'].value += delta * 0.1
    }
  })

  return (
    <water
      ref={ref}
      args={[geometry, config]}
      rotation-x={-Math.PI / 2}
      position={[0, -2.2, 0]}
    />
  )
}

// ── Clouds (wispy cirrus, high in sky) ──
function createCloudTexture() {
  const W = 512, H = 128
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  // Base elongated radial gradient: bright center, fades to transparent
  const base = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.45)
  base.addColorStop(0, 'rgba(255,255,255,0.95)')
  base.addColorStop(0.4, 'rgba(255,255,255,0.55)')
  base.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = base
  ctx.fillRect(0, 0, W, H)

  // Layered wispy overlays for irregular puff structure
  for (let i = 0; i < 7; i++) {
    const x = W * 0.15 + Math.random() * W * 0.7
    const y = H * 0.3 + Math.random() * H * 0.4
    const r = 40 + Math.random() * 90
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, 'rgba(255,255,255,0.35)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(x - r, y - r, r * 2, r * 2)
  }

  // Apply a vertical alpha mask so top and bottom edges fade to transparent —
  // kills the hard rectangle edge from the radial gradient clipping.
  ctx.globalCompositeOperation = 'destination-in'
  const mask = ctx.createLinearGradient(0, 0, 0, H)
  mask.addColorStop(0, 'rgba(0,0,0,0)')
  mask.addColorStop(0.25, 'rgba(0,0,0,1)')
  mask.addColorStop(0.75, 'rgba(0,0,0,1)')
  mask.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = mask
  ctx.fillRect(0, 0, W, H)
  ctx.globalCompositeOperation = 'source-over'

  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

function SkyClouds() {
  const cloudTexture = useMemo(createCloudTexture, [])
  const refs = useRef([])

  // Per-cloud bundle of independent random parameters. Each cloud now has:
  //  - its own spawn y/z
  //  - its own drift speed along +X (all move same general direction)
  //  - scale pulse (grows/shrinks over time)
  //  - horizontal stretch oscillation (trapezoidal-feeling distortion)
  //  - opacity pulse
  //  - "diffuseness" factor (some clouds read softer/bigger)
  //  - scale-based brightness boost ("bloom" when a cloud is puffing up)
  const clouds = useMemo(() => {
    const count = 10
    return Array.from({ length: count }, (_, i) => ({
      // Spread initial X across the full wrap range so they're not all at the same spot
      startX: -60 + (i / count) * 120 + (Math.random() - 0.5) * 10,
      baseY: 22 + Math.random() * 18,
      baseZ: -35 + Math.random() * 70,
      baseScale: 20 + Math.random() * 14,
      aspect: 0.2 + Math.random() * 0.22, // h/w ratio
      driftSpeed: 0.35 + Math.random() * 0.55, // units per second — all positive (+X)

      scalePulseAmp: 0.22 + Math.random() * 0.3,
      scalePulsePeriod: 9 + Math.random() * 11,
      scalePulsePhase: Math.random() * Math.PI * 2,

      stretchAmp: 0.18 + Math.random() * 0.3,
      stretchPeriod: 11 + Math.random() * 12,
      stretchPhase: Math.random() * Math.PI * 2,

      opacityBase: 0.55 + Math.random() * 0.3,
      opacityPulseAmp: 0.12 + Math.random() * 0.22,
      opacityPulsePeriod: 8 + Math.random() * 10,
      opacityPulsePhase: Math.random() * Math.PI * 2,

      diffuseness: 0.75 + Math.random() * 0.65, // >1 = bigger, softer-looking
    }))
  }, [])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    const cycle = t % TOTAL_CYCLE_SECONDS

    const IN_START = 5
    const IN_END = 30
    const OUT_START = 60
    const OUT_END = 70

    let envelope = 0
    if (cycle >= IN_START && cycle < IN_END) {
      envelope = (cycle - IN_START) / (IN_END - IN_START)
    } else if (cycle >= IN_END && cycle < OUT_START) {
      envelope = 1
    } else if (cycle >= OUT_START && cycle < OUT_END) {
      envelope = 1 - (cycle - OUT_START) / (OUT_END - OUT_START)
    }

    refs.current.forEach((sprite, i) => {
      if (!sprite) return
      const c = clouds[i]

      // Drift +X, wrap into [-60, 60] using a positive modulo
      const raw = c.startX + t * c.driftSpeed
      const x = (((raw + 60) % 120) + 120) % 120 - 60

      // Non-linear scale pulse (each cloud has its own rhythm)
      const scaleSin = Math.sin((t / c.scalePulsePeriod) * Math.PI * 2 + c.scalePulsePhase)
      const scaleMult = 1 + scaleSin * c.scalePulseAmp

      // Stretch — compresses width vs height asymmetrically to give a trapezoidal/distorted feel
      const stretchSin = Math.sin((t / c.stretchPeriod) * Math.PI * 2 + c.stretchPhase)
      const stretch = 1 + stretchSin * c.stretchAmp

      const base = c.baseScale * scaleMult * c.diffuseness
      sprite.scale.set(base * stretch, base * c.aspect / stretch, 1)

      sprite.position.x = x
      sprite.position.y = c.baseY + Math.sin(t * 0.09 + c.scalePulsePhase) * 1.5
      sprite.position.z = c.baseZ + Math.cos(t * 0.06 + c.stretchPhase) * 1.2

      // Opacity pulse + bloom boost when scale is growing
      const opPulse = c.opacityBase + Math.sin((t / c.opacityPulsePeriod) * Math.PI * 2 + c.opacityPulsePhase) * c.opacityPulseAmp
      const bloomBoost = scaleSin > 0 ? 1 + scaleSin * 0.25 : 1
      // Edge fade so clouds don't pop when they wrap through the +/-60 boundary
      const edgeFade = Math.min(1, (60 - Math.abs(x)) / 8)

      if (sprite.material) {
        sprite.material.opacity = envelope * opPulse * bloomBoost * edgeFade
      }
    })
  })

  return (
    <group>
      {clouds.map((_, i) => (
        <sprite key={i} ref={el => (refs.current[i] = el)} renderOrder={-1}>
          <spriteMaterial
            map={cloudTexture}
            transparent
            opacity={0}
            depthWrite={false}
          />
        </sprite>
      ))}
    </group>
  )
}

// ── Birds ──
// Draw a simple M-shape bird silhouette into a canvas → texture → sprite
function createBirdTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 32
  const ctx = canvas.getContext('2d')
  ctx.strokeStyle = 'rgba(30, 36, 48, 1)'
  ctx.lineWidth = 2.5
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  // Classic soaring bird — M curve
  ctx.beginPath()
  ctx.moveTo(4, 22)
  ctx.quadraticCurveTo(16, 8, 32, 20)
  ctx.quadraticCurveTo(48, 8, 60, 22)
  ctx.stroke()
  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

function Birds() {
  const birdTexture = useMemo(createBirdTexture, [])
  const refs = useRef([])

  // Per-bird randomness baked once so they don't jitter on re-render
  const birds = useMemo(() => {
    const count = 10
    return Array.from({ length: count }, (_, i) => ({
      angleOffset: (i / count) * Math.PI * 2 + Math.random() * 0.8,
      radius: 6.5 + Math.random() * 3.5,
      yOffset: Math.random() * 2.2,
      // Alternating direction: even = clockwise, odd = counter-clockwise
      speed: (0.18 + Math.random() * 0.12) * (i % 2 === 0 ? 1 : -1),
      bobPhase: Math.random() * Math.PI * 2,
      size: 0.35 + Math.random() * 0.25,
    }))
  }, [])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    const cycle = t % TOTAL_CYCLE_SECONDS

    // Birds appear early as a lead-in, stay through the hold, fade during deconstruction.
    let opacity = 0
    if (cycle >= BIRDS_IN_START && cycle < BIRDS_IN_END) {
      opacity = (cycle - BIRDS_IN_START) / (BIRDS_IN_END - BIRDS_IN_START)
    } else if (cycle >= BIRDS_IN_END && cycle < PHASE_HOLD_END) {
      opacity = 1
    } else if (cycle >= PHASE_HOLD_END && cycle < PHASE_SOLID_OUT_END) {
      opacity = 1 - (cycle - PHASE_HOLD_END) / (PHASE_SOLID_OUT_END - PHASE_HOLD_END)
    }

    refs.current.forEach((sprite, i) => {
      if (!sprite) return
      const b = birds[i]
      const angle = b.angleOffset + t * b.speed
      sprite.position.set(
        Math.cos(angle) * b.radius,
        8.5 + b.yOffset + Math.sin(t * 0.6 + b.bobPhase) * 0.4, // circle above rig top
        Math.sin(angle) * b.radius,
      )
      sprite.scale.set(b.size, b.size * 0.5, 1)
      if (sprite.material) {
        sprite.material.opacity = opacity * 0.85
      }
    })
  })

  return (
    <group position={RIG_POSITION}>
      {birds.map((_, i) => (
        <sprite key={i} ref={el => (refs.current[i] = el)}>
          <spriteMaterial
            map={birdTexture}
            transparent
            opacity={0}
            depthWrite={false}
          />
        </sprite>
      ))}
    </group>
  )
}

function CameraAutomation() {
  const { camera } = useThree()
  const target = useMemo(() => new THREE.Vector3(...ORBIT_TARGET), [])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()

    // Tripled rotation speed — full loop ~60 s
    const rotationSpeed = 0.105 // rad/s
    const angle = -t * rotationSpeed

    // Wider perturbation — closer perigee pass while keeping overall orbit roomy
    const baseRadius = 22
    const radiusX = baseRadius + Math.sin(t * 0.15) * 7
    const radiusZ = baseRadius + Math.cos(t * 0.11) * 7

    // Position around the rig target, with a gentle vertical drift
    const camX = ORBIT_TARGET[0] + Math.sin(angle) * radiusX
    const camZ = ORBIT_TARGET[2] + Math.cos(angle) * radiusZ
    const camY = -1.6 + Math.sin(t * 0.18) * 0.35

    camera.position.set(camX, camY, camZ)
    camera.lookAt(target)
  })

  return null
}

function ClockReporter({ reportRef }) {
  const mountTimeRef = useRef(null)
  useFrame((state) => {
    if (mountTimeRef.current === null) mountTimeRef.current = state.clock.getElapsedTime()
    const t = state.clock.getElapsedTime() - mountTimeRef.current
    reportRef.current = t % TOTAL_CYCLE_SECONDS
  })
  return null
}

function phaseLabel(cycle) {
  if (cycle < PHASE_WIRE_BUILD_END) return 'WIRE BUILD'
  if (cycle < PHASE_SOLID_IN_END)   return 'SOLID FADE-IN (wire fading out)'
  if (cycle < PHASE_HOLD_END)       return 'HOLD (complete)'
  if (cycle < PHASE_SOLID_OUT_END)  return 'DECONSTRUCTION (solid + wire)'
  return 'WIRE LOD DISASSEMBLY'
}

function ViewOffset({ offset = VIEW_SHIFT, vOffset = V_SHIFT }) {
  const { camera, size } = useThree()
  useEffect(() => {
    camera.setViewOffset(
      size.width,
      size.height,
      -size.width * offset, // negative = scene shifts right on canvas
      size.height * vOffset, // positive = scene shifts up on canvas (horizon rises)
      size.width,
      size.height,
    )
    camera.updateProjectionMatrix()
    return () => {
      camera.clearViewOffset()
      camera.updateProjectionMatrix()
    }
  }, [camera, size, offset, vOffset])
  return null
}

function SkyDome({ sunPosition }) {
  const ref = useRef()

  useEffect(() => {
    if (!ref.current) return
    const mat = ref.current.material
    const u = mat.uniforms
    u['turbidity'].value = 3
    u['rayleigh'].value = 1.6
    u['mieCoefficient'].value = 0 // removes the sun's mie glow
    u['mieDirectionalG'].value = 0.8
    u['sunPosition'].value.copy(sunPosition)
    // Dedicated uniform to disable the sharp sun disc
    if (u['showSunDisc']) u['showSunDisc'].value = 0

    // Warp the vertical gradient: stretch the horizon colors up, compress the zenith blue.
    // We replace the direction calculation so that anything below the zenith gets squared,
    // pulling the warm/pink band higher into the sky and giving a harder blue at the top.
    const warpInjection = `
      vec3 direction = normalize( vWorldPosition - cameraPos );
      direction = normalize(vec3(
        direction.x,
        sign(direction.y) * pow(abs(direction.y), 2.0),
        direction.z
      ));
    `
    if (!mat.userData.__gradientWarped) {
      mat.fragmentShader = mat.fragmentShader.replace(
        'vec3 direction = normalize( vWorldPosition - cameraPos );',
        warpInjection,
      )
      mat.userData.__gradientWarped = true
      mat.needsUpdate = true
    }
  }, [sunPosition])

  return <sky ref={ref} scale={[1000, 1000, 1000]} />
}

export default function Rig3D({ className = '' }) {
  const [padPosition, setPadPosition] = useState(HELI_HELIPAD_DEFAULT)
  const [showPadTuner, setShowPadTuner] = useState(SHOW_HELIPAD_MARKER)

  // Defer heavy scene content until Landing.jsx's framer-motion entrance
  // animations have had time to play — otherwise the GLB decode + LOD
  // generation blocks the main thread and the page elements jump to their
  // end state instead of fading in. 1200ms covers the longest animation
  // (delay 0.6s + duration 0.8s = 1.4s).
  const [mountScene, setMountScene] = useState(false)
  const [mountHeli, setMountHeli] = useState(false)
  useEffect(() => {
    const sceneId = setTimeout(() => setMountScene(true), 1200)
    const heliId = setTimeout(() => setMountHeli(true), 2000)
    return () => {
      clearTimeout(sceneId)
      clearTimeout(heliId)
    }
  }, [])

  // Debug clock overlay (flip to true to re-enable)
  const [showClock, setShowClock] = useState(false)

  // Pause rendering when the tab is hidden — 0% GPU when backgrounded.
  const [frameloop, setFrameloop] = useState('always')
  useEffect(() => {
    const onVis = () => setFrameloop(document.hidden ? 'never' : 'always')
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])
  const clockRef = useRef(0)
  const clockDomRef = useRef(null)
  const phaseDomRef = useRef(null)
  useEffect(() => {
    if (!showClock) return
    const id = setInterval(() => {
      const c = clockRef.current
      if (clockDomRef.current) clockDomRef.current.textContent = c.toFixed(1) + 's  / 73s'
      if (phaseDomRef.current) phaseDomRef.current.textContent = phaseLabel(c)
    }, 50)
    return () => clearInterval(id)
  }, [showClock])

  const sunPosition = useMemo(() => {
    const v = new THREE.Vector3()
    const phi = THREE.MathUtils.degToRad(55) // higher in sky for daylight
    const theta = THREE.MathUtils.degToRad(180)
    v.setFromSphericalCoords(1, phi, theta)
    return v.multiplyScalar(100)
  }, [])

  return (
    <div className={`relative ${className}`}>
      <Canvas
        camera={{ position: [0, -0.5, 24], fov: 50, near: 0.01, far: 2000 }}
        dpr={[1, 1.5]}
        frameloop={frameloop}
        gl={{ alpha: true, antialias: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} />
        <hemisphereLight args={['#bfd9ff', '#4a6070', 0.5]} />
        <directionalLight
          position={sunPosition}
          intensity={1.3}
          color="#fffbe8"
        />

        <ViewOffset />
        <CameraAutomation />
        {showClock && <ClockReporter reportRef={clockRef} />}

        <Suspense fallback={null}>
          <SkyDome sunPosition={sunPosition} />
        </Suspense>

        {/* Ocean mounts immediately (tiny texture, fast decode) so the water
            is already on screen before the rig wireframe begins building. */}
        <Suspense fallback={null}>
          <Ocean sunPosition={sunPosition} />
        </Suspense>

        {mountScene && (
          <Suspense fallback={null}>
            <SkyClouds />
            <RigWireframe />
            <Birds />
          </Suspense>
        )}

        {/* Helicopter: mount is delayed 2s post-paint (see mountHeli) so its
            GLB decode doesn't clobber page-entrance animations. Its own
            Suspense keeps its load independent of the rig's animation state. */}
        {mountHeli && (
          <Suspense fallback={null}>
            <Helicopter padPosition={padPosition} />
          </Suspense>
        )}

        {SHOW_ENTRY_TEST_ORBS && <EntryTestOrbs padPosition={padPosition} />}
        {showPadTuner && <HelipadMarker position={padPosition} />}
      </Canvas>

      {showPadTuner && createPortal(
        <div style={{ position: 'fixed', top: 12, right: 12, zIndex: 2147483647 }} className="bg-white border border-gray-400 rounded-sm shadow-lg p-3 font-mono text-[11px] tracking-wide text-bp-dark-grey w-64">
          <div className="flex items-center justify-between mb-2">
            <span className="uppercase font-semibold">Helipad Position</span>
            <button
              type="button"
              onClick={() => setShowPadTuner(false)}
              className="text-bp-silver hover:text-bp-dark-grey text-[14px] leading-none"
              aria-label="Hide helipad tuner"
            >
              ×
            </button>
          </div>
          {[
            { axis: 'X', idx: 0, min: -20, max: 20 },
            { axis: 'Y', idx: 1, min: 0, max: 30 },
            { axis: 'Z', idx: 2, min: -20, max: 20 },
          ].map(({ axis, idx, min, max }) => (
            <div key={axis} className="flex items-center gap-2 mb-1">
              <span className="w-4">{axis}</span>
              <input
                type="range"
                min={min}
                max={max}
                step={0.1}
                value={padPosition[idx]}
                onChange={e => {
                  const next = [...padPosition]
                  next[idx] = parseFloat(e.target.value)
                  setPadPosition(next)
                }}
                className="flex-1"
              />
              <span className="w-12 text-right">{padPosition[idx].toFixed(1)}</span>
            </div>
          ))}
          <div className="mt-2 pt-2 border-t border-gray-200 text-[10px] text-bp-silver">
            [{padPosition.map(n => n.toFixed(1)).join(', ')}]
          </div>
        </div>,
        document.body,
      )}

      {showClock && createPortal(
        <div style={{
          position: 'fixed', top: 12, left: 12, zIndex: 2147483647,
          background: 'white', border: '1px solid #333', padding: '8px 12px',
          fontFamily: 'monospace', fontSize: 12, lineHeight: 1.5,
          minWidth: 280, boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <strong>Cycle Clock</strong>
            <button
              type="button"
              onClick={() => setShowClock(false)}
              style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}
            >×</button>
          </div>
          <div style={{ fontSize: 20, fontWeight: 600 }} ref={clockDomRef}>0.0s / 73s</div>
          <div style={{ fontSize: 11, color: '#666' }} ref={phaseDomRef}>—</div>
          <hr style={{ margin: '8px 0', border: 0, borderTop: '1px solid #eee' }} />
          <div style={{ fontSize: 10, color: '#666', lineHeight: 1.6 }}>
            <div>7–14s: birds fade in</div>
            <div>0–45s: wire build</div>
            <div style={{ paddingLeft: 10 }}>
              <div>• L0 (silhouette): 0 → 3 → 8</div>
              <div>• L1: 2 → 8 → 12</div>
              <div>• L2: 5 → 10 → 13</div>
              <div>• L3: 10 → 14 → 21</div>
              <div>• L4 (full): 13 → 20 → held</div>
            </div>
            <div>5–30s: clouds fade in</div>
            <div>6s: helicopter enters</div>
            <div>9–30s: solid polygons (easeInOutCubic)</div>
            <div>40–45s: wire fades out (crossfade)</div>
            <div>37s: helicopter lands</div>
            <div>45–65s: <strong>HOLD</strong> (20s)</div>
            <div>65–70s: solid fades out</div>
            <div>65–70s: wire LOD reverses</div>
            <div>70–73s: <strong>PAUSE</strong> (blank before loop)</div>
          </div>
        </div>,
        document.body,
      )}

      {/* Bottom haze — fades close water into the page's white canvas */}
      <div className="absolute bottom-6 left-0 right-0 h-40 bg-gradient-to-t from-white via-white/25 to-transparent pointer-events-none" />

      {/* Attribution — one-line bar sitting below the canvas area. The bar
          itself spans full viewport width (matches the canvas), but the text
          is constrained to the same max-w-6xl + px-8 as the page content, so
          it reads as if contained within the page's horizontal rule. */}
      <div className="absolute bottom-0 left-0 right-0 h-6 flex items-center bg-white whitespace-nowrap">
        <div className="max-w-6xl mx-auto w-full px-8 flex items-center justify-end">
          <div
            className="text-[7px] tracking-[0.1em] uppercase text-bp-dark-grey opacity-70 flex items-center"
            style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
          >
            MODEL:{' '}
            <a
              href="https://skfb.ly/oOTpN"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-bp-green transition-colors ml-1"
            >
              OIL RIG — LOW POLY
            </a>
            <span className="mx-1">BY BENKOS · LICENSED</span>
            <a
              href="http://creativecommons.org/licenses/by/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-bp-green transition-colors"
            >
              CC BY 4.0
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
