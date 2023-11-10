/* eslint-disable no-param-reassign */
import { createZustandStore } from './util'

const useDragDropStore = createZustandStore(
  (set) => ({
    dragging: false,
    item: '', // draggable/dropable item

    setItem: (p) => {
      set((state) => {
        state.item = p
      })
    },

    setDragging: (dragging) => {
      set((state) => {
        state.dragging = !!dragging
      })
      // return null
    },

    clearAll: () => {
      set((state) => {
        state.url = ''
        state.dragging = false
      })
    },
  }),
  'DragDropStore'
)

export { useDragDropStore }
