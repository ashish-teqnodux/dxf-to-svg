/* eslint-disable no-param-reassign */
/* eslint-disable react/no-array-index-key */
import React from 'react'
import PropTypes from 'prop-types'
import * as THREE from 'three'

function DxfEntities(props) {
  const { onLoad, entities, id, name, visible } = props

  const loadCountRef = React.useRef(0)

  const numEntities = entities?.length
  const onLoadItem = React.useCallback(
    (object) => {
      loadCountRef.current += 1
      if (numEntities === loadCountRef.current) {
        onLoad(object?.parent)
      }
    },
    [numEntities, onLoad]
  )

  if (!numEntities) return null
  return (
    <group key={id} name={name} frustumCulled={false} dispose={null} visible={visible}>
      {entities?.map((l, idx) => (
        <primitive
          key={`${l.name}-${idx}`}
          object={l}
          onUpdate={() => onLoadItem(l)}
          frustumCulled={false}
          name={l.name}
        />
      ))}
    </group>
  )
}

DxfEntities.propTypes = {
  onLoad: PropTypes.func,
  id: PropTypes.string,
  name: PropTypes.string,
  entities: PropTypes.arrayOf(PropTypes.instanceOf(THREE.Object3D)),
  visible: PropTypes.bool,
}

DxfEntities.defaultProps = {
  onLoad: () => {},
  id: '',
  name: '',
  entities: null,
  visible: true,
}

export { DxfEntities }
