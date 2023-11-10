/* eslint-disable no-param-reassign */
/* eslint-disable react/no-array-index-key */
import React from 'react'
import { useThree } from '@react-three/fiber'
import { UserData } from '../../utils/user-data'
import { useFloorplanData, useInteractionData } from '../../stores'
import { useSvgNodeEffects } from './use-svg-node-effects'

const HOTSPOT_OBJECT_NAME = 'cameras'

function useHotspotEffects(props) {
  const { entities, selectColor = '#028e08' } = props
  const { gl } = useThree()

  const hotspotsData = useFloorplanData((state) => state.curatedHotspotData)
  const activeHotspotId = useInteractionData((state) => state.activeHotspotId)
  const setActiveHotspotId = useInteractionData((state) => state.setActiveHotspotId)
  const setActiveRoomId = useInteractionData((state) => state.setActiveRoomId)
  const setHoveredRoomId = useInteractionData((state) => state.setHoveredRoomId)
  const setHoveredHotspotId = useInteractionData((state) => state.setHoveredHotspotId)

  const getHotspotByIdRef = React.useRef(null)
  const getHotspotImpl = React.useCallback(
    (id) => hotspotsData.find((x) => x.id === id),
    [hotspotsData]
  )
  React.useLayoutEffect(() => {
    getHotspotByIdRef.current = getHotspotImpl
  }, [getHotspotImpl])

  const onSelect = React.useCallback(
    (id) => {
      const hotspot = getHotspotByIdRef.current?.(id)
      setActiveHotspotId(hotspot?.id)
      setActiveRoomId(hotspot?.roomId)
    },
    [setActiveHotspotId, setActiveRoomId]
  )

  const onHovered = React.useCallback(
    (id) => {
      const hotspot = getHotspotByIdRef.current?.(id)
      setHoveredHotspotId(hotspot?.id)
      setHoveredRoomId(hotspot?.roomId)
    },
    [setHoveredHotspotId, setHoveredRoomId]
  )

  const domElement = React.useMemo(() => gl.domElement, [gl.domElement])

  const isHotspotObject = React.useCallback((object) => object?.parent?.name === 'cameras', [])

  const updateColors = React.useCallback(() => {
    if (activeHotspotId && entities) {
      let hotspots
      entities?.[0]?.traverse((entity) => {
        if (entity.getObjectByName(HOTSPOT_OBJECT_NAME)) {
          hotspots = entity
        }
        return null
      })

      hotspots?.traverse((hotspot) => {
        if (hotspot?.userData?.refId === activeHotspotId) {
          if (hotspot.node) {
            // eslint-disable-next-line no-param-reassign
            hotspot.node.children[0].style.fill = selectColor
            hotspot.node.children[0].style.stroke = selectColor
          }
        } else if (hotspot.node) {
          // eslint-disable-next-line no-param-reassign
          hotspot.node.children[0].style.fill = hotspot?.userData?.style?.fillColor
          hotspot.node.children[0].style.stroke = hotspot?.userData?.style?.lineColor
        }
      })
    }
  }, [activeHotspotId, entities, selectColor])

  // BIND hotspot events
  const onClick = React.useCallback(
    (object) => {
      if (isHotspotObject(object)) {
        const id = UserData.getRefId(object)
        if (id) onSelect(id)
      }
    },
    [isHotspotObject, onSelect]
  )

  // BIND hotspot events
  const onPointerEnter = React.useCallback(
    (object) => {
      if (isHotspotObject(object)) {
        const style = domElement?.style
        if (style) style.cursor = 'pointer'

        const id = UserData.getRefId(object)
        if (id) onHovered(id)
      }
    },
    [domElement?.style, isHotspotObject, onHovered]
  )
  // BIND hotspot events
  const onPointerLeave = React.useCallback(
    (object) => {
      if (isHotspotObject(object)) {
        const style = domElement?.style
        if (style) style.cursor = 'default'
        onHovered(null)
      }
    },
    [domElement?.style, isHotspotObject, onHovered]
  )

  // keep colors of hotspots up-to-date
  React.useLayoutEffect(() => {
    updateColors()
  }, [updateColors])

  return useSvgNodeEffects({
    entities,
    onClick,
    onPointerEnter,
    onPointerLeave,
    qualifyNode: isHotspotObject,
  })
}

export { useHotspotEffects }
