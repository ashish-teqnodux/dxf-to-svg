/* eslint-disable no-param-reassign */
import { createZustandStore } from './util'

const useSpinner = createZustandStore(
  (set) => ({
    loading: {}, // { filedataLoading: true, floorplanLoading: true, ...}

    setLoadingStarted: (key) => {
      set((state) => {
        state.loading[key] = true
      })
    },

    setLoadingEnded: (key) => {
      set((state) => {
        state.loading[key] = false
      })
    },
  }),
  'spinner'
)

export { useSpinner }
