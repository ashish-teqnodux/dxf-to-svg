/* eslint-disable no-param-reassign */
import React from 'react'

function useDimensionEffects(props) {
  const { entities } = props
  const dimensionsLfDataRef = React.useRef(null)

  const makeLFVisible = React.useCallback(() => {
    const { elements, values } = dimensionsLfDataRef.current || {}
    elements?.forEach((element, index) => {
      element.innerHTML = values[index]
    })
  }, [])

  const makeSFVisible = React.useCallback(() => {
    const elements = []
    const values = []

    entities?.forEach((entity) => {
      entity.traverse((item) => {
        if (item?.userData?.dimensions?.width && item?.userData?.dimensions?.height) {
          if (item?.node?.children) {
            const children = item?.node?.children
            const element = children[children.length - 1] // last element is dimension
            elements.push(element)
            values.push(element.innerHTML)
            element.innerHTML = item.userData.dimensions.area?.toFixed(1) || ''
            if (element.innerHTML) element.innerHTML = `${element.innerHTML} SF`
          }
        }
      })
    })
    if (!dimensionsLfDataRef.current) {
      // once
      dimensionsLfDataRef.current = {
        elements,
        values,
      }
    }
  }, [entities])

  const makeInvisible = React.useCallback(() => {
    const elements = []
    const values = []

    entities?.forEach((entity) => {
      entity.traverse((item) => {
        if (item?.userData?.dimensions?.width && item?.userData?.dimensions?.height) {
          if (item?.node?.children) {
            const children = item?.node?.children
            const element = children[children.length - 1]
            elements.push(element)
            values.push(element.innerHTML)
            element.innerHTML = ''
          }
        }
      })
    })
    if (!dimensionsLfDataRef.current) {
      // once
      dimensionsLfDataRef.current = {
        elements,
        values,
      }
    }
  }, [entities])

  // Restore the element when unmount
  React.useEffect(() => makeLFVisible, [makeLFVisible])

  const effects = React.useCallback(
    (mode) => {
      if (!mode) makeInvisible()
      else if (mode === 'SF') makeSFVisible()
      else makeLFVisible()
    },
    [makeInvisible, makeLFVisible, makeSFVisible]
  )

  return effects
}

export { useDimensionEffects }
