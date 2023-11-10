import React from 'react'
import * as THREE from 'three'
import { useFloorplanData } from '../stores'

const useBox = (props) => {
  const { box: boxIn } = props || {}
  const bounds = useFloorplanData((state) => state.bounds)

  const box = React.useMemo(() => {
    if (boxIn) {
      return boxIn
    }
    return bounds
  }, [bounds, boxIn])

  const result = React.useMemo(() => {
    if (!box) return {}
    const size = box.getSize(new THREE.Vector3())
    const sphere = new THREE.Sphere()
    box.getBoundingSphere(sphere)
    const center = box.getCenter(new THREE.Vector3())

    return { size, center, box, sphere }
  }, [box])

  return result
}
export { useBox }
