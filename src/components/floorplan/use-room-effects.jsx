/* eslint-disable no-param-reassign */
/* eslint-disable react/no-array-index-key */
import React from 'react'
import { useThree } from '@react-three/fiber'
import { UserData } from '../../utils/user-data'
import {
  useFloorplanData,
  useInteractionData,
  useProductSelections,
  useRoomColorTheme,
} from '../../stores'
import { useDragDropDroppedOn } from '../../hooks/use-drag-drop-dropped-on'
import { useSvgNodeEffects } from './use-svg-node-effects'

function useRoomEffects(props) {
  const { entities } = props

  const { gl } = useThree()

  const colorTheme = useRoomColorTheme((state) => state.activeColorTheme)
  const { selectColor, highlightColor, roomColors } = colorTheme || {}

  const updateProductSelection = useProductSelections((state) => state.updateProductSelection)
  const setFocusBounds = useFloorplanData((state) => state.setFocusBounds)
  const activeRoomId = useInteractionData((state) => state.activeRoomId)
  const hoveredRoomId = useInteractionData((state) => state.hoveredRoomId)
  const setActiveRoomName = useInteractionData((state) => state.setActiveRoomName)

  const roomsData = useFloorplanData((state) => state.curatedRoomData)
  // const hotspotsData = useFloorplanData((state) => state.curatedHotspotData)
  const setActiveHotspotId = useInteractionData((state) => state.setActiveHotspotId)
  const setActiveRoomId = useInteractionData((state) => state.setActiveRoomId)
  const setHoveredRoomId = useInteractionData((state) => state.setHoveredRoomId)
  const setHoveredHotspotId = useInteractionData((state) => state.setHoveredHotspotId)
  const isRoomObject = React.useCallback((object) => object?.parent?.name === 'rooms', [])

  const getRoomByIdRef = React.useRef(null)
  const getRoomById = React.useCallback((id) => roomsData.find((x) => x.refId === id), [roomsData])
  React.useLayoutEffect(() => {
    getRoomByIdRef.current = getRoomById
  }, [getRoomById])
  const getHotspotByRoomIdRef = React.useRef(null)
  const getHotspotByRoomId = React.useCallback(
    (id) => {
      const room = getRoomById(id)
      return room?.hotspots?.[0]
    },
    [getRoomById]
  )
  React.useLayoutEffect(() => {
    getHotspotByRoomIdRef.current = getHotspotByRoomId
  }, [getHotspotByRoomId])

  const onDropCallback = React.useCallback(
    (state) => {
      const { object: roomId, item: product } = state || {}
      if (!product?.id && !roomId) return
      updateProductSelection(roomId, product.id, false)
    },
    [updateProductSelection]
  )

  const onDropped = useDragDropDroppedOn({ onDrop: onDropCallback })

  const onSelect = React.useCallback(
    (id) => {
      const hotspot = getHotspotByRoomIdRef.current?.(id)
      if (hotspot) {
        setActiveHotspotId(hotspot.id)
        setActiveRoomId(hotspot.roomId)
      }
    },
    [setActiveHotspotId, setActiveRoomId]
  )

  const onHovered = React.useCallback(
    (id) => {
      const hotspot = getHotspotByRoomIdRef.current?.(id)
      setHoveredHotspotId(hotspot?.id)
      setHoveredRoomId(hotspot?.roomId)
    },
    [setHoveredHotspotId, setHoveredRoomId]
  )

  const changeRoomColor = React.useCallback((entity, newColor) => {
    const polygon = entity?.node?.children?.[0]
    if (!polygon) return

    const color = newColor || entity?.userData?.style?.fillColor
    if (color) {
      polygon?.setAttributeNS(null, 'fill', color)
    }
  }, [])

  // Handle hover, active, select, none room colors
  const updateColors = React.useCallback(() => {
    entities?.forEach((object) => {
      object.traverse((entity) => {
        if (!isRoomObject(entity)) return

        const isActiveRoom = activeRoomId === entity.userData.refId
        const isHoveredRoom = hoveredRoomId === entity.userData.refId
        if (isActiveRoom) {
          // Set the room name - used as display label
          setActiveRoomName(entity.name)
        }
        let color = null
        if (isActiveRoom) color = selectColor
        else if (isHoveredRoom) color = highlightColor
        else if (roomColors) {
          const roomName = entity.name?.toLowerCase() || ''
          console.log(roomName, 'roomName-');
          const names = Object.keys(roomColors)
          const key = names.filter((name) => roomName.includes(name))?.[0]
          color = roomColors[key] || null
        }
        changeRoomColor(entity, color)
      })
    })
  }, [
    activeRoomId,
    changeRoomColor,
    entities,
    highlightColor,
    hoveredRoomId,
    isRoomObject,
    selectColor,
    setActiveRoomName,
    roomColors,
  ])

  const domElement = React.useMemo(() => gl.domElement, [gl.domElement])

  // BIND events
  const onClick = React.useCallback(
    (object) => {
      if (isRoomObject(object)) {
        const id = UserData.getRefId(object)
        if (id) onSelect(id)
      }
    },
    [isRoomObject, onSelect]
  )

  // BIND events
  // const onDoubleClick = React.useCallback(
  //   (object) => {
  //     if (isRoomObject(object)) {
  //       const id = UserData.getRefId(object)
  //       if (id) {
  //         onSelect(id)
  //         setFocusBounds(object.userData?.box)
  //       }
  //     }
  //   },
  //   [isRoomObject, onSelect, setFocusBounds]
  // )

  const onPointerEnter = React.useCallback(
    (object) => {
      if (isRoomObject(object)) {
        const style = domElement?.style
        if (style) style.cursor = 'pointer'

        const id = UserData.getRefId(object)
        if (id) {
          onHovered(id)
        }
      }
    },
    [domElement?.style, isRoomObject, onHovered]
  )

  const onPointerLeave = React.useCallback(
    (object) => {
      if (isRoomObject(object)) {
        const style = domElement?.style
        if (style) style.cursor = 'default'
        onHovered(null)
      }
    },
    [domElement?.style, isRoomObject, onHovered]
  )

  const onDragEnter = React.useCallback(
    (object) => {
      if (isRoomObject(object)) {
        const id = UserData.getRefId(object)
        if (id) {
          onHovered(id)
        }
      }
    },
    [isRoomObject, onHovered]
  )
  const onDragOver = React.useCallback(
    (object, event) => {
      if (isRoomObject(object)) {
        event.preventDefault()
      }
    },
    [isRoomObject]
  )

  const onDragLeave = React.useCallback(
    (object) => {
      if (isRoomObject(object)) {
        onHovered(null)
      }
    },
    [isRoomObject, onHovered]
  )

  const onDrop = React.useCallback(
    (object) => {
      if (isRoomObject(object)) {
        const id = UserData.getRefId(object)
        if (id) {
          onDropped(id)
        }
      }
    },
    [isRoomObject, onDropped]
  )

  // keep colors of room up-to-date
  React.useLayoutEffect(() => {
    updateColors()
  }, [updateColors])

  return useSvgNodeEffects({
    entities,
    onClick,
    // onDoubleClick,
    onPointerEnter,
    onPointerLeave,
    onDragEnter,
    onDragOver,
    onDragLeave,
    onDrop,
    qualifyNode: isRoomObject,
  })
}

export { useRoomEffects }
