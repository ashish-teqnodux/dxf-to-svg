/* eslint-disable no-nested-ternary */
import React from 'react'
import { useFileData } from './use-file-data'

const isValidRoom = (room) => {
  if (!room) return false
  const { label, dimensions } = room
  if (!label || !dimensions) return false
  const { width, height } = dimensions
  if (!width || !height) return false
  return true
}

const forEachRoom = (allLevels, callback) => {
  if (!allLevels?.length) return
  allLevels?.forEach((level) => {
    level.curatedRoomData?.forEach((room) => {
      if (isValidRoom(room)) {
        callback(room, level)
      }
    })
  })
}

function useForEachRoom(props) {
  const { data } = props || {}
  const fileDataStore = useFileData()
  const fileData = data || fileDataStore
  const allLevels = fileData?.levels
  const length = allLevels?.length

  const forEachRoomInner = React.useCallback(
    (callback) => {
      if (!length) return
      forEachRoom(allLevels, callback)
    },
    [allLevels, length]
  )

  return forEachRoomInner
}

useForEachRoom.forEachRoom = forEachRoom
useForEachRoom.isValidRoom = isValidRoom

export { useForEachRoom }
