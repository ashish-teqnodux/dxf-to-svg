/* eslint-disable no-param-reassign */
import { useThree } from '@react-three/fiber'
import React from 'react'
import { useInteractionData } from '../../stores'
import { UserData } from '../../utils/user-data'
import { useSvgNodeEffects } from './use-svg-node-effects'

function useTransitionEffects(props) {
  const { entities, selectColor = '#800000' } = props
  const { gl } = useThree()
  const domElement = React.useMemo(() => gl?.domElement, [gl?.domElement])

  const lastModifiedColorObjectIdRef = React.useRef()
  const setSelectedTransitionId = useInteractionData((state) => state.setSelectedTransitionId)
  const selectedTransitionId = useInteractionData((state) => state.selectedTransitionId)

  const parentTransition = React.useMemo(() => {
    let found = null
    entities?.some((entity) => {
      entity?.children?.forEach((item) => {
        if (item?.name === 'transitions') found = item
        return !!found
      })
      return !!found
    })
    return found
  }, [entities])

  const isTransitionObject = React.useCallback(
    (object) => object?.parent?.name === 'transitions',
    []
  )

  const makeVisible = React.useCallback(() => {
    if (parentTransition) parentTransition.visible = true
  }, [parentTransition])

  const makeInvisible = React.useCallback(() => {
    if (parentTransition) parentTransition.visible = false
  }, [parentTransition])

  // Restore the element when unmount
  React.useEffect(() => makeVisible, [makeVisible])

  const getObjectById = React.useCallback(
    (id) => {
      let found = null
      if (id) {
        entities?.some((entity) => {
          entity.children?.some((child) => {
            if (child?.name === 'transition') {
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
        const color = newColor || entity?.userData?.style?.lineColor
        if (color) {
          grandChild?.setAttributeNS(null, 'stroke', color)
        }
      })
    })
  }, [])

  const updateColors = React.useCallback(() => {
    if (lastModifiedColorObjectIdRef.current !== selectedTransitionId) {
      // deselected object
      updateColor(getObjectById(lastModifiedColorObjectIdRef.current), null)
      lastModifiedColorObjectIdRef.current = null
    }
    entities?.forEach((entity) => {
      entity.traverse((child) => {
        if (!isTransitionObject(child)) return
        const id = UserData.getRefId(child)
        const isSelected = selectedTransitionId === id
        updateColor(child, isSelected ? selectColor : null)
        if (isSelected) lastModifiedColorObjectIdRef.current = selectedTransitionId
      })
    })
  }, [entities, getObjectById, isTransitionObject, selectColor, selectedTransitionId, updateColor])

  const onClick = React.useCallback(
    (object) => {
      if (isTransitionObject(object)) {
        const id = UserData.getRefId(object)
        if (id) {
          if (useInteractionData.getState().selectedTransitionId === id) {
            // deselect
            setSelectedTransitionId(null)
          } else {
            // select
            setSelectedTransitionId(id)
          }
        }
      }
    },
    [isTransitionObject, setSelectedTransitionId]
  )

  const onPointerEnter = React.useCallback(
    (object) => {
      if (isTransitionObject(object)) {
        const style = domElement?.style
        if (style) style.cursor = 'pointer'

        updateColor(object, selectColor)
      }
    },
    [domElement?.style, isTransitionObject, selectColor, updateColor]
  )

  const onPointerLeave = React.useCallback(
    (object) => {
      if (isTransitionObject(object)) {
        const style = domElement?.style
        if (style) style.cursor = 'default'

        const id = UserData.getRefId(object)
        if (id && useInteractionData.getState().selectedTransitionId === id) {
          // select object
          updateColor(object, selectColor)
        } else {
          updateColor(object, null)
        }
      }
    },
    [domElement?.style, isTransitionObject, selectColor, updateColor]
  )

  const binder = useSvgNodeEffects({
    entities,
    onClick,
    onPointerEnter,
    onPointerLeave,
    qualifyNode: isTransitionObject,
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

export { useTransitionEffects }
