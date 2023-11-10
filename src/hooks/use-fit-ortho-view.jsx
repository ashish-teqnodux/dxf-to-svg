import React from 'react'
// import * as THREE from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useBox } from './use-box'

function useFitOrthoView(props) {
  const { scalar, box, animate } = props || {}
  const { controls, camera, size: canvasSize, invalidate } = useThree()

  const aspect = React.useMemo(() => {
    if (!canvasSize) return null
    const { width, height } = canvasSize
    if (width && height) return width / height
    return null
  }, [canvasSize])

  const { size, center, sphere } = useBox({ box })

  const updateCameraConfig = React.useCallback(
    (config) => {
      const { position, target, near, far, left, right, top, bottom, zoom, animate } = config || {}
      if (controls && camera && position && target) {
        if (near) camera.near = near
        if (camera.far < far) camera.far = far
        if (position) {
          if (animate) {
            // camera.position.lerp(new THREE.Vector3(...position), 0.1)
            camera.position.set(...position)
          } else {
            camera.position.set(...position)
          }
        }
        if (zoom) camera.zoom = zoom
        if (left) camera.left = left
        if (right) camera.right = right
        if (top) camera.top = top
        if (bottom) camera.bottom = bottom
        if (target) {
          if (animate) {
            // controls.target.lerp(new THREE.Vector3(...target), 0.1)
            controls.target.set(...target)
          } else {
            controls.target.set(...target)
          }
        }
        camera.updateProjectionMatrix()
        controls.update()
      }
    },
    [camera, controls]
  )

  const resetCameraView = React.useCallback(() => {
    if (center && size) {
      // decreasing size whe drawer minimized
      const sizeIn = scalar ? { x: size.x * scalar, y: size.y * scalar, z: size.z * scalar } : size
      // Add margin - Leave some space
      const MARGIN_FACTOR = 1.05
      const max = Math.max(sizeIn.x, sizeIn.y, sizeIn.z) * MARGIN_FACTOR
      const { x, y, z } = center
      const position = [x, y, max * 10 + z]
      const target = [x, y, z]
      const far = 10 * Math.max(Math.abs(position[0]), Math.abs(position[1]), Math.abs(position[2]))

      const config = {
        position,
        target,
        far,
        animate,
      }

      const height = sizeIn.x * MARGIN_FACTOR
      const width = height * aspect

      config.left = x - width / 2
      config.right = x + width / 2
      config.top = y + height / 2
      config.bottom = y - height / 2
      const enableSphere = true
      if (sphere && enableSphere) {
        const min = Math.min(width, height)
        config.zoom = (min * 0.6) / sphere.radius
      } else {
        config.zoom = 1
      }
      updateCameraConfig(config)
    }
  }, [animate, aspect, center, scalar, size, sphere, updateCameraConfig])

  const refreshCameraView = React.useCallback(() => {
    resetCameraView()
    invalidate()
  }, [invalidate, resetCameraView])
  return refreshCameraView
}

export { useFitOrthoView }
