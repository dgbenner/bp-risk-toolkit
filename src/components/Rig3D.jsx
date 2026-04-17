import { Suspense, useRef, useMemo, useEffect } from 'react'
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

const DETAIL_LEVELS = [170, 130, 90, 50, 15] // 5 steps covering sparse → dense

// Animation phases (seconds):
// 0–25   : wireframe builds from empty → full detail
// 25–50  : wireframe fades out, textured solid fades in
// 50–65  : textured solid fades out, wireframe fades back in
// 65–80  : wireframe fades from full detail → empty
const PHASE_WIRE_BUILD = 25
const PHASE_SOLID_IN = 50
const PHASE_SOLID_OUT = 65
const PHASE_WIRE_OUT = 80
const TOTAL_CYCLE_SECONDS = PHASE_WIRE_OUT

function RigWireframe() {
  const { scene } = useRigModel()

  // Shared uniform that drives the fragment-dissolve in every solid material
  const solidProgressUniform = useRef({ value: 0 })

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
    const t = state.clock.getElapsedTime()
    const cycle = t % TOTAL_CYCLE_SECONDS

    let wireMasterOpacity  // 0..1 multiplier on all wireframe levels
    let wireLODProgress    // 0..1 feeding into the level crossfade
    let solidOpacity       // 0..1 on textured meshes

    if (cycle < PHASE_WIRE_BUILD) {
      // 0-25s: wireframe builds up
      const p = cycle / PHASE_WIRE_BUILD
      wireMasterOpacity = 1
      wireLODProgress = p
      solidOpacity = 0
    } else if (cycle < PHASE_SOLID_IN) {
      // 25-50s: wireframe fades out, solid fades in (full detail wireframe still resolved)
      const p = (cycle - PHASE_WIRE_BUILD) / (PHASE_SOLID_IN - PHASE_WIRE_BUILD)
      wireMasterOpacity = 1 - p
      wireLODProgress = 1
      solidOpacity = p
    } else if (cycle < PHASE_SOLID_OUT) {
      // 50-65s: solid fades out, wireframe fades back in (at full detail)
      const p = (cycle - PHASE_SOLID_IN) / (PHASE_SOLID_OUT - PHASE_SOLID_IN)
      wireMasterOpacity = p
      wireLODProgress = 1
      solidOpacity = 1 - p
    } else {
      // 65-80s: wireframe disassembles back to nothing (level-by-level)
      const p = (cycle - PHASE_SOLID_OUT) / (PHASE_WIRE_OUT - PHASE_SOLID_OUT)
      wireMasterOpacity = 1
      wireLODProgress = 1 - p
      solidOpacity = 0
    }

    // Apply wireframe level crossfade × master opacity
    const N = DETAIL_LEVELS.length
    const step = 1 / N
    levelMaterials.forEach((mat, i) => {
      const peak = (i + 1) * step
      const dist = Math.abs(wireLODProgress - peak)
      const levelAlpha = Math.max(0, 1 - dist / step)
      mat.opacity = levelAlpha * WIRE_OPACITY * wireMasterOpacity
    })

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
    const count = 18
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

    const IN_START = 18
    const IN_END = 38
    const OUT_START = 55
    const OUT_END = 75

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
        <sprite key={i} ref={el => (refs.current[i] = el)}>
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
    const count = 16
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

    // Opacity curve: invisible during wireframe-only phases, fades in during
    // solid-in (25→50s), fades out during solid-out (50→65s).
    let opacity = 0
    if (cycle >= PHASE_WIRE_BUILD && cycle < PHASE_SOLID_IN) {
      opacity = (cycle - PHASE_WIRE_BUILD) / (PHASE_SOLID_IN - PHASE_WIRE_BUILD)
    } else if (cycle >= PHASE_SOLID_IN && cycle < PHASE_SOLID_OUT) {
      opacity = 1 - (cycle - PHASE_SOLID_IN) / (PHASE_SOLID_OUT - PHASE_SOLID_IN)
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
        gl={{ alpha: true, antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0 }}
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

        <Suspense fallback={null}>
          <SkyDome sunPosition={sunPosition} />
          <Ocean sunPosition={sunPosition} />
          <SkyClouds />
          <RigWireframe />
          <Birds />
        </Suspense>
      </Canvas>

      {/* Bottom haze — fades close water into the page's white canvas */}
      <div className="absolute bottom-6 left-0 right-0 h-40 bg-gradient-to-t from-white via-white/25 to-transparent pointer-events-none" />

      {/* Attribution — one-line bar sitting below the canvas area */}
      <div className="absolute bottom-0 left-0 right-0 h-6 flex items-center justify-end px-2 bg-white whitespace-nowrap">
        <div className="font-mono text-[9px] tracking-[0.1em] uppercase text-bp-dark-grey opacity-70 flex items-center">
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
  )
}
