/* eslint-disable no-param-reassign */
import React from 'react'

function useSvgNodeEffects(props) {
  const {
    entities,
    onClick,
    onDoubleClick,
    onPointerEnter,
    onPointerLeave,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDrop,
    qualifyNode,
  } = props

  const bindCallbacksToSvgNodes = React.useCallback(
    (object, unbind) => {
      if (!object) return
      if (!object.isSVGObject) {
        object.children?.forEach((obj) => bindCallbacksToSvgNodes(obj, unbind))
      } else if (object.node && qualifyNode?.(object)) {
        if (onPointerEnter)
          object.node.onmouseenter = unbind ? null : (...args) => onPointerEnter(object, ...args)
        if (onPointerLeave)
          object.node.onmouseleave = unbind ? null : (...args) => onPointerLeave(object, ...args)
        if (onClick) object.node.onclick = unbind ? null : (...args) => onClick(object, ...args)
        // if (onDoubleClick)
        //   object.node.ondblclick = unbind ? null : (...args) => onDoubleClick(object, ...args)
        if (onDragEnter)
          object.node.ondragenter = unbind ? null : (...args) => onDragEnter(object, ...args)
        if (onDragLeave)
          object.node.ondragleave = unbind ? null : (...args) => onDragLeave(object, ...args)
        if (onDragOver)
          object.node.ondragover = unbind ? null : (...args) => onDragOver(object, ...args)
        if (onDrop) object.node.ondrop = unbind ? null : (...args) => onDrop(object, ...args)
      }
    },
    [
      qualifyNode,
      onPointerEnter,
      onPointerLeave,
      onClick,
      onDoubleClick,
      onDragEnter,
      onDragLeave,
      onDragOver,
      onDrop,
    ]
  )

  const bind = React.useCallback(() => {
    entities?.forEach((object) => bindCallbacksToSvgNodes(object, false))
  }, [bindCallbacksToSvgNodes, entities])

  const unbind = React.useCallback(() => {
    entities?.forEach((object) => bindCallbacksToSvgNodes(object, true))
  }, [bindCallbacksToSvgNodes, entities])

  const effects = React.useCallback(
    (visible) => {
      if (visible) bind()
      return unbind
    },
    [bind, unbind]
  )

  return effects
}

export { useSvgNodeEffects }
