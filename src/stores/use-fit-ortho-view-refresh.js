/* eslint-disable no-param-reassign */
import { createZustandStore } from './util'

const useFitOrthoViewRefresh = createZustandStore(
  (set) => ({
    needsRefresh: true,
    setNeedsRefresh: (value) => {
      set((state) => {
        state.needsRefresh = value
      })
    },
  }),
  'FitOrthoViewRefresh'
)

export { useFitOrthoViewRefresh }
