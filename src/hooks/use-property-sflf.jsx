import React from 'react'
import { useProductSelections } from '../stores'
import { useFileData } from './use-file-data'

function usePropertySfLf() {
  const [data, setData] = React.useState([])
  const fileData = useFileData()
  const { levels } = fileData || {}
  const excludeRoomItems = useProductSelections((state) => state.excludeRoomItems)

  const isValidRoom = React.useCallback((room) => {
    if (!room) return false
    const { label, dimensions } = room
    if (!label || !dimensions) return false
    const { width, height } = dimensions
    if (!width || !height) return false
    return true
  }, [])

  const floatToInch = React.useCallback((number) => {
    const separated = number.toFixed(2).toString().split('.')
    const pointToInch = Math.round(`.${separated[1]}` * 12)
    return [separated[0], pointToInch]
  }, [])

  const createTitle = React.useCallback(
    (label, dimension) => {
      const { width, height, area, unit } = dimension
      if (unit === 'imperial') {
        const widthparted = floatToInch(width)
        const heightparted = floatToInch(height)
        return `${label} ${widthparted[0]}'${widthparted[1]}'' x ${heightparted[0]}'${
          heightparted[1]
        }'' || ${area?.toFixed(1)} sq ft`
      }
      return `${label} ${width.toFixed(1)} m x ${height.toFixed(1)} m || ${area.toFixed(1)} sq m `
    },
    [floatToInch]
  )

  const getTreeItem = React.useCallback(
    (room) => {
      const { label, dimensions } = room || {}
      const { width, height } = dimensions || {}

      let newTitle = label || 'Untitled'
      if (width && height) {
        newTitle = createTitle(newTitle, dimensions)
      }
      return {
        key: room.refId,
        id: room.refId,
        roomId: room.refId,
        parent: room.parent,
        dimensions,
        title: newTitle,
        refId: room.refId,
        label,
      }
    },
    [createTitle]
  )

  const getTreeFromAllLevels = React.useCallback(() => {
    const treeData = []
    levels?.forEach((level) => {
      const item = getTreeItem({ label: level.label, refId: level.id, parent: null })
      treeData.push(item)
      if (level.curatedRoomData.length) {
        const { curatedRoomData } = level
        curatedRoomData.forEach((room) => {
          if (isValidRoom(room)) {
            // label, dimensions, refId, parent
            const item = getTreeItem({ ...room, parent: level.id })
            treeData.push(item)
          }
        })
      }
    })
    return treeData
  }, [getTreeItem, isValidRoom, levels])

  const createDataTree = (dataset) => {
    const hashTable = Object.create(null)
    // eslint-disable-next-line no-return-assign
    dataset?.forEach((aData) => (hashTable[aData.id] = { ...aData, children: [] }))
    const dataTree = []
    dataset?.forEach((aData) => {
      if (aData?.parent) {
        const obj = hashTable[aData.parent]
        obj?.children?.push(hashTable[aData.id])

        if (!obj.dimensions) {
          obj.dimensions = {
            area: 0,
            netArea: 0,
            perimeter: 0,
            netPerimeter: 0,
          }
        }
        const hashDim = hashTable[aData.id]?.dimensions
        if (hashDim) {
          obj.dimensions.area = (obj.dimensions.area || 0) + (hashDim.area || 0)
          obj.dimensions.netArea = (obj.dimensions.netArea || 0) + (hashDim.netArea || 0)
          obj.dimensions.perimeter = (obj.dimensions.area || 0) + (hashDim.perimeter || 0)
          obj.dimensions.netPerimeter = (obj.dimensions.area || 0) + (hashDim.netPerimeter || 0)
        }
      } else dataTree.push(hashTable[aData.id])
    })
    return dataTree
  }

  React.useEffect(() => {
    const data = getTreeFromAllLevels() || []
    const treeData = createDataTree(data)
    setData(treeData)
  }, [getTreeFromAllLevels])

  const getTotal = React.useCallback(() => {
    const totalArea = data.reduce((acc, cur) => acc + cur.dimensions.area, 0).toFixed(0)
    const totalNetArea = data.reduce((acc, cur) => acc + cur.dimensions.netArea, 0).toFixed(0)
    const totalPerimeter = data.reduce((acc, cur) => acc + cur.dimensions.perimeter, 0).toFixed(0)
    const totalNetPerimeter = data
      .reduce((acc, cur) => acc + cur.dimensions.netPerimeter, 0)
      .toFixed(0)
    return { totalArea, totalNetArea, totalNetPerimeter, totalPerimeter }
  }, [data])

  const getEntireProjectTitle = React.useCallback(() => {
    const { totalArea, totalNetArea, totalNetPerimeter, totalPerimeter } = getTotal()
    if (!excludeRoomItems) return `Entire Project ${totalArea}SF/${totalPerimeter}LF`
    return `Entire Project ${totalNetArea}SF/${totalNetPerimeter}LF`
  }, [excludeRoomItems, getTotal])

  return { data, getTotal, getEntireProjectTitle }
}

export { usePropertySfLf }
