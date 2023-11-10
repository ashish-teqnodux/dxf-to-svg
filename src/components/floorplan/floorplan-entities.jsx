import React from 'react'
import PropTypes from 'prop-types'
import 'three'
import { DxfEntities } from './dxf-entities'
import { SvgDivContainerStyle } from './svg-div-container-style'
import { useFileData } from '../../hooks/use-file-data'
import { useRoomEffects } from './use-room-effects'
import { useDimensionEffects } from './use-dimensions-effects'
import { useHotspotEffects } from './use-hotspot-effects'
import { useTransitionEffects } from './use-transitions-effects'
import { useStaircaseEffects } from './use-staircases-effects'
import { useRoomLabelsEffects } from './use-room-labels-effects'

function FloorplanEntities(props) {
  const { id, onLoad, dimensions, visible, transitions, ...restProps } = props
  const fileData = useFileData()
  const { three } = fileData || {}
  const [isRendered, setIsRendered] = React.useState(false)
  const entities = React.useMemo(() => three?.[id], [three, id])

  const { labels: renderRoomLabels, effects: roomLabelsEffects } = useRoomLabelsEffects({
    entities,
  })
  const roomEffects = useRoomEffects({ entities })
  const hotspotEffects = useHotspotEffects({ entities })
  const dimensionEffects = useDimensionEffects({ entities })
  const transitionEffects = useTransitionEffects({ entities })
  const staircaseEffects = useStaircaseEffects({ entities })

  React.useLayoutEffect(() => {
    if (isRendered) {
      onLoad(true)
    }
  }, [isRendered, onLoad])

  React.useLayoutEffect(() => roomEffects(visible), [roomEffects, visible])
  React.useLayoutEffect(() => hotspotEffects(visible), [hotspotEffects, visible])
  // Disable the default room label - will generate
  const enableDefaultLabels = false
  React.useLayoutEffect(() => {
    if (enableDefaultLabels) {
      dimensionEffects(visible && dimensions)
    } else {
      roomLabelsEffects(visible && enableDefaultLabels, dimensions)
    }
  }, [dimensionEffects, dimensions, enableDefaultLabels, roomLabelsEffects, visible])
  React.useLayoutEffect(
    () => transitionEffects(transitions && visible),
    [transitionEffects, transitions, visible]
  )
  React.useLayoutEffect(() => staircaseEffects(visible), [staircaseEffects, visible])

  const labels = React.useMemo(
    () => renderRoomLabels(visible && !enableDefaultLabels),
    [enableDefaultLabels, renderRoomLabels, visible]
  )
  if (!entities) return null
  return (
    <>
      {visible && <SvgDivContainerStyle />}
      <DxfEntities
        key={id}
        id={id}
        entities={entities}
        onLoad={() => setIsRendered(true)}
        visible={visible}
        {...restProps}
      />
      {labels}
    </>
  )
}

FloorplanEntities.propTypes = {
  onLoad: PropTypes.func,
  id: PropTypes.string,
  dimensions: PropTypes.oneOf(['SF', 'LF', '']),
  transitions: PropTypes.bool,
  visible: PropTypes.bool,
}

FloorplanEntities.defaultProps = {
  onLoad: () => {},
  id: null,
  dimensions: true,
  transitions: true,
  visible: true,
}

export { FloorplanEntities }
