import React from 'react'
import PropTypes from 'prop-types'
import 'three'
import { useLoader } from '@react-three/fiber'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import { DXFLoader } from 'three-dxf-loader'
import { LayerManager } from '../../floorplan/layer-manager'
import { Fonts } from '../../assets'

function DxfLoader(props) {
  const { id, onLoad, url, font: fontUrl } = props

  const font = useLoader(FontLoader, fontUrl)
  const dxf = useLoader(DXFLoader, url, (loader) => {
    loader.setFont(font)
    loader.setEnableLayer(true)
  })

  const dataRef = React.useRef(null)
  React.useLayoutEffect(() => {
    console.log(dxf, 'dxf--')
    if (!dataRef.current && dxf?.entities) {
      try {
        const level = new LayerManager(id, dxf)
        console.log(level, 'level-')
        onLoad({ id, level })
        dataRef.current = level
      } catch (error) {
        console.error(error)
        onLoad({ id })
      }
    }
  }, [dxf, id, onLoad])

  return null
}

DxfLoader.propTypes = {
  onLoad: PropTypes.func,
  url: PropTypes.string,
  font: PropTypes.string,
  id: PropTypes.string,
}

DxfLoader.defaultProps = {
  onLoad: () => {},
  url: null,
  font: Fonts.Helvetiker,
  id: '',
}

export { DxfLoader }
