/* eslint-disable no-param-reassign */
import { createZustandStore } from './util'

const useInteractionData = createZustandStore(
  (set) => ({
    activeHotspotId: null,
    activeRoomId: null,
    activeRoomName: '',
    hoveredHotspotId: null,
    hoveredRoomId: null,
    selectedTransitionId: null,
    selectedStaircaseId: null,
    previewStatus: null,

    setActiveHotspotId: (activeHotspotId) =>
      set((state) => {
        if (activeHotspotId) state.activeHotspotId = activeHotspotId
      }),

    setActiveRoomId: (activeRoomId) =>
      set((state) => {
        if (activeRoomId) {
          state.activeRoomId = activeRoomId
        }
      }),

    setActiveRoomName: (name) =>
      set((state) => {
        if (name) {
          state.activeRoomName = name
        }
      }),

    setHoveredHotspotId: (hotspotId) =>
      set((state) => {
        state.hoveredHotspotId = hotspotId
      }),

    setHoveredRoomId: (roomId) =>
      set((state) => {
        state.hoveredRoomId = roomId
      }),

    setSelectedTransitionId: (transitionId) =>
      set((state) => {
        state.selectedTransitionId = transitionId
        if (transitionId) {
          // cannot select both staircase and transition at same time
          state.selectedStaircaseId = null
        }
      }),

    setSelectedStaircaseId: (selectedStaircaseId) =>
      set((state) => {
        state.selectedStaircaseId = selectedStaircaseId
        if (selectedStaircaseId) {
          // cannot select both staircase and transition at same time
          state.selectedTransitionId = null
        }
      }),

    setPreviewStatus: (status) => {
      set((state) => {
        state.previewStatus = !!status
      })
    },
  }),
  'InteractionData'
)

export { useInteractionData }
