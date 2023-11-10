/* eslint-disable no-param-reassign */

import React from 'react'
import { createRoot } from 'react-dom/client'
import PropTypes from 'prop-types'
import { AiOutlineMenu } from 'react-icons/ai'
import { useDrag } from '@use-gesture/react'
import { useDragDropStore } from '../stores'
import { Constants } from '../utils/constants'

const POINTER_CLASS = 'pointer'
const DELAY_STOP = 300
const CARDS_WIDTH = '350px'

const DRAG_ICON_STYLE = {
  fontSize: '20px',
  color: 'white',
  marginRight: '9px',
  marginLeft: '2px',
  minWidth: '30px',
  // marginTop: '2px',
}

function RenderIconOnTiltCard({ title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'left' }}>
      <AiOutlineMenu style={DRAG_ICON_STYLE} />
      <p style={{ margin: '0' }}> {title} </p>
    </div>
  )
}

RenderIconOnTiltCard.propTypes = {
  title: PropTypes.string,
}

RenderIconOnTiltCard.defaultProps = {
  title: '',
}

const useDragDropItem = (props) => {
  const { gestureLib } = props || {}
  const { setItem, setDragging } = useDragDropStore()
  const pointerRef = React.useRef({})

  React.useEffect(() => {
    const checkPointer = document.getElementsByClassName(POINTER_CLASS)
    if (checkPointer.length === 0) {
      const pointer = document.createElement('div')
      pointer.classList.add(POINTER_CLASS)

      pointer.style.position = 'absolute'
      pointer.style.height = '50px'
      pointer.style.width = '60px'
      pointer.style.left = '0px'
      pointer.style.top = '0px'
      pointer.style.zIndex = '10000'
      //
      pointer.style.cursor = 'grabbing'
      pointer.style.backgroundRepeat = 'no-repeat'
      pointer.style.backgroundPosition = 'center'
      pointer.style.backgroundSize = '50px 50px'
      pointer.style.transform = 'rotate(-45deg)'

      pointer.style.backgroundColor = `${Constants.PRIMARY_COLOR}`
      pointer.style.color = 'white'
      // pointer.style.fontSize = '5px'
      pointer.style.width = CARDS_WIDTH
      pointer.style.height = 'max-content'
      pointer.style.borderRadius = '.5rem'
      pointer.style.padding = '10px'
      pointer.style.display = 'none'
      //
      document.body.appendChild(pointer)
      pointerRef.current = pointer
    }
    if (!pointerRef.current) {
      // eslint-disable-next-line prefer-destructuring
      pointerRef.current = checkPointer[0]
    }
  }, [])

  const changeMouseStyle = React.useCallback((state) => {
    const { mouseX: x, mouseY: y, hidden } = state
    const pointer = document.getElementsByClassName(POINTER_CLASS)[0]
    pointerRef.current = pointer
    pointerRef.current.style.left = `${x - 2}px`
    pointerRef.current.style.top = `${y - 100}px`
    pointerRef.current.style.display = hidden
  }, [])

  const changeMouseText = React.useCallback((property) => {
    const pointer = document.getElementsByClassName(POINTER_CLASS)[0]
    pointerRef.current = pointer

    if (pointer) {
      const root = createRoot(pointer)
      root.render(<RenderIconOnTiltCard title={property.title} />)
    }
  }, [])

  const onDragStart = React.useCallback(
    (state) => {
      const {
        args: [p],
        target,
      } = state
      // Make the default drag pointer invisible
      if (target?.style) {
        target.style.opacity = 0
      }

      setDragging(true)
      setItem(p)
      changeMouseText(p)
    },
    [changeMouseText, setDragging, setItem]
  )

  const onDragProgress = React.useCallback(
    (state) => {
      const {
        xy,
        clientX,
        clientY,
        args: [q],
      } = state
      const mouseX = xy ? xy[0] : clientX
      const mouseY = xy ? xy[1] : clientY
      // avoid corner problem
      if (mouseX && mouseY) {
        changeMouseStyle({ mouseX, mouseY, hidden: 'grid', property: q })
      }
    },
    [changeMouseStyle]
  )

  const onDragStop = React.useCallback(
    (state) => {
      const {
        xy,
        target,
        clientX,
        clientY,
        args: [p],
      } = state
      const mouseX = xy ? xy[0] : clientX
      const mouseY = xy ? xy[1] : clientY
      changeMouseStyle({ mouseX, mouseY, hidden: 'none', property: p })

      // Restore visiblity of span
      if (target?.style) {
        target.style.opacity = 1
      }
      setTimeout(() => setDragging(false), DELAY_STOP)
    },
    [changeMouseStyle, setDragging]
  )

  const draggingCallback = React.useCallback(
    (state) => {
      const { down } = state
      const { dragging } = useDragDropStore.getState()
      if (dragging) {
        if (!down) {
          // just stopped
          onDragStop(state)
        } else {
          // dragging progress
          onDragProgress(state)
        }
      } else if (down) {
        // start dragging
        onDragStart(state)
      }
    },
    [onDragProgress, onDragStart, onDragStop]
  )

  const bindDropable = useDrag(draggingCallback, { threshold: 40 })

  const bindDropableHtml = React.useCallback(
    (item) => {
      const args = [item]
      return {
        draggable: true,
        onDragStart: (event) => onDragStart({ ...event, args }),
        onDrag: (event) => onDragProgress({ ...event, args }),
        onDragEnd: (event) => onDragStop({ ...event, args }),
      }
    },
    [onDragProgress, onDragStart, onDragStop]
  )

  return gestureLib ? bindDropable : bindDropableHtml
}

export { useDragDropItem }
