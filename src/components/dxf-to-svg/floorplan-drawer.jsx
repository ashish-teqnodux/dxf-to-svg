import React from 'react'
import PropTypes from 'prop-types'
import { FloorplanViewer } from '../floorplan'
import { LevelSelector } from '../floorplan/level-selector'

function FloorplanDrawer(props) {
  return (
    <div
      style={{
        width: '290px',
        height: '405px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 'auto',
      }}
    >
      <FloorplanViewer
        svgGl
        minimized={false}
        controlEnabled={true}
        dimensions="SF"
        showTransitions={true}
      />

      <LevelSelector />
    </div>
  )
}

FloorplanDrawer.propTypes = {
  status: PropTypes.oneOf(['open', 'closed', 'minimized']),
}

FloorplanDrawer.defaultProps = {
  status: 'open',
}

export { FloorplanDrawer }
