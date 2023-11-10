/* eslint-disable no-param-reassign */

import React from 'react'
import { useDragDropStore } from '../stores'

const useDragDropDroppedOn = (props) => {
  const { onDrop } = props
  const { item, clearAll } = useDragDropStore()

  const onMouseDragOver = React.useCallback(
    (args) => {
      const { dragging } = useDragDropStore.getState()
      if (dragging && item && onDrop) {
        onDrop({ object: args, item })
      }
      clearAll()
    },
    [clearAll, item, onDrop]
  )

  const bindDroppedOn = React.useCallback((args) => onMouseDragOver(args), [onMouseDragOver])

  return bindDroppedOn
}

export { useDragDropDroppedOn }
