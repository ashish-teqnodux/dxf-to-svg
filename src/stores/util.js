import create from 'zustand'
import { devtools as reduxDevTools } from 'zustand/middleware'
import produce from 'immer'
import Env from '../env'

window.ISDEV = Env.isDev

// eslint-disable-next-line no-unused-vars
const devtools = (store, name) => {
  if (!Env.isDev || !name) {
    return store
  }
  const enabled = true
  return reduxDevTools(store, { name, enabled })
}

const logger = (store, name) => {
  if (!Env.isDev || !name) {
    return store
  }

  return (set, get, api) =>
    store(
      (args) => {
        set(args)
        console.debug(name, get())
      },
      get,
      api
    )
}

const immer = (store) => (set, get, api) => store((args) => set(produce(args)), get, api)

// const createZustandStore = (prototype, name) => create(devtools(immer(prototype), name), name)
const createZustandStore = (prototype, name) => create(logger(immer(prototype), name), name)

export { createZustandStore }
