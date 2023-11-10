/* eslint-disable no-param-reassign */
import { createZustandStore } from './util'

const useCredentials = createZustandStore(
  (set) => ({
    accessToken: null,

    setCredentials: (data) => {
      set((state) => {
        state.access_token = data.access_token
        state.api_domain = data.api_domain
        state.expires_in = data.expires_in
        state.scope = data.scope
        state.token_type = data.token_type
      })
    },
  }),
  'Credentials'
)

export { useCredentials }
