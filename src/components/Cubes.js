import { Object3D, Color } from 'three'
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'

import { CUBE_AMOUNT, CUBE_SIZE, PLANE_SIZE, WALL_RADIUS, LEVEL_SIZE, LEFT_BOUND, RIGHT_BOUND } from '../constants'
import { useStore, mutation } from '../state/useStore'

import randomInRange from '../util/randomInRange'
import distance2D from '../util/distance2D'

const negativeBound = LEFT_BOUND + WALL_RADIUS / 2
const positiveBound = RIGHT_BOUND - WALL_RADIUS / 2

if (window.cubeHueOffset === undefined) {
  window.cubeHueOffset = Math.random()
}

export default function InstancedCubes() {
  const mesh = useRef()
  const material = useRef()

  const ship = useStore(s => s.ship)
  const level = useStore(s => s.level)

  const dummy = useMemo(() => new Object3D(), [])
  const cubes = useMemo(() => {
    // Setup initial cube positions
    const temp = []
    for (let i = 0; i < CUBE_AMOUNT; i++) {
      const x = randomInRange(negativeBound, positiveBound)
      const y = 10
      const z = -900 + randomInRange(-400, 400)

      temp.push({ x, y, z })
    }
    return temp
  }, [])

  const diamondStart = useMemo(() => -(level * PLANE_SIZE * LEVEL_SIZE) - PLANE_SIZE * (LEVEL_SIZE - 2.6), [level])
  const diamondEnd = useMemo(() => -(level * PLANE_SIZE * LEVEL_SIZE) - PLANE_SIZE * (LEVEL_SIZE), [level])

  useFrame((state, delta) => {
    let isOutsideDiamond = false
    if (ship.current) {
      if (ship.current.position.z > diamondStart || ship.current.position.z < diamondEnd) {
        isOutsideDiamond = true
      }
    }

    cubes.forEach((cube, i) => {
      if (ship.current) {
        if (cube.z - ship.current.position.z > -15) { // No need to run the rather expensive distance function if the ship is too far away
          if (cube.x - ship.current.position.x > -15 || cube.x - ship.current.position.x < 15) {
            const distanceToShip = distance2D(ship.current.position.x, ship.current.position.z, cube.x, cube.z)

            if (distanceToShip < 12) {
              mutation.gameSpeed = 0
              mutation.gameOver = true
            }
          }
        }

        if (cube.z - ship.current.position.z > 15) {
          if (isOutsideDiamond) {
            cube.z = ship.current.position.z - PLANE_SIZE + randomInRange(-200, 0)
            cube.y = -CUBE_SIZE
            cube.x = randomInRange(negativeBound, positiveBound)
          } else {
            cube.z = ship.current.position.z - (PLANE_SIZE * 3.1) + randomInRange(-200, 0)
            cube.y = -CUBE_SIZE
            cube.x = randomInRange(negativeBound, positiveBound)
          }
        }

        if (cube.y < CUBE_SIZE / 2) {
          if (cube.y + delta * 100 > CUBE_SIZE / 2) {
            cube.y = CUBE_SIZE / 2
          } else {
            cube.y += delta * 100
          }
        }
      }

      const offset = window.cubeHueOffset !== undefined ? window.cubeHueOffset : 0
      const hue = (offset + state.clock.getElapsedTime() * 0.04) % 1.0
      material.current.color.setHSL(hue, 0.75, 0.5)

      dummy.position.set(
        cube.x,
        cube.y,
        cube.z
      )

      // apply changes to dummy and to the instanced matrix
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i, dummy.matrix)
    })

    // Tells THREE to draw the updated matrix, I guess?
    mesh.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[null, null, CUBE_AMOUNT]}>
      <boxBufferGeometry args={[CUBE_SIZE, CUBE_SIZE, CUBE_SIZE]} />
      <meshStandardMaterial ref={material} color={new Color().setHSL(window.cubeHueOffset, 0.75, 0.5)} roughness={0.5} metalness={0.3} />
    </instancedMesh>
  )
}