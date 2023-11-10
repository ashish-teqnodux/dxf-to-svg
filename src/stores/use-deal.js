/* eslint-disable no-param-reassign */
import { createZustandStore } from './util'

const useDeal = createZustandStore(
  (set) => ({
    dealId: null, // '448375000000262168', // TODO: the main input
    setDealId: (id) => {
      set((state) => {
        state.dealId = id
      })
    },

    deal: null,
    setDeal: (data) => {
      set((state) => {
        state.deal = data
      })
    },
  }),
  'Deal'
)

export { useDeal }
