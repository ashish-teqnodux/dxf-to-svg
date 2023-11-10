import * as THREE from 'three'
import { SvgUtil } from '../utils'
import { ShapeUtil } from '../utils/shape-util'
import { UserData } from '../utils/user-data'

const EPSILON = 1e-10
const EPSILON_SQ = EPSILON * EPSILON
/**
 * Defines the shape of the entity
 */
class Layer {
  constructor(refId, name) {
    this.refId = refId
    this.name = name
    this.objects = []
  }

  add(object3, options) {
    const { hasGeometry, hasLabels, renderLabels: labelStyle, dxf, ...style } = options || {}
    const entity = {
      refId: object3.uuid,
    }
    // Attach as userdata
    UserData.setRefId(object3, entity.refId)
    const { box, position } = Layer.extractBox(object3) || {}
    if (box) entity.box = box
    if (position) entity.position = position

    // Extract text label if required
    let labelSvgObject = null
    if (hasLabels && dxf) {
      const { text, position, ...rest } = Layer.extractText(object3, dxf, !!labelStyle)
      if (text) entity.text = text
      if (position) entity.position = position
      labelSvgObject = rest.svgObject
    }

    // NOTE : incoming object can ONLY be mapped to either filled or label

    // Apply style and find filled region (if not label)
    let filledSvgObject = null
    if (labelSvgObject) {
      Layer.applyStyles(labelSvgObject, labelStyle)
      entity.sibling = labelSvgObject.uuid
      entity.siblingPosition = labelSvgObject.position?.clone()
      // Attach same refId to sibling
      UserData.setRefId(labelSvgObject, entity.refId)
    } else {
      filledSvgObject = Layer.applyStyles(object3, style)
      if (filledSvgObject) {
        entity.sibling = filledSvgObject.uuid
        entity.siblingPosition = filledSvgObject.position?.clone()
        // Attach same refId to sibling
        UserData.setRefId(filledSvgObject, entity.refId)
      }
    }
    if (hasGeometry || (hasLabels && entity.text)) {
      this.objects.push(entity)
    }

    if (!labelSvgObject && !filledSvgObject) return null

    return {
      svgObject: labelSvgObject || filledSvgObject,
      type: labelSvgObject ? 'label' : 'filled',
    }
  }

  curateLayer(options) {
    const { hasGeometry, hasLabels, encloseBorder, layer3 } = options || {}
    if (encloseBorder && layer3) {
      const oldObjects = this.objects
      const closedObjects = []
      let length = oldObjects?.length || 0
      for (let i = length - 1; i >= 0; i -= 1) {
        const current = oldObjects?.[i]
        const current3 = UserData.findByRefId(layer3, current.refId)
        if (current3) {
          const points = ShapeUtil.extractPointsFromLine(current3)
          if (points?.length && ShapeUtil.isClosed(points)) {
            closedObjects.push(current)
            oldObjects.splice(i, 1)
            length -= 1
          }
        }
      }
      const newObjects = []
      if (oldObjects?.length && closedObjects?.length) {
        const innerObjects = {}
        closedObjects.forEach((polygon) => {
          innerObjects[polygon.refId] = []
          const polygon3 = UserData.findByRefId(layer3, polygon.refId)

          if (!oldObjects) return
          for (let i = length - 1; i >= 0; i -= 1) {
            const current = oldObjects?.[i]
            const current3 = UserData.findByRefId(layer3, current.refId)
            if (current3) {
              const isInside = ShapeUtil.isContainedInside(polygon3, current3)
              if (isInside) {
                innerObjects[polygon.refId].push(current)
                oldObjects.splice(i, 1)
                length -= 1
              }
            }
          }
        })
        newObjects.push(...closedObjects)
        if (oldObjects) newObjects.push(...oldObjects)
      } else if (!closedObjects?.length) {
        if (oldObjects) newObjects.push(...oldObjects)
      } else {
        newObjects.push(...closedObjects)
      }
      this.objects = newObjects
    }

    if (hasGeometry && hasLabels) {
      // Ensure there is only single object with text and geometry both
      const oldObjects = this.objects
      const newObjects = []
      this.objects = newObjects
      let length = oldObjects?.length || 0
      while (length) {
        let hasChanged = false
        for (let i = 0; i < length; i += 1) {
          const current = oldObjects[i]
          if (current.text) {
            hasChanged = true
            oldObjects.splice(i, 1)
            length -= 1
            newObjects.push(current)
            const point = current.position
            let nearest = -1
            let nearestDistance = Number.MAX_SAFE_INTEGER
            for (let j = 0; j < length; j += 1) {
              const next = oldObjects[j]
              if (!next.text && next.box) {
                const distance = next.box.distanceToPoint(point)
                if (distance < nearestDistance) {
                  nearestDistance = distance
                  nearest = j
                }
              }
            }
            if (nearest > -1) {
              hasChanged = true
              const found = oldObjects[nearest]
              oldObjects.splice(nearest, 1)
              length -= 1
              current.box = found.box
              // give precendence to refId of geometry object
              current.refId = found.refId
            }
          }
        }
        if (!hasChanged) {
          if (oldObjects?.length) newObjects.push(...oldObjects)
          break
        }
      }
    }
  }

  static applyStyles(object3, style) {
    if (object3?.isSVGObject) {
      SvgUtil.applyStyles(object3.node, style)
      return null
    }
    UserData.setStyle(object3, style)

    const { fill, fillColor, lineColor, lineWidth } = style || {}

    let filled = null
    if (fill) {
      filled = ShapeUtil.fillRegion(object3, fillColor)
      if (filled) {
        // Slight offset from source object3
        filled.position.z += 0.0001
        filled.updateMatrix()

        filled.name = `${object3.name}Filled`
        UserData.copy(object3, filled)
      }
    }

    if (lineColor || lineWidth) {
      object3.traverse((child) => {
        if (child?.material?.isLineDashedMaterial || child?.material?.isLineBasicMaterial) {
          if (lineColor) child.material.color.set(lineColor)
          // eslint-disable-next-line no-param-reassign
          if (lineWidth) child.material.linewidth = lineWidth

          // eslint-disable-next-line no-param-reassign
          child.material.needsUpdate = true

          // eslint-disable-next-line no-param-reassign
          child.userData.style = style
        }
      })
    }

    return filled
  }

  static extractText(object3, dxf, needsRenderable) {
    if (!object3 || !dxf) return {}
    const objPosition = object3.children?.[0]?.position || object3.position
    if (!objPosition) return {}

    let found = ''
    let position = null
    dxf.entities.some((ent) => {
      if (!ent.text) return false
      let entPosition = null
      const { text } = ent
      if (ent.type === 'TEXT') {
        entPosition = ent.startPoint
      } else if (ent.type === 'MTEXT') {
        entPosition = ent.position
      }
      if (!entPosition) return false

      const distX = entPosition.x - objPosition.x
      const distY = entPosition.y - objPosition.y
      const distZ = entPosition.z - objPosition.z
      const distSq = distX * distX + distY * distY + distZ * distZ
      if (EPSILON_SQ >= distSq) {
        // console.log( { type: ent.type, text, objPosition, entPosition, distSq})
        found = text
        position = objPosition.clone()
        if (objPosition === object3.position) {
          object3.getWorldPosition(position)
        } else if (objPosition === object3.children?.[0]?.position) {
          object3.children[0].getWorldPosition(position)
        }
        return true
      }
      return false
    })

    // Create render element
    let svgObject = null
    if (found && position && needsRenderable) {
      const svg = SvgUtil.createText(found)
      svgObject = SvgUtil.toThree(svg)
      svgObject.position.copy(position)
    }

    return { text: found, position, svgObject }
  }

  static extractBox(object3) {
    if (!object3) return null
    const box = new THREE.Box3().setFromObject(object3)
    if (box.isEmpty()) return null
    const size = box.getSize(new THREE.Vector3())
    if (!Number.isFinite(size.x) || !Number.isFinite(size.y) || !Number.isFinite(size.z))
      return null

    const position = box.getCenter(new THREE.Vector3())
    return { box, position }
  }

  static containsObject(boundingLayerObject, layerObject) {
    const { box: boundingBox } = boundingLayerObject || {}
    if (!boundingBox) return false
    const points = []
    const { box, position } = layerObject || {}
    if (position) points.push(position)
    if (box) {
      points.push(box.min)
      points.push(box.max)
    }
    if (!points.length) return false
    return points.every((pt) => boundingBox.containsPoint(pt))
  }
}

export { Layer }
