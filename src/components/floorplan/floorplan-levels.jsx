/* eslint-disable react/no-array-index-key */
/* eslint-disable react/jsx-no-useless-fragment */
import React from 'react'
import PropTypes from 'prop-types'
import 'three'
import { useFloorplanData } from '../../stores'
import { FloorplanEntities } from './floorplan-entities'
import { useFileData } from '../../hooks/use-file-data'

function FloorplanLevels(props) {
  const { onLoad, dimensions, transitions } = props
  const fileData = useFileData()
  const { levels } = fileData || {}

  const activeLevelId = useFloorplanData((state) => state.activeLevelId)

  const entities = React.useMemo(() => {
    if (!levels) return null
    return levels.map((level) => {
      const id = level?.id
      if (!id) return null
      return (
        <FloorplanEntities
          key={level.id}
          id={level.id}
          onLoad={onLoad}
          name={level.label}
          visible={level.id === activeLevelId}
          dimensions={dimensions}
          transitions={transitions}
        />
      )
    })
  }, [activeLevelId, dimensions, levels, onLoad, transitions])

  if (!activeLevelId) return null
  return <group name="floorplan">{entities}</group>
}

FloorplanLevels.propTypes = {
  onLoad: PropTypes.func,
  dimensions: PropTypes.oneOf(['SF', 'LF', '']),
  transitions: PropTypes.bool,
}

FloorplanLevels.defaultProps = {
  onLoad: () => {},
  dimensions: true,
  transitions: true,
}

export { FloorplanLevels }
