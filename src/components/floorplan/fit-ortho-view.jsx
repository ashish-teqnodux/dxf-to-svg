import React from 'react'
import PropTypes from 'prop-types'
import { useThree } from '@react-three/fiber'
import { useFitOrthoView } from '../../hooks/use-fit-ortho-view'
import { useFitOrthoViewRefresh, useFloorplanData } from '../../stores'

function FitOrthoView(props) {
  const { minimized } = props
  const { camera } = useThree()
  const activeLevelId = useFloorplanData((state) => state.activeLevelId)
  const focusBounds = useFloorplanData((state) => state.focusBounds)
  const setFocusBounds = useFloorplanData((state) => state.setFocusBounds)

  const { needsRefresh, setNeedsRefresh } = useFitOrthoViewRefresh()
  const refreshCameraView = useFitOrthoView({
    // eslint-disable-next-line no-nested-ternary
    scalar: minimized ? 0.5 : focusBounds ? 2.8 : 1,
    box: minimized ? null : focusBounds,
    animate: !!focusBounds,
  })
  const onceRef = React.useRef(false)

  // Force refresh if camera changes
  React.useLayoutEffect(() => {
    if (camera.left && camera.right && camera.top && camera.bottom) {
      setTimeout(() => {
        if (!onceRef.current) {
          setNeedsRefresh(true)
          onceRef.current = true
        }
      }, 100)
    }
  }, [camera.bottom, camera.left, camera.right, camera.top, setNeedsRefresh])

  // Force refresh if level is changed
  React.useLayoutEffect(() => {
    setNeedsRefresh(true)
  }, [activeLevelId, setNeedsRefresh])

  // Force refresh if focusBounds is changed
  React.useLayoutEffect(() => {
    if (focusBounds) {
      setNeedsRefresh(true)
    }
  }, [focusBounds, setNeedsRefresh])

  React.useLayoutEffect(() => {
    if (needsRefresh) {
      refreshCameraView()
      setNeedsRefresh(false)
      setFocusBounds(null)
    }
  }, [needsRefresh, refreshCameraView, setFocusBounds, setNeedsRefresh])

  return null
}

FitOrthoView.propTypes = {
  minimized: PropTypes.bool,
}

FitOrthoView.defaultProps = {
  minimized: false,
}

export { FitOrthoView }
