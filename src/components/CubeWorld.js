import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { Preload } from '@react-three/drei'
import * as THREE from 'three'

import { useStore } from '../state/useStore'
import { COLORS } from '../constants'

// THREE components
import Ship from './Ship'
import Ground from './Ground'
import Skybox from './Skybox'
import Cubes from './Cubes'
import Walls from './Walls'
import CubeTunnel from './CubeTunnel'
import Effects from './Effects'

// State/dummy components
import KeyboardControls from './KeyboardControls'
import GameState from './GameState'
import GlobalColor from './GlobalColor'
import Music from './Music'
import Sound from './Sound'

// HTML components
import Overlay from './html/Overlay'
import Hud from './html/Hud'
import GameOverScreen from './html/GameOverScreen'

const NEON_COLORS = [
  { hex: '#ffcc00', three: 0xffcc00 }, // Neon Yellow/Gold
  { hex: '#fe2079', three: 0xff2190 }, // Neon Pink/Magenta
  { hex: '#00f0ff', three: 0x00f0ff }, // Cyber Cyan/Teal
  { hex: '#39ff14', three: 0x39ff14 }, // Neon Lime Green
  { hex: '#ff5e00', three: 0xff5e00 }, // Neon Orange/Red
  { hex: '#a855f7', three: 0xa855f7 }, // Bright Purple/Violet
  { hex: '#ff007f', three: 0xff007f }, // Neon Rose
  { hex: '#00e5ff', three: 0x00e5ff }  // Bright Turquoise
]

const selected = NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)]

if (typeof document !== 'undefined') {
  document.documentElement.style.setProperty('--theme-color', selected.hex)
  document.documentElement.style.setProperty('--theme-glow', selected.hex)
}

COLORS[0].hex = selected.hex
COLORS[0].three = new THREE.Color(selected.three)


export default function CubeWorld({ color, bgColor }) {
  const directionalLight = useStore((s) => s.directionalLight)

  return (
    <>
      <div className="brand-header">SOFTBRIDGE SOLUTIONS</div>
      <div className="brand-footer">Produced by SoftBridge Solutions. All rights reserved.</div>
      <Canvas gl={{ antialias: false, alpha: false }} mode="concurrent" dpr={[1, 1.5]} style={{ background: `${bgColor}` }}>
        <Suspense fallback={null}>
          <GameState />
          <Skybox />
          <directionalLight
            ref={directionalLight}
            intensity={3}
            position={[0, Math.PI, 0]}
          />
          <ambientLight intensity={0.1} />
          <Ship>
            {directionalLight.current && <primitive object={directionalLight.current.target} />}
          </Ship>
          <Walls />
          <Cubes />
          <CubeTunnel />
          <Ground groundColor={bgColor} />
          <KeyboardControls />
          <Effects />
          <GlobalColor />
          <Music />
          <Sound />
          <Preload all />
        </Suspense>
      </Canvas>
      <Hud />
      <GameOverScreen />
      <Overlay />
    </>
  )
}

