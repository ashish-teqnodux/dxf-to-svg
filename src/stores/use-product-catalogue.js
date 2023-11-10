/* eslint-disable no-param-reassign */
import { createZustandStore } from './util'
import Env from '../env'

const useProductCatalogue = createZustandStore(
  (set, get) => ({
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

    cvId: Env.zohoCrmProductsCvid, // Hardcorded via env
    setCvId: (id) => {
      set((state) => {
        state.cvid = id
      })
    },

    products: [],
    setProducts: (array) =>
      set((state) => {
        state.products = array || []
      }),

    updateProduct: (productId, key, value) => {
      if (!productId || !key) return
      const { products } = get() || {}
      const index = products?.findIndex((product) => product.id === productId)
      if (index > -1) {
        const product = products[index]
        // nothing changed
        if (product[key] === value) return

        set((state) => {
          state.products = [
            ...products.slice(0, index),
            { ...(products[index] || {}), [key]: value },
            ...products.slice(index + 1, products.length),
          ]
        })
      }
    },
  }),
  'ProductCatalogue'
)

export { useProductCatalogue }
