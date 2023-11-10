/* eslint-disable no-param-reassign */
import { createZustandStore } from './util'

const useProjectSchedule = createZustandStore(
  (set, get) => ({
    needsReloading: true,
    setNeedsReloading: (status) => {
      set((state) => {
        state.needsReloading = !!status
      })
    },

    isLoading: false,
    setIsLoading: (status) => {
      set((state) => {
        state.isLoading = !!status
      })
    },

    lastLoadingError: '',
    setLastLoadingError: (error) => {
      set((state) => {
        state.lastLoadingError = error || ''
      })
    },

    projectSchedule: null,
    projectScheduleVersion: 1,
    setProjectSchedule: (data) => {
      set((state) => {
        state.projectSchedule = data
        state.projectScheduleVersion = get().projectScheduleVersion + 1
      })
    },

    startDate: '',
    setStartDate: (dateString) => {
      set((state) => {
        state.startDate = dateString || ''
      })
    },

    workableWeekend: false,
    setWorkableWeekend: (workableWeekend) => {
      set((state) => {
        state.workableWeekend = !!workableWeekend
      })
    },

    allow3CoatsPerDay: false,
    setAllow3CoatsPerDay: (allow3CoatsPerDay) => {
      set((state) => {
        state.allow3CoatsPerDay = !!allow3CoatsPerDay
      })
    },
  }),
  'ProjectSchedule'
)

export { useProjectSchedule }
