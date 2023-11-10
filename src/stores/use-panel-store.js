/* eslint-disable no-param-reassign */
import { createZustandStore } from './util'

const STATUS = ['open', 'minimized', 'closed']
const EDIT_PANEL_STATUS = ['SF/LF', 'Details', 'Proposal']

const usePanelStore = createZustandStore(
  (set) => ({
    floorplanDrawer: 'open',
    proposalDrawer: 'closed',
    overviewPopup: 'closed',
    productDrawer: 'closed',
    detailsDrawer: 'closed',
    panaromaViewer: 'open',
    educationPopup: 'closed',
    calendarPopup: 'closed',
    iframePopup: 'closed',
    museumMode: 'closed',
    showGui: false,
    editPanelStatus: EDIT_PANEL_STATUS[0],

    setEditPanelStatus: (status) => {
      set((state) => {
        if (EDIT_PANEL_STATUS.includes(status)) {
          state.editPanelStatus = status
        }
      })
    },

    setPanaromaViewer: (status) => {
      set((state) => {
        if (STATUS.includes(status)) {
          state.panaromaViewer = status
        }
      })
    },

    setFloorplanDrawer: (status) => {
      set((state) => {
        if (STATUS.includes(status)) {
          state.floorplanDrawer = status
        }
      })
    },

    setProposalDrawer: (status) => {
      set((state) => {
        if (STATUS.includes(status)) {
          state.proposalDrawer = status
        }
      })
    },

    setOverviewPopup: (status) => {
      set((state) => {
        // minimized is not supported
        if (status !== 'open') state.overviewPopup = 'closed'
        else state.overviewPopup = 'open'
      })
    },

    setEducationPopup: (status) => {
      set((state) => {
        // minimized is not supported
        if (status !== 'open') state.educationPopup = 'closed'
        else state.educationPopup = 'open'
      })
    },

    setCalendarPopup: (status) => {
      set((state) => {
        // minimized is not supported
        if (status !== 'open') state.calendarPopup = 'closed'
        else state.calendarPopup = 'open'
      })
    },

    setIframePopup: (status) => {
      set((state) => {
        // minimized is not supported
        if (status !== 'open') state.iframePopup = 'closed'
        else state.iframePopup = 'open'
      })
    },

    setProductDrawer: (status) => {
      set((state) => {
        if (STATUS.includes(status)) {
          state.productDrawer = status
        }
      })
    },

    setDetailsDrawer: (status) => {
      set((state) => {
        if (STATUS.includes(status)) {
          state.detailsDrawer = status
        }
      })
    },

    setMuseumMode: (status) => {
      set((state) => {
        if (STATUS.includes(status)) {
          state.museumMode = status
          state.showGui = status === 'open' ? true : false
        }
      })
    },

    visible: {
      leftSideFirstDrawer: true,
      leftSideSecondDrawer: true,
      rightSideFirstDrawer: false,
      rightSideSecondDrawer: false,
    },
    minimize: {
      leftSideFirstDrawer: false,
      leftSideSecondDrawer: true,
      rightSideFirstDrawer: false,
      rightSideSecondDrawer: false,
    },

    setStatus: (panel, operation, status) => {
      set((state) => {
        state[operation][panel] = status
      })
    },
  }),
  'panels'
)

export { usePanelStore }
