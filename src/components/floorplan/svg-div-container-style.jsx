import React from 'react'
import PropTypes from 'prop-types'
import { extend } from '@react-three/fiber'
import { SVGObject } from '../../renderers/SVGRenderer'
import { Constants } from '../../utils'

extend({ SVGObject })

function SvgDivContainerStyle(props) {
  const { className, color, fontSize, fontFamily, fontWeight } = props

  const svg = React.useMemo(() => {
    const node = document.createElementNS('http://www.w3.org/2000/svg', 'style')
    node.textContent = `.${className} {
        height: 100%;
        overflow: visible;
      }
      .${className} p {
        color: ${color};
        font-size: ${fontSize};
        font-family: '${fontFamily}', sans-serif;
        font-weight: ${fontWeight};
        line-height: 1;
        margin: 0;
      }`
    return node
  }, [color, fontFamily, fontSize, fontWeight, className])

  if (!svg) return null
  return <sVGObject args={[svg]} />
}

SvgDivContainerStyle.propTypes = {
  color: PropTypes.string,
  fontSize: PropTypes.string,
  fontFamily: PropTypes.string,
  fontWeight: PropTypes.string,
  className: PropTypes.string,
}

SvgDivContainerStyle.defaultProps = {
  color: 'black',
  fontSize: '13px',
  fontFamily: 'poppins',
  fontWeight: 'normal',
  className: Constants.SVG_DIV_CLASS_NAME,
}

export { SvgDivContainerStyle }
