/* eslint-disable no-param-reassign */
import React from 'react'
import { useThree } from '@react-three/fiber'
// import THREEx from './dom-events'
import { useInteractionData } from '../../stores'
import { UserData } from '../../utils/user-data'
import { useSvgNodeEffects } from './use-svg-node-effects'

function useStaircaseEffects(props) {
  const { entities, selectColor = 'wheat' } = props
  const { gl } = useThree()
  const domElement = React.useMemo(() => gl?.domElement, [gl?.domElement])

  const lastModifiedColorObjectIdRef = React.useRef()
  const setSelectedStaircaseId = useInteractionData((state) => state.setSelectedStaircaseId)
  const selectedStaircaseId = useInteractionData((state) => state.selectedStaircaseId)

  const parentStaircase = React.useMemo(() => {
    let found = null
    entities?.some((entity) => {
      entity?.children?.forEach((item) => {
        if (item?.name === 'staircases') found = item
        return !!found
      })
      return !!found
    })
    return found
  }, [entities])

  const isStaircaseObject = React.useCallback((object) => object?.parent?.name === 'staircases', [])

  const makeVisible = React.useCallback(() => {
    if (parentStaircase) {
      parentStaircase.visible = true
    }
  }, [parentStaircase])

  const makeInvisible = React.useCallback(() => {
    if (parentStaircase) parentStaircase.visible = false
  }, [parentStaircase])

  // Restore the element when unmount
  React.useEffect(() => makeVisible, [makeVisible])

  const getObjectById = React.useCallback(
    (id) => {
      let found = null
      if (id) {
        entities?.some((entity) => {
          entity.children?.some((child) => {
            if (child?.name === 'staircase') {
              // found = child
              child.children?.some((grandChild) => {
                if (UserData.getRefId(grandChild) === id) {
                  found = grandChild
                }
                return !!found
              })
            }
            return !!found
          })
          return !!found
        })
      }
      return found
    },
    [entities]
  )

  const updateColor = React.useCallback((entity, newColor) => {
    entity?.node?.childNodes?.forEach?.((child) => {
      child?.childNodes?.forEach?.((grandChild) => {
        const fillColor = newColor || entity?.userData?.style?.fillColor
        if (fillColor) {
          grandChild?.setAttributeNS(null, 'fill', fillColor)
        }
        const lineColor = newColor || entity?.userData?.style?.lineColor
        if (lineColor) {
          grandChild?.setAttributeNS(null, 'stroke', lineColor)
        }
      })
    })
  }, [])

  const updateColors = React.useCallback(() => {
    if (lastModifiedColorObjectIdRef.current !== selectedStaircaseId) {
      // deselected object
      updateColor(getObjectById(lastModifiedColorObjectIdRef.current), null)
      lastModifiedColorObjectIdRef.current = null
    }
    entities?.forEach((entity) => {
      entity.traverse((child) => {
        if (!isStaircaseObject(child)) return
        const id = UserData.getRefId(child)
        const isSelected = selectedStaircaseId === id
        updateColor(child, isSelected ? selectColor : null)
        if (isSelected) lastModifiedColorObjectIdRef.current = selectedStaircaseId
      })
    })
  }, [entities, getObjectById, isStaircaseObject, selectColor, selectedStaircaseId, updateColor])

  const onClick = React.useCallback(
    (object) => {
      if (isStaircaseObject(object)) {
        const id = UserData.getRefId(object)
        if (id) {
          if (useInteractionData.getState().selectedStaircaseId === id) {
            setSelectedStaircaseId(null)
          } else {
            // select
            setSelectedStaircaseId(id)
          }
        }
      }
    },
    [isStaircaseObject, setSelectedStaircaseId]
  )

  const onPointerEnter = React.useCallback(
    (object) => {
      if (isStaircaseObject(object)) {
        const style = domElement?.style
        if (style) style.cursor = 'pointer'
        updateColor(object, selectColor)
      }
    },
    [domElement?.style, isStaircaseObject, selectColor, updateColor]
  )

  const onPointerLeave = React.useCallback(
    (object) => {
      if (isStaircaseObject(object)) {
        const style = domElement?.style
        if (style) style.cursor = 'default'

        const id = UserData.getRefId(object)
        if (id && useInteractionData.getState().selectedStaircaseId === id) {
          // select object
          updateColor(object, selectColor)
        } else {
          updateColor(object, null)
        }
      }
    },
    [domElement?.style, isStaircaseObject, selectColor, updateColor]
  )

  const binder = useSvgNodeEffects({
    entities,
    onClick,
    onPointerEnter,
    onPointerLeave,
    qualifyNode: isStaircaseObject,
  })

  // keep colors of room up-to-date
  React.useLayoutEffect(() => {
    updateColors()
  }, [updateColors])

  const effects = React.useCallback(
    (visible) => {
      if (!visible) {
        makeInvisible()
      } else {
        makeVisible()
      }
      binder(visible)
    },
    [binder, makeInvisible, makeVisible]
  )

  return effects
}

export { useStaircaseEffects }
