/* eslint-disable no-param-reassign */
import React from 'react'
import { SvgText } from './svg-text'

function useRoomLabelsEffects(props) {
  const { entities } = props
  const [labelsData, setLabelsData] = React.useState(null)
  const labelsDataRef = React.useRef(null)
  const [dimensionType, setDimensionType] = React.useState(null)

  const isRoomObject = React.useCallback((object) => object?.parent?.name === 'rooms', [])

  React.useLayoutEffect(() => {
    labelsDataRef.current = labelsData
  }, [labelsData])

  const makeDefaultVisible = React.useCallback(() => {
    const data = labelsDataRef.current || []
    data?.forEach((d) => {
      d?.originals?.forEach((item) => {
        item.element.innerHTML = item.text
      })
    })
    // clear
    setLabelsData(null)
  }, [])

  const makeDefaultInvisible = React.useCallback(() => {
    const data = []

    entities?.forEach((entity) => {
      console.log(entity, 'entity-')
      entity.traverse((item) => {
        if (isRoomObject(item)) {
          const hasDimensions =
            item?.userData?.dimensions?.width && item?.userData?.dimensions?.height
          if (item?.userData?.label || hasDimensions) {
            if (item?.node?.children) {
              const { children } = item.node
              const numChildren = children.length
              // first element is filled polygon so skip
              // second element is label
              // last element is dimension
              const obj = {
                box: item?.userData.box,
                originals: [],
                label: '',
                SF: '',
                LF: '',
                hasDimensions,
                position: null,
              }
              for (let index = 1; index < numChildren; index += 1) {
                const element = children[index]
                const position = item.userData.siblingsPosition?.[index] || item.userData.position
                if (!obj.position) obj.position = position?.clone()

                const isDimension = index === numChildren - 1 && hasDimensions
                if (isDimension) {
                  obj.SF = `${item.userData.dimensions.area?.toFixed(1) || ''} SF`
                  obj.LF = element.innerHTML
                } else {
                  obj.label = obj.label ? `${obj.label} ${element.innerHTML}` : element.innerHTML
                }
                obj.originals.push({
                  element,
                  text: element.innerHTML,
                })
                // invisible
                element.innerHTML = ''
              }
              if (obj.originals.length) data.push(obj)
            }
          }
        }
      })
    })
    if (!labelsDataRef.current) {
      // once
      labelsDataRef.current = data
      setLabelsData(data)
    }
  }, [entities, isRoomObject])

  // Restore the element when unmount
  React.useEffect(() => makeDefaultVisible, [makeDefaultVisible])

  const effects = React.useCallback(
    (defaultVisible, dimensions) => {
      if (defaultVisible) {
        makeDefaultVisible()
      } else {
        makeDefaultInvisible()
        if (dimensions === 'SF') setDimensionType('SF')
        else if (dimensions === 'LF') setDimensionType('LF')
        else setDimensionType(null)
      }
    },
    [makeDefaultInvisible, makeDefaultVisible]
  )

  const labels = React.useCallback(
    (visible) => {
      if (!visible) return null

      return (
        <>
          {' '}
          {labelsData?.map((item) => {
            const textArray = []
            if (item.label) textArray.push(item.label)
            if (dimensionType === 'LF' || dimensionType === 'SF') {
              const dim = item[dimensionType]
              if (dim) textArray.push(dim)
            }
            if (!textArray?.length) return null
            return (
              <SvgText text={textArray} position={item.position} box={item.box} foreignObject />
            )
          })}
        </>
      )
    },
    [dimensionType, labelsData]
  )

  return {
    effects,
    labels,
  }
}

export { useRoomLabelsEffects }
