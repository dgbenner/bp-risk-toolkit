import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import * as THREE from 'three'

function HeliosLogo() {
  const baseUrl = import.meta.env.BASE_URL || '/'
  const url = `${baseUrl}bp_helios.svg`.replace(/\/+/g, '/')
  const svgData = useLoader(SVGLoader, url)
  const groupRef = useRef()

  const geometries = useMemo(() => {
    const list = []
    const BODY_DEPTH = 16
    svgData.paths.forEach((path, i) => {
      const fill = path.userData?.style?.fill || path.color?.getStyle() || '#007F00'
      const darkFill = '#' + new THREE.Color(fill).multiplyScalar(0.35).getHexString()
      SVGLoader.createShapes(path).forEach((shape, j) => {
        if (i === 0) {
          // Outermost layer = the coin's solid body (real 3D extrusion).
          const geom = new THREE.ExtrudeGeometry(shape, {
            depth: BODY_DEPTH,
            bevelEnabled: false,
          })
          list.push({ geom, key: `body-${j}`, color: fill, darkColor: darkFill, hasSideWall: true })
        } else {
          // Inner layers = flat 2D "decals" on both faces of the coin body.
          const frontGeom = new THREE.ShapeGeometry(shape)
          frontGeom.translate(0, 0, BODY_DEPTH + i * 0.15)
          list.push({ geom: frontGeom, key: `front-${i}-${j}`, color: fill })

          const backGeom = new THREE.ShapeGeometry(shape)
          backGeom.translate(0, 0, -i * 0.15)
          list.push({ geom: backGeom, key: `back-${i}-${j}`, color: fill })
        }
      })
    })
    // Center combined XYZ bbox so rotation pivots around the true 3D center
    // of the coin, not an off-axis origin that would swing it through space.
    const tempGroup = new THREE.Group()
    list.forEach(({ geom }) => tempGroup.add(new THREE.Mesh(geom)))
    const box = new THREE.Box3().setFromObject(tempGroup)
    const center = new THREE.Vector3()
    box.getCenter(center)
    list.forEach(({ geom }) => geom.translate(-center.x, -center.y, -center.z))
    return list
  }, [svgData])

  useFrame((state) => {
    if (!groupRef.current) return
    // Continuous full rotation — one head-to-tails-and-back loop per 12 seconds.
    const t = state.clock.getElapsedTime()
    groupRef.current.rotation.y = (t * Math.PI * 2) / 12
  })

  // SVG Y is top-down; flip Y to match Three.js convention. Scale 0.4 fits the
  // 211×215 SVG into ~85 world units so the default camera frames it nicely.
  return (
    <group ref={groupRef} scale={[0.4, -0.4, 0.4]}>
      {geometries.map(({ geom, key, color, darkColor, hasSideWall }) => (
        hasSideWall ? (
          <mesh key={key} geometry={geom}>
            {/* Coin body: material-0 = face caps, material-1 = dark side wall */}
            <meshBasicMaterial attach="material-0" color={color} toneMapped={false} side={THREE.DoubleSide} />
            <meshBasicMaterial attach="material-1" color={darkColor} toneMapped={false} side={THREE.DoubleSide} />
          </mesh>
        ) : (
          <mesh key={key} geometry={geom}>
            <meshBasicMaterial color={color} toneMapped={false} side={THREE.DoubleSide} />
          </mesh>
        )
      ))}
    </group>
  )
}

export default function BpHelios3D({ size = 140, className = '', style = {} }) {
  return (
    <div style={{ width: size, height: size, ...style }} className={className}>
      <Canvas
        orthographic
        camera={{ position: [0, 0, 200], zoom: 0.6, near: 0.1, far: 1000 }}
        gl={{ alpha: true, antialias: true, logarithmicDepthBuffer: true }}
        style={{ background: 'transparent' }}
      >
        {/* MeshBasicMaterial ignores lights — colors render as-authored. */}
        <Suspense fallback={null}>
          <HeliosLogo />
        </Suspense>
      </Canvas>
    </div>
  )
}
