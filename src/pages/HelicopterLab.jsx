import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import * as THREE from 'three'

const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/')

// BP brand palette — the only colors you'll use. Click one, then click a
// segment on the helicopter.
const PALETTE = [
  { name: 'White',          hex: '#FFFFFF' },
  { name: 'BP Green',       hex: '#007F00' },
  { name: 'BP Dark Green',  hex: '#004F00' },
  { name: 'BP Light Green', hex: '#99CC00' },
  { name: 'BP Yellow',      hex: '#FFE600' },
  { name: 'Yellow-Orange',  hex: '#FF9900' },
  { name: 'BP Dark Blue',   hex: '#000099' },
  { name: 'Silver',         hex: '#999999' },
  { name: 'Dark Grey',      hex: '#666666' },
  { name: 'Black',          hex: '#111111' },
]

function useHelicopterModel() {
  const baseUrl = import.meta.env.BASE_URL || '/'
  const url = `${baseUrl}helicopter.glb`.replace(/\/+/g, '/')
  return useLoader(GLTFLoader, url, loader => loader.setDRACOLoader(dracoLoader))
}

function addRotorTipColors(geom, tipHex) {
  const pos = geom.attributes.position
  geom.computeBoundingSphere()
  const { center, radius } = geom.boundingSphere
  const count = pos.count
  const colors = new Float32Array(count * 3)
  const tip = new THREE.Color(tipHex)
  for (let i = 0; i < count; i++) {
    const dx = pos.getX(i) - center.x
    const dy = pos.getY(i) - center.y
    const dz = pos.getZ(i) - center.z
    const d = Math.sqrt(dx * dx + dy * dy + dz * dz)
    const t = Math.min(1, d / (radius || 1))
    const mix = t > 0.7 ? (t - 0.7) / 0.3 : 0
    colors[i * 3] = 1 + (tip.r - 1) * mix
    colors[i * 3 + 1] = 1 + (tip.g - 1) * mix
    colors[i * 3 + 2] = 1 + (tip.b - 1) * mix
  }
  geom.setAttribute('color', new THREE.BufferAttribute(colors, 3))
}

function HelicopterModel({
  meshColors,
  rotorTipColor,
  rotorsSpinning,
  selectedMesh,
  onMeshesDetected,
  onMeshClick,
}) {
  const { scene } = useHelicopterModel()
  const mainRotorRef = useRef(null)
  const tailRotorRef = useRef(null)

  const model = useMemo(() => {
    const cloned = scene.clone(true)
    const meshes = []
    cloned.traverse(obj => {
      if (obj.isMesh) meshes.push(obj.name)
    })

    let mainRotor = null
    let tailRotor = null
    cloned.traverse(obj => {
      const n = (obj.name || '').toLowerCase()
      if (!tailRotor && n.includes('chopchop_back')) tailRotor = obj
    })
    cloned.traverse(obj => {
      if (obj === tailRotor) return
      const n = (obj.name || '').toLowerCase()
      if (!mainRotor && n.includes('chopchop_top')) mainRotor = obj
    })
    mainRotorRef.current = mainRotor
    tailRotorRef.current = tailRotor

    onMeshesDetected(meshes)
    return cloned
  }, [scene])

  useEffect(() => {
    model.traverse(child => {
      if (!child.isMesh) return
      const parentName = (child.parent?.name || '').toLowerCase()
      const isRotor = parentName.includes('chopchop')
      if (isRotor) {
        addRotorTipColors(child.geometry, rotorTipColor)
        child.material = new THREE.MeshBasicMaterial({ vertexColors: true })
      } else {
        const base = meshColors[child.name] || '#FFFFFF'
        // Selected mesh gets a bright cyan outline-y color so it's obvious
        const isSelected = child.name === selectedMesh
        child.material = new THREE.MeshBasicMaterial({
          color: isSelected ? '#00E5FF' : base,
        })
      }
    })
  }, [model, meshColors, rotorTipColor, selectedMesh])

  useFrame((_, delta) => {
    if (!rotorsSpinning) return
    if (mainRotorRef.current) mainRotorRef.current.rotation.y += delta * 10 * Math.PI * 2
    if (tailRotorRef.current) tailRotorRef.current.rotation.x += delta * 14 * Math.PI * 2
  })

  return (
    <primitive
      object={model}
      scale={0.5}
      onClick={e => {
        e.stopPropagation()
        const name = e.object?.name
        if (!name) return
        const parentName = (e.object.parent?.name || '').toLowerCase()
        if (parentName.includes('chopchop')) return // rotors handled separately
        onMeshClick(name)
      }}
    />
  )
}

function Swatch({ hex, selected, onClick, size = 36, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title || hex}
      style={{
        width: size,
        height: size,
        backgroundColor: hex,
        border: selected ? '3px solid #000' : '1px solid #bbb',
        cursor: 'pointer',
        flexShrink: 0,
      }}
    />
  )
}

export default function HelicopterLab() {
  const [meshes, setMeshes] = useState([])
  const [meshColors, setMeshColors] = useState({})
  const [rotorTipColor, setRotorTipColor] = useState('#FFE600')
  const [rotorsSpinning, setRotorsSpinning] = useState(true)
  const [activePaint, setActivePaint] = useState('#007F00')
  const [selectedMesh, setSelectedMesh] = useState(null)
  const [hasInitialized, setHasInitialized] = useState(false)

  const bodyMeshes = meshes.filter(m => !m.toLowerCase().includes('chopchop'))

  // Auto-paint rainbow on first load so mesh boundaries are instantly visible.
  useEffect(() => {
    if (hasInitialized || bodyMeshes.length === 0) return
    const next = {}
    bodyMeshes.forEach((m, i) => {
      const hue = (i / bodyMeshes.length) * 360
      const c = new THREE.Color().setHSL(hue / 360, 0.75, 0.55)
      next[m] = '#' + c.getHexString().toUpperCase()
    })
    setMeshColors(next)
    setHasInitialized(true)
  }, [bodyMeshes, hasInitialized])

  const paintSelected = hex => {
    if (!selectedMesh) return
    setMeshColors(prev => ({ ...prev, [selectedMesh]: hex }))
  }

  const handleMeshClick = name => {
    setSelectedMesh(prev => (prev === name ? null : name))
  }

  const paintAll = hex => {
    setMeshColors(prev => {
      const next = { ...prev }
      bodyMeshes.forEach(m => { next[m] = hex })
      return next
    })
  }

  const resetRainbow = () => {
    const next = {}
    bodyMeshes.forEach((m, i) => {
      const hue = (i / bodyMeshes.length) * 360
      const c = new THREE.Color().setHSL(hue / 360, 0.75, 0.55)
      next[m] = '#' + c.getHexString().toUpperCase()
    })
    setMeshColors(next)
    setSelectedMesh(null)
  }

  const dumpConfig = () => {
    const config = { meshColors, rotorTipColor }
    const json = JSON.stringify(config, null, 2)
    // eslint-disable-next-line no-console
    console.log('Helicopter config:\n' + json)
    navigator.clipboard?.writeText(json)
  }

  return (
    <div className="min-h-screen flex bg-white">
      <div className="flex-1 h-screen relative">
        <Canvas
          camera={{ position: [8, 5, 10], fov: 45 }}
          gl={{ antialias: true }}
          style={{ background: '#ffffff' }}
        >
          <axesHelper args={[5]} />
          <gridHelper args={[20, 20, '#888', '#ddd']} />
          <OrbitControls enablePan enableZoom enableRotate makeDefault />
          <Suspense fallback={null}>
            <HelicopterModel
              meshColors={meshColors}
              rotorTipColor={rotorTipColor}
              rotorsSpinning={rotorsSpinning}
              selectedMesh={selectedMesh}
              onMeshesDetected={setMeshes}
              onMeshClick={handleMeshClick}
            />
          </Suspense>
        </Canvas>

        {/* On-canvas instructions */}
        <div className="absolute top-3 left-3 bg-white/95 border border-gray-300 shadow-sm px-3 py-2 font-mono text-[11px] text-bp-dark-grey">
          <div className="font-semibold mb-1">How to paint</div>
          <div>1. Click a colored segment on the helicopter</div>
          <div>2. It turns cyan (selected)</div>
          <div>3. Click a palette color on the right →</div>
        </div>
        <div className="absolute bottom-3 left-3 bg-white/90 px-2 py-1 font-mono text-[11px] text-bp-silver">
          drag to rotate · scroll to zoom
        </div>
      </div>

      <div className="w-[24rem] h-screen overflow-y-auto bg-bp-pale-grey border-l border-gray-300 p-4 font-mono text-[11px]">
        <h1 className="text-base font-semibold mb-3 text-bp-dark-green">Helicopter Lab</h1>

        {/* Currently selected segment */}
        <div className="mb-4 p-3 bg-white border border-gray-300">
          <div className="text-[10px] text-bp-silver uppercase tracking-[0.1em] mb-1">
            Selected segment
          </div>
          <div className="text-[13px] font-semibold text-bp-dark-green">
            {selectedMesh ? selectedMesh : 'None — click a segment on the model'}
          </div>
        </div>

        {/* Palette — click to paint selected segment */}
        <div className="mb-2 text-[10px] text-bp-silver uppercase tracking-[0.1em]">
          Palette · click to paint selected
        </div>
        <div className="grid grid-cols-5 gap-1 mb-4">
          {PALETTE.map(p => (
            <button
              key={p.hex}
              type="button"
              onClick={() => paintSelected(p.hex)}
              disabled={!selectedMesh}
              className="flex flex-col items-center gap-1 p-1 border border-gray-300 hover:border-bp-green disabled:opacity-40 disabled:cursor-not-allowed bg-white"
              title={p.name}
            >
              <span
                style={{ backgroundColor: p.hex, width: 28, height: 28, border: '1px solid #999' }}
              />
              <span className="text-[9px] leading-tight text-center">{p.name}</span>
            </button>
          ))}
        </div>

        <div className="mb-4 pb-4 border-b border-gray-300 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => paintAll('#FFFFFF')}
            className="px-2 py-1 border border-gray-400 hover:bg-white"
          >
            All white
          </button>
          <button
            type="button"
            onClick={resetRainbow}
            className="px-2 py-1 border border-gray-400 hover:bg-white"
          >
            Rainbow ID
          </button>
        </div>

        <div className="mb-2 text-[10px] text-bp-silver uppercase tracking-[0.1em]">
          Rotor tips
        </div>
        <div className="grid grid-cols-5 gap-1 mb-4">
          {PALETTE.map(p => (
            <Swatch
              key={p.hex}
              hex={p.hex}
              selected={rotorTipColor.toUpperCase() === p.hex.toUpperCase()}
              onClick={() => setRotorTipColor(p.hex)}
              title={p.name}
              size={28}
            />
          ))}
        </div>

        <label className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            checked={rotorsSpinning}
            onChange={e => setRotorsSpinning(e.target.checked)}
          />
          <span>Spin rotors</span>
        </label>

        <button
          type="button"
          onClick={dumpConfig}
          className="w-full px-3 py-2 bg-bp-green text-white hover:bg-bp-dark-green"
        >
          Copy config (console + clipboard)
        </button>

        <div className="mt-3 text-[10px] text-bp-silver">
          When the livery looks right, hit Copy and paste the JSON back to me.
        </div>
      </div>
    </div>
  )
}
