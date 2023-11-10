import React from 'react'
import PropTypes from 'prop-types'
import 'three'
import { Canvas } from '@react-three/fiber'
import { MapControls } from '@react-three/drei'
import { SVGRenderer } from '../../renderers/SVGRenderer'
import { FitOrthoView } from './fit-ortho-view'
import { useFitOrthoViewRefresh } from '../../stores'
import { FloorplanLevels } from './floorplan-levels'

function FloorplanViewer(props) {
  const { svgGl, minimized: isMinimized, controlEnabled, dimensions, showTransitions } = props

  const { setNeedsRefresh } = useFitOrthoViewRefresh()

  const [rendered, setIsRendered] = React.useState(false)
  const onRenderLevels = React.useCallback((rendered) => {
    setIsRendered(rendered)
  }, [])

  const createRenderer = React.useCallback(
    (canvas) => {
      if (!svgGl) return undefined
      const gl = new SVGRenderer()
      const parent = canvas.parentElement
      console.log(parent, 'gl-')
      // gl.setSize(400, 400)
      // Following is important to set otherwise height will keep increasing to infinite
      gl.domElement.style.width = '100%'
      gl.domElement.style.height = '100%'
      gl.setClearAlpha(0.0)
      parent.appendChild(gl.domElement)
      parent.removeChild(canvas)
      return gl
    },
    [svgGl]
  )

  React.useLayoutEffect(() => {
    if (rendered) {
      setTimeout(() => setNeedsRefresh(true), 200)
    }
  }, [isMinimized, rendered, setNeedsRefresh])

  return (
    <Canvas
      gl={createRenderer}
      frameloop="demand"
      className="floorplanClass"
      orthographic
      camera={{ up: [0, 0, 1] }}
      style={{
        width: '100%',
        // eslint-disable-next-line no-nested-ternary
        // height: Constants.LEFT_PANEL_FLOORPLAN_HEIGHT,
        // height: Constants.LEFT_PANEL_FLOORPLAN_HEIGHT,
      }}
      resize={{ debounce: 0, scroll: false }}
    >
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <MapControls
        makeDefault
        enableZoom={false}
        enableRotate={false}
        enableDamping={false}
        screenSpacePanning={!svgGl}
        enabled={false}
      />
      <FloorplanLevels
        onLoad={onRenderLevels}
        dimensions={dimensions}
        transitions={showTransitions}
      />
      {rendered && <FitOrthoView minimized={isMinimized} />}
    </Canvas>
  )
}

FloorplanViewer.propTypes = {
  svgGl: PropTypes.bool,
  minimized: PropTypes.bool,
  controlEnabled: PropTypes.bool,
  dimensions: PropTypes.oneOf(['SF', 'LF', '']),
  showTransitions: PropTypes.bool,
}

FloorplanViewer.defaultProps = {
  svgGl: true,
  minimized: true,
  controlEnabled: true,
  dimensions: '',
  showTransitions: true,
}

export { FloorplanViewer }
