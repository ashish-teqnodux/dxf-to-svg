import React from 'react'
import { useFileData } from '../../hooks/use-file-data'
import { useFloorplanData } from '../../stores'

const PREDEFINED_LEVELS = [
  { id: 'basement', label: 'basement', disabled: true },
  { id: 'floor1', label: 'floor 1', disabled: true },
  { id: 'floor2', label: 'floor 2', disabled: true },
  { id: 'floor3', label: 'floor 3', disabled: true },
]

function LevelSelector() {
  const setActiveLevel = useFloorplanData((state) => state.setActiveLevel)

  const fileData = useFileData()
  const allLevels = fileData?.levels
  const length = allLevels?.length

  console.log(allLevels, 'allLevels-')

  const levels = React.useMemo(() => {
    if (allLevels) {
      return PREDEFINED_LEVELS.map((item) => {
        const found = allLevels?.find((l) => l?.label?.toLowerCase() === item.label)
        if (found) {
          return found
        }
        return { ...item }
      })
    }
    return PREDEFINED_LEVELS
  }, [allLevels])

  // Auto select the first level on mount
  React.useEffect(() => {
    if (length) {
      let found = null
      levels.some((level) => {
        if (!level.disabled) found = level
        return !!found
      })
      setActiveLevel(found?.id, levels)
    }
  }, [levels, length, setActiveLevel])

  return null
}

export { LevelSelector }
