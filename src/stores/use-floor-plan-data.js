/* eslint-disable no-param-reassign */
import { createZustandStore } from './util'

const useFloorplanData = createZustandStore(
  (set, get) => ({
    levelIds: [],

    activeLevelId: null, // Id of active level
    activeLevelLabel: '', // Label of active level
    bounds: null, // THREE.Box3 of active level
    focusBounds: null, // THREE.Box3 Bounds for example, of a room to focus (zoom-in) on
    curatedRoomData: [], // room data of active level
    curatedHotspotData: [], // hotspot data of active level

    setFocusBounds: (bounds) => {
      set((state) => {
        state.focusBounds = bounds
      })
    },

    setActiveLevel: (levelId, allLevels) => {
      set((state) => {
        if (!levelId || !allLevels) return

        let index = get().levelIds.indexOf(levelId)
        if (index < 0) {
          // refresh the level ids from allLevesl
          const levelIds = allLevels.map((l) => l.id)
          state.levelIds = levelIds
          index = levelIds.indexOf(levelId)
        }

        const data = allLevels[index]
        if (data) {
          const { curatedHotspotData, curatedRoomData, bounds, label } = data
          state.activeLevelId = levelId
          state.curatedRoomData = curatedRoomData
          state.curatedHotspotData = curatedHotspotData
          state.bounds = bounds
          state.activeLevelLabel = label
        }
      })
    },

    // setDxfData: (manager) => {
    //   const data = manager.toJson()
    //   set((state) => {
    //     if (data) {
    //       const { id: levelId, curatedHotspotData, curatedRoomData, bounds, label } = data

    //       // Keep track of levelIds as well
    //       if (!get().levelIds.includes(levelId)) {
    //         state.levelIds.push(levelId)
    //         state.allLevels.push(data)
    //       }

    //       // Activate first level automatically
    //       if (!state.activeLevelId) {
    //         state.activeLevelId = levelId
    //         state.curatedRoomData = curatedRoomData
    //         state.curatedHotspotData = curatedHotspotData
    //         state.bounds = bounds
    //         state.activeLevelLabel = label
    //       }
    //     }
    //   })
    // },
  }),
  'Floorplan'
)

export { useFloorplanData }
