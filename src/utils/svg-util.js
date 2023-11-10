import { SVGObject } from '../renderers/SVGRenderer'
import { Constants } from './constants'
import { ShapeUtil } from './shape-util'

class SvgUtil {
  static toThree(element, convertedFromObject3) {
    if (!element) return null
    if (element.isSVGObject) return element
    const object3 = new SVGObject(element)
    object3.frustumCulled = false

    // copy the data from
    if (convertedFromObject3) {
      object3.userData = convertedFromObject3.userData
      object3.name = convertedFromObject3.name
    }

    return object3
  }

  static fromThree(object, isContiguous) {
    if (!object) return null
    if (object.isSVGObject) {
      console.log(object, 'object--')
      const cloned = object.node.cloneNode(true)
      SvgUtil.setPosition(cloned, object.position)
      return cloned
    }

    // Only lines are supported

    if (isContiguous) return SvgUtil.fromThreeLine(object)

    const nodes = []
    ShapeUtil.traverseObject3d(object, (child) => {
      if (child.isLine) {
        const node = SvgUtil.fromThreeLine(child)
        if (node) nodes.push(node)
      }
    })
    if (nodes.length) return SvgUtil.createGroup(nodes)
    return null
  }

  static fromThreeLine(object) {
    // Only lines are supported
    const points = ShapeUtil.extractPointsFromLine(object)
    if (!points?.length) return null

    const shapePoints = ShapeUtil.removeAdjacentDuplicatePoints(points)
    const isClosed = ShapeUtil.isClosed(shapePoints)
    const node = isClosed ? SvgUtil.createPolygon(shapePoints) : SvgUtil.createPath(shapePoints)

    let material = null
    ShapeUtil.traverseObject3d(object, (child) => {
      if (child.material && !material) material = child.material
    })

    const style = {}
    if (material) {
      style.lineColor = `#${material.color.getHexString()}`
      style.lineWidth = material.linewidth || 1
      SvgUtil.applyStyles(node, style)
    }
    return node
  }

  static createText(text, baseline = 'middle') {
    const node = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    node.setAttributeNS(null, 'dominant-baseline', baseline)
    // node.setAttributeNS(null, 'text-anchor', 'middle')
    node.textContent = text
    return node
  }

  static appendTextInDiv(text, svgDiv) {
    const span = document.createElementNS('http://www.w3.org/1999/xhtml', 'p')
    span.textContent = text
    svgDiv.firstChild.appendChild(span)
    return svgDiv
  }

  static createDiv(position, width, height, className = Constants.SVG_DIV_CLASS_NAME) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject')
    if (position) SvgUtil.setPosition(svg, position)
    if (width) svg.setAttributeNS(null, 'width', width)
    if (height) svg.setAttributeNS(null, 'height', height)
    const div = document.createElementNS('http://www.w3.org/1999/xhtml', 'div')
    div.setAttributeNS(null, 'class', className)
    svg.appendChild(div)
    return svg
  }

  static createSwitch(svg1, svg2) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'switch')
    svg.appendChild(svg1)
    svg.appendChild(svg2)
    return svg
  }

  static createGroup(elements) {
    const node = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    elements.forEach((el) => node.appendChild(el))
    return node
  }

  static createPath(points) {
    const node = document.createElementNS('http://www.w3.org/2000/svg', 'path')

    const pointsString = SvgUtil.points2Svg(points, ' ', 'L')

    node.setAttributeNS(null, 'd', `M${pointsString}`)
    node.setAttributeNS(null, 'fill', 'none')
    return node
  }

  static createPolygon(points) {
    const node = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')

    const pointsString = SvgUtil.points2Svg(points, ',', ' ')

    node.setAttributeNS(null, 'points', pointsString)
    node.setAttributeNS(null, 'fill', 'none')
    node.setAttributeNS(null, 'stroke-width', 1)
    node.setAttributeNS(null, 'stroke', 'black')
    return node
  }

  static createCircle(point, radius = 1) {
    const node = document.createElementNS('http://www.w3.org/2000/svg', 'circle')

    node.setAttributeNS(null, 'cx', point.x)
    node.setAttributeNS(null, 'cy', -point.y)
    node.setAttributeNS(null, 'r', radius)

    node.setAttributeNS(null, 'fill', 'black')
    node.setAttributeNS(null, 'stroke-width', 1)
    node.setAttributeNS(null, 'stroke', 'black')
    return node
  }

  static points2Svg(points, coordinateSeparator = ' ', pointSeparator = ' ', precision = 4) {
    return points
      .map((pt) => `${pt.x.toFixed(precision)}${coordinateSeparator}${-pt.y.toFixed(precision)}`)
      .join(pointSeparator)
  }

  static setPosition(element, position) {
    element.setAttributeNS(null, 'x', position.x)
    element.setAttributeNS(null, 'y', -position.y)
  }

  static applyStylesFrom(node, object3) {
    let material = null
    ShapeUtil.traverseObject3d(object3, (child) => {
      if (child.material && !material) material = child.material
    })
    const params = object3.userData?.style
    if (params) {
      SvgUtil.applyStyles(node, params)
    }
  }

  static applyStyles(element, params) {
    if (!element) return
    const {
      lineColor,
      strokeWidth,
      stroke,
      fontSize,
      fill,
      fillColor,
      font,
      fontFamily,
      lineWidth,
      strokeDashArray,
      lineDash,
      fontWeight,
      textTransform,
    } = params

    if (fontSize) {
      element.setAttributeNS(null, 'font-size', fontSize)
    }
    if (strokeWidth || lineWidth) {
      element.setAttributeNS(null, 'stroke-width', strokeWidth || lineWidth)
    }
    if (stroke || lineColor) {
      element.setAttributeNS(null, 'stroke', stroke || lineColor)
    }
    if (strokeDashArray || lineDash) {
      element.setAttributeNS(null, 'stroke-dasharray', strokeDashArray || lineDash)
    }

    if (fill || fillColor) {
      element.setAttributeNS(null, 'fill', fillColor)
    }
    if (font) {
      element.setAttributeNS(null, 'font', font)
    }
    if (fontFamily) {
      element.setAttributeNS(null, 'font-family', fontFamily)
    }
    if (fontWeight) {
      element.setAttributeNS(null, 'font-weight', fontWeight)
    }
    if (textTransform) {
      element.setAttributeNS(null, 'text-transform', textTransform)
    }
  }
}

export { SvgUtil }
