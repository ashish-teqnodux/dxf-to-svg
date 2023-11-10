/* eslint-disable no-param-reassign */
import { createZustandStore } from './util'

const useTorchData = createZustandStore(
  (set) => ({
    angle: 0,
    setAngle: (value) => {
      set((state) => {
        state.angle = value
      })
    },
  }),
  'useTorchData'
)

export { useTorchData }
