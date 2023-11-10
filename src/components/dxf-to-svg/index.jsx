/* eslint-disable no-nested-ternary */
import React from 'react'
import { usePanelStore } from '../../stores'
import { FloorplanDrawer } from './floorplan-drawer'
import { Constants } from '../../utils'

const contentStyle = {
  textAlign: 'center',
  minHeight: 120,
  lineHeight: '120px',
  color: '#fff',
  backgroundColor: Constants.BACKGROUND_COLOR,
  padding: Constants.CANVAS_PADDING,
  overflow: 'hidden',
  position: 'relative',
}

function DxfToSvg() {
  const floorplanDrawerStatus = usePanelStore((state) => state.floorplanDrawer)

  return (
    <div style={contentStyle} className="content-container">
      <FloorplanDrawer status={floorplanDrawerStatus} />
    </div>
  )
}

export { DxfToSvg }
