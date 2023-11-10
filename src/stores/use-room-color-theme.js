/* eslint-disable no-param-reassign */
import { createZustandStore } from './util'

const RoomThemes = [
  {
    key: 'theme1',
    label: 'Theme 1',
    selectColor: 'wheat',
    highlightColor: 'wheat',
    roomColors: {
      kitchen: '#CBFEFB',
      pantry: '#CBFEFB',
      storage: '#CBFEFB',
      dining: '#CDEE81',
      lobby: '#e0e0e0',
      recreation: '#e0e0e0',
      living: '#B79C66',
      bed: '#B79C66',
    },
  },
  {
    key: 'theme2',
    label: 'Theme 2',
    selectColor: 'wheat',
    highlightColor: 'wheat',
    roomColors: {
      kitchen: '#e0e0e0',
      pantry: '#e0e0e0',
      storage: '#e0e0e0',

      dining: '#B79C66',

      lobby: '#CDEE81',
      recreation: '#CDEE81',

      living: '#B79C66',
      bed: '#B79C66',
    },
  },
  {
    key: 'theme3',
    label: 'Theme 3',
    selectColor: 'wheat',
    highlightColor: 'wheat',
    roomColors: {
      kitchen: '#EFD43B',
      pantry: '#EFD43B',
      storage: '#EFD43B',

      dining: '#EC147E',

      lobby: '#e0e0e0',
      recreation: '#e0e0e0',

      living: '#8EC930',
      bed: '#B79C66',
    },
  },
]

const useRoomColorTheme = createZustandStore(
  (set) => ({
    roomThemes: RoomThemes,

    activeColorThemeKey: RoomThemes[0].key,
    activeColorTheme: RoomThemes[0],

    setActiveColorTheme: (key) => {
      set((state) => {
        state.activeColorThemeKey = key
        state.activeColorTheme = RoomThemes.filter((item) => item.key === key)?.[0]
      })
    },
  }),
  'RoomColorThemes'
)

export { useRoomColorTheme }
