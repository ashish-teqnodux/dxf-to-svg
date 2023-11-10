import React from 'react'
import PropTypes from 'prop-types'
import * as THREE from 'three'
import { extend } from '@react-three/fiber'
import { SVGObject } from '../../renderers/SVGRenderer'
import { Constants, SvgUtil } from '../../utils'
import { SvgDivContainerStyle } from './svg-div-container-style'

const DEBUG = false
const MARGIN_FACTOR = 1.05

extend({ SVGObject })

let temp = null
function getTempCanvasContext() {
  if (!temp) {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    temp = context
  }
  return temp
}

function SvgText(props) {
  const {
    text: textIn,
    middle,
    position: positionIn,
    box,
    color,
    fontSize: fontSizeIn,
    fontFamily,
    fontWeight,
    foreignObject,
    className,
  } = props

  const textHeight = React.useMemo(
    () => MARGIN_FACTOR * Number(fontSizeIn.toString().replace('px', '')),
    [fontSizeIn]
  )

  const textArray = React.useMemo(() => {
    if (!textIn) return []
    if (Array.isArray(textIn)) return textIn
    return [textIn]
  }, [textIn])

  const estimateTextSize = React.useCallback(
    (text) => {
      if (!text) return null
      const context = getTempCanvasContext()
      context.font = `${fontSizeIn} ${fontFamily}`
      if (fontWeight) context.font = `${fontWeight} ${context.font}`

      // get size data (height depends only on font size)
      const getWidth = (t) => {
        const metrics = context.measureText(t)
        return metrics?.width || 0
      }

      const fullWidth = MARGIN_FACTOR * getWidth(text)
      const splitWidths = text.split(' ').map(getWidth)
      let textWidth = MARGIN_FACTOR * splitWidths.reduce((a, c) => Math.max(a, c), 0)
      const maxNumLines = splitWidths.length || 1
      if (maxNumLines === 2 && splitWidths[0] < 100 && splitWidths[1] / splitWidths[0] < 0.3) {
        textWidth = MARGIN_FACTOR * fullWidth
      }
      return {
        maxLineWidth: fullWidth,
        textWidth,
        maxNumLines,
      }
    },
    [fontFamily, fontSizeIn, fontWeight]
  )

  const estimateTextboxSize = React.useCallback(() => {
    const initial = {
      maxLineWidth: 1,
      textWidth: 1,
      maxNumLines: 0,
    }
    return (
      textArray?.map(estimateTextSize)?.reduce(
        (a, c) => ({
          maxLineWidth: Math.max(a.maxLineWidth, c.maxLineWidth),
          textWidth: Math.max(a.textWidth, c.textWidth),
          maxNumLines: a.maxNumLines + c.maxNumLines,
        }),
        initial
      ) || initial
    )
  }, [estimateTextSize, textArray])

  const { position, textWidth, maxNumLines, fontSize, customClassName } = React.useMemo(() => {
    if (!positionIn || !box) return {}
    const position = positionIn.clone()
    const { textWidth, maxNumLines } = estimateTextboxSize()

    if (middle) {
      position.x -= textWidth / 2
    }
    position.y += textHeight / 2

    let finalTextWidth = textWidth
    let fontSize = fontSizeIn
    let customClassName = null
    if (box) {
      const minX = Math.max(box.min.x, position.x)
      const maxX = Math.min(box.max.x, position.x + textWidth)
      const availableWidth = (maxX - minX) * MARGIN_FACTOR
      const epsilon = 1e6
      // positive and smaller than textWidth
      if (availableWidth > -epsilon && availableWidth < textWidth) {
        const factor = Math.max(0.5, availableWidth / textWidth)

        finalTextWidth = availableWidth
        fontSize = `${Math.floor((textHeight / MARGIN_FACTOR) * factor) - 2}px`
        customClassName = `${className}${fontSize}`
      }
    }
    return {
      position,
      textWidth: finalTextWidth,
      textHeight,
      maxNumLines,
      fontSize,
      customClassName,
    }
  }, [box, className, estimateTextboxSize, fontSizeIn, middle, positionIn, textHeight])

  const svgText = React.useMemo(() => {
    if (!maxNumLines || !textArray.length || !position) return null
    // SVG supports only single line text (so join the array)
    // For multiple line use svgDiv
    const svg = SvgUtil.createText(textArray.join(' '), 'hanging')
    SvgUtil.applyStyles(svg, {
      fontSize,
      lineColor: color,
      lineWidth: 0.1,
      fillColor: color,
      fontFamily,
      fontWeight,
    })
    SvgUtil.setPosition(svg, position)
    return svg
  }, [color, fontFamily, fontSize, fontWeight, maxNumLines, position, textArray])

  const svgDiv = React.useMemo(() => {
    if (!maxNumLines || !textArray.length || !position || !foreignObject) return null
    const svg = SvgUtil.createDiv(
      position,
      textWidth,
      textHeight * maxNumLines,
      customClassName || className
    )
    textArray.forEach((text) => SvgUtil.appendTextInDiv(text, svg))
    return svg
  }, [
    className,
    customClassName,
    foreignObject,
    maxNumLines,
    position,
    textArray,
    textHeight,
    textWidth,
  ])

  const svg = React.useMemo(() => {
    let svg = svgDiv || svgText
    if (svgText && svgDiv) {
      svg = SvgUtil.createSwitch(svgDiv, svgText)
    }
    if (!svg) return null
    return SvgUtil.createGroup([svg])
  }, [svgDiv, svgText])

  const svg2 = React.useMemo(() => {
    if (!positionIn) return null
    return SvgUtil.createGroup([SvgUtil.createCircle(positionIn, 2)])
  }, [positionIn])

  if (!svg) return null
  return (
    <>
      {customClassName && (
        <SvgDivContainerStyle
          className={customClassName}
          color={color}
          fontSize={fontSize}
          fontFamily={fontFamily}
          fontWeight={fontWeight}
        />
      )}
      <sVGObject args={[svg]} />
      {DEBUG && svg2 && <sVGObject args={[svg2]} />}
    </>
  )
}

SvgText.propTypes = {
  position: PropTypes.oneOfType([
    PropTypes.instanceOf(THREE.Vector3),
    PropTypes.instanceOf(THREE.Vector2),
  ]),
  box: PropTypes.oneOfType([PropTypes.instanceOf(THREE.Box2), PropTypes.instanceOf(THREE.Box3)]),
  text: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.string), PropTypes.string]),
  color: PropTypes.string,
  fontSize: PropTypes.string,
  fontFamily: PropTypes.string,
  fontWeight: PropTypes.string,
  middle: PropTypes.bool,
  foreignObject: PropTypes.bool,
  className: PropTypes.string,
}

SvgText.defaultProps = {
  position: null,
  box: null,
  text: '',
  color: 'black',
  fontSize: '13px',
  fontFamily: 'poppins',
  fontWeight: 'normal',
  middle: false,
  foreignObject: false,
  className: Constants.SVG_DIV_CLASS_NAME,
}

export { SvgText }
