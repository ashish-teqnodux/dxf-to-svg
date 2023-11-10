/* eslint-disable no-param-reassign */
import { createZustandStore } from './util'

const DEFAULT_PHASE = 'Phase 1'
const useProductSelections = createZustandStore(
  (set, get) => ({
    phasesData: {
      // { phaseId: [room1, room2, ...] }
      [DEFAULT_PHASE]: [],
      'Phase 2': [],
      'Phase 3': [],
      // 'Phase 4': [],
      NOT_IN_SCOPE: [],
    },
    isInitialized: false,
    activePhaseId: DEFAULT_PHASE,

    allProductSelections: {}, // { roomId: [productId] } of all phases
    productSelections: {}, // { roomId: [productId] } of active phases

    initializeAllPhases: (allLevels) => {
      const allRooms = []
      allLevels?.forEach((level) => {
        if (level) {
          const { curatedRoomData } = level
          curatedRoomData.forEach((room) => {
            allRooms.push(room)
          })
        }
      })
      set((state) => {
        state.phasesData[DEFAULT_PHASE] = allRooms
        state.activePhaseId = DEFAULT_PHASE
        state.isInitialized = true
      })
    },

    setRoomsPhase: (roomIds, phaseId) => {
      const existingPhasesData = get().phasesData
      const phasesKeys = Object.keys(existingPhasesData)
      // deep copy
      const newPhasesData = { ...existingPhasesData }
      phasesKeys.forEach((currentPhaseId) => {
        newPhasesData[currentPhaseId] = [...(newPhasesData[currentPhaseId] || [])]
      })

      roomIds?.forEach((roomId) => {
        phasesKeys.some((currentPhaseId) => {
          let newRooms = newPhasesData[currentPhaseId]
          let found = false
          newRooms.some((room, index) => {
            if (room && room.refId === roomId) {
              // found
              if (phaseId === currentPhaseId) {
                //  no changes needed
              } else {
                // update now
                // Remove from existing phase
                newRooms = [
                  ...newRooms.slice(0, index),
                  ...newRooms.slice(index + 1, newRooms.length),
                ]
                newPhasesData[currentPhaseId] = newRooms
                // Add to new phase
                newPhasesData[phaseId].push(room)
              }
              // stop all the loops
              found = true
              return found
            }
            return found
          })
          return found
        })
      })

      set((state) => {
        state.phasesData = newPhasesData
      })
    },

    setActivePhase: (phaseId) => {
      set((state) => {
        if (phaseId) {
          state.activePhaseId = phaseId
          const { phasesData, allPhasesProposalData, allProductSelections } = get()
          const rooms = phasesData?.[phaseId] || []

          // filter product selection for rooms in active phase
          const productSelections = {}
          rooms.forEach((room) => {
            const roomId = room.refId
            const selections = allProductSelections?.[roomId]
            if (selections) productSelections[roomId] = selections
          })
          state.productSelections = productSelections

          // filter proposal data for rooms in active phase
          state.proposalData = allPhasesProposalData[phaseId]
        }
      })
    },

    updateProductSelection: (roomId, productId, deselectAllowed = true) => {
      set((state) => {
        if (productId) {
          const selections = get().allProductSelections[roomId] || []
          const idx = selections.indexOf(productId)
          const isAlreadySelected = idx > -1
          if (isAlreadySelected) {
            // deselect
            if (deselectAllowed) {
              state.allProductSelections[roomId] = [
                ...selections.slice(0, idx),
                ...selections.slice(idx + 1, selections.length),
              ]
            }
          } else {
            // select
            state.allProductSelections[roomId] = [...selections, productId]
          }
        } else {
          // clear all
          const selections = { ...get().allProductSelections }
          delete selections[roomId]
          state.allProductSelections = selections
        }
      })

      // Next, sync active product selections as well
      const { phasesData, activePhaseId, allProductSelections } = get()
      if (phasesData?.[activePhaseId]?.map((room) => room.refId)?.includes(roomId)) {
        const selections = allProductSelections[roomId]
        set((state) => {
          if (selections) state.productSelections[roomId] = selections
          else {
            const selections = { ...get().productSelections }
            delete selections[roomId]
            state.productSelections = selections
          }
          state.proposalDataNeedsUpdate = true
        })
      }
    },

    excludeRoomItems: false,
    setExcludeRoomItems: (value) => {
      set((state) => {
        state.excludeRoomItems = !!value
      })
    },

    allPhasesProposalData: {}, // proposal for the all phases
    proposalDataNeedsUpdate: false,
    proposalData: null, // proposal { productId: { product, [rooms], quantity, amount, unit } } for the active phase
    setProposalData: (data) => {
      set((state) => {
        state.proposalData = data
        state.allPhasesProposalData[get().activePhaseId] = data
      })
    },

    setProposalDataNeedsUpdate: (value) => {
      set((state) => {
        state.proposalDataNeedsUpdate = !!value
      })
    },

    discloureOptions: [
      { key: 't1', label: 'Pets', text:'The customer will ensure that pets remain off the floor during the project and the dry times required for the project. While not required, it is always recommended that customers refinishing their floors choose Loba Supra 2K Water Based Heavy Commercial Grade Polyurethane' },
      { key: 't2', label: 'Stain Samples', text:'It was discussed that stain samples can be shown at the beginning of the project so the customer can see on their wood in their own lighting.' },
      { key: 't3', label: 'Moldings', text:'All moldings will be installed primed white in color. Most customers choose to have the moldings caulked and painted after the conclusion of the project.' },
      { key: 't4', label: 'Loose Items', text:'The customer will ensure that all loose items are completely cleared prior the start of the project.' },
      { key: 't5', label: 'Customer Material', text:'The customer will be providing all material for the project which included all accessories. The customer is responsible for ensuring that enough material is on site for the work. Additionally, if there are any shortages that lead to delays in the project, there would be additional charges as a result. Whenever the customer provides the material directly, the standard warranties provided would no longer apply.' },
      { key: 't6', label: 'Matching Floors', text:'KASA Renovation will work to get as close a match as possible to existing flooring, but cannot guarantee the closeness of the match. Even when exact products and processes are used there can be variations from wear and tear, UV etc.' },
    ],
    selectedDisclosureKeys: [], // keys
    setSelectedDisclosureKeys: (keys) => {
      set((state) => {
        state.selectedDisclosureKeys = keys
      })
    },
    disclosureNotes: '',
    notes: '',
    setDisclosureNotes: (text) => {
      set((state) => {
        state.disclosureNotes = text
      })
    },
    setNotes: (text) => {
      set((state) => {
        state.notes = text
      })
    },
    termsConditions: '',
    setTermsConditions: (selected) => {
      set((state) => {
        state.termsConditions = selected
      })
    },

    paymentTermsOptions: [
      {
        key: '$500 deposit, balance to be paid 1 day after the project is complete',
        label: '$500 Deposit',
      }, // zoho key
      {
        key: '$500 upfront deposit, 50% deposit prior to delivery of material, balance to be paid upon project completion (check/cash)',
        label: '$500 Deposit w/ 50% Material',
      },
      {
        key: '50% deposit, balance to be paid 1 day after the project is complete',
        label: '50% Deposit',
      },
    ],
    selectedPaymentTermsKeys: '',
    setSelectedPaymentTermsKeys: (selected) => {
      set((state) => {
        state.selectedPaymentTermsKeys = selected
      })
    },
  }),
  'ProductSelections'
)

export { useProductSelections }
