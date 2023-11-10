/* eslint-disable no-param-reassign */
import * as THREE from 'three'
import Clipper from '@doodle3d/clipper-js'
import * as turf from '@turf/turf'
import { Constants } from './constants'

const DISTANCE_TOLERANCE = 1e-5

class ShapeUtil {
  static removeAdjacentDuplicatePoints(pointsIn) {
    if (!pointsIn || !pointsIn.length) {
      return []
    }
    const points = [pointsIn[0]]
    for (let i = 1; i < pointsIn.length; i += 1) {
      const pt = pointsIn[i]
      const dist = pt.distanceTo(points[points.length - 1])
      if (dist > DISTANCE_TOLERANCE) {
        points.push(pt)
      }
    }
    return points
  }

  static isClosed(pointsIn) {
    if (!pointsIn || !pointsIn.length) {
      return false
    }
    if (pointsIn.length === 2) {
      return false
    }

    const dist = pointsIn[0].distanceTo(pointsIn[pointsIn.length - 1])
    console.log(dist, 'dist--');
    if (dist > DISTANCE_TOLERANCE) {
      return false
    }
    if (pointsIn.length === 3) {
      return false
    }

    return true
  }

  static isPointInsidePolygonClipper(polygonObject, point) {
    // sweep-line algorithm
    const x = point.X
    const y = point.Y

    let inside = false
    const polygon = polygonObject?.paths?.[0]
    // eslint-disable-next-line no-plusplus
    for (let i = 1, j = 0; i < polygon.length; j = i++) {
      const xi = polygon[i].X
      const yi = polygon[i].Y
      const xj = polygon[j].X
      const yj = polygon[j].Y

      if (yi === yj && yi === y) {
        if ((x > xi && x < xj) || (x > xj && x < xi)) {
          return false
        }
      } else {
        const isYHigher = yi > y !== yj > y
        const ratio = ((xj - xi) * (y - yi)) / (yj - yi)
        // console.log('ratio', ratio + xi, x)
        // console.log(xi, yi, xj, yj, 'isYHigher', isYHigher, ratio)
        const intersect = isYHigher && x < ratio + xi
        // console.log(intersect)
        if (intersect) inside = !inside
      }
    }

    return inside
  }

  static traverseSegments(line, callback, strictlyLines = true) {
    if (!line?.isLine && strictlyLines) {
      // Not a line
      line?.children?.forEach((l) => ShapeUtil.traverseSegments(l, callback, strictlyLines))
      return
    }
    if (line?.children?.length && !strictlyLines) {
      line?.children?.forEach((l) => ShapeUtil.traverseSegments(l, callback, strictlyLines))
      return
    }
    // It's a line here

    console.log(line, 'line--');
    const { geometry, matrixWorld } = line
    if (!geometry) return

    const index = geometry.getIndex()
    const positionAttr = geometry.getAttribute('position')
    if (index) {
      // It is an indexed geometry
      for (let i = 0; i < index.count; i += 1) {
        //
        const p = new THREE.Vector3().fromBufferAttribute(positionAttr, index.getX(i))
        p.applyMatrix4(matrixWorld)
        callback(p)
      }
    } else {
      // non-indexed
      for (let i = 0; i < positionAttr.count; i += 1) {
        const p = new THREE.Vector3().fromBufferAttribute(positionAttr, i)
        p.applyMatrix4(matrixWorld)
        console.log(p, 'p122-');
        callback(p)
      }
    }
  }

  static traverseObject3d(object, callback) {
    if (!object) return
    callback(object)
    object.children.forEach((child) => ShapeUtil.traverseObject3d(child, callback))
  }

  static traverseBoxSegments(box, callback) {
    if (!box) return
    const { min, max } = box
    if (!min || !max) return

    callback(new THREE.Vector2(min.x, min.y))
    callback(new THREE.Vector2(max.x, min.y))
    callback(new THREE.Vector2(max.x, max.y))
    callback(new THREE.Vector2(min.x, max.y))
  }

  static extractPointsFromLine(line, strictlyLines = true) {
    const points = []
    ShapeUtil.traverseSegments(
      line,
      (point) => {
        if (point) points.push(new THREE.Vector2(point.x, point.y))
      },
      strictlyLines
    )
    console.log(points, 'points--');
    if (points.length) return points
    return null
  }

  static toClipperPoint(vec) {
    const INTEGER_FACTOR = 1e5
    return { X: vec.x * INTEGER_FACTOR, Y: vec.y * INTEGER_FACTOR }
  }

  static toClipperObject(line, iterator) {
    const points = []
    iterator(line, (point) => {
      if (point) points.push(ShapeUtil.toClipperPoint(point))
    })
    const capitalConversion = false
    const integerConversion = true // It will Math.round -- as clipper works only on integers
    const removeDuplicates = true
    const numPonts = points.length
    if (numPonts > 1) {
      const first = new THREE.Vector2(points[0].X, points[0].Y)
      const last = new THREE.Vector2(points[numPonts - 1].X, points[numPonts - 1].Y)
      const dist = first.distanceToSquared(last)
      const isClosed = dist <= DISTANCE_TOLERANCE

      return new Clipper([points], isClosed, capitalConversion, integerConversion, removeDuplicates)
    }
    return null
  }

  static isContainedInside(polygon, other) {
    const result1 = ShapeUtil.isContainedInsideUsingClipper(polygon, other)
    // const result2 = ShapeUtil.isContainedInsideUsingTurf(polygon, other)
    //  if (result1 || result2) console.log({result1, result2})
    // return result1 || result2
    return result1
  }

  static isPointOnLine(point, polygon, epsilon) {
    try {
      const polygonObject = ShapeUtil.toTurfObject(polygon, ShapeUtil.traverseSegments)
      if (!polygonObject) return false

      const pointObject = point.isVector3 || point.isVector2 ? ShapeUtil.toTurfPoint(point) : null
      if (!pointObject) return false

      const tPoint = turf.point(pointObject)
      const tLine =
        polygonObject.geometry.type === 'LineString'
          ? polygonObject
          : turf.lineString(polygonObject.geometry.coordinates[0])
      const isOnLine = turf.booleanPointOnLine(tPoint, tLine, epsilon)

      return isOnLine
    } catch (error) {
      console.error(error)
    }
    return false
  }

  static isContainedInsideUsingClipper(polygon, other) {
    if (!other) return false
    try {
      const polygonObject = ShapeUtil.toClipperObject(polygon, ShapeUtil.traverseSegments)
      if (!polygonObject) return false

      const lineObject = ShapeUtil.toClipperObject(other, ShapeUtil.traverseSegments)
      const pointObject =
        other.isVector3 || other.isVector2 ? ShapeUtil.toClipperPoint(other) : null
      const boxObject =
        other.isBox2 || other.isBox3
          ? ShapeUtil.toClipperObject(other, ShapeUtil.traverseBoxSegments)
          : null
      if (!lineObject && !pointObject && !boxObject) return false

      if (lineObject || boxObject) {
        const result = polygonObject.intersect(lineObject || boxObject)
        const isContainedInside = !!result?.paths?.length
        // console.log({ isContainedInside })
        return isContainedInside
      }

      if (pointObject) {
        // const capitalConversion = false
        // const integerConversion = true // It will Math.round -- as clipper works only on integers
        // const isContainedInside = polygonObject.pointInShape(
        //   pointObject,
        //   capitalConversion,
        //   integerConversion
        // )
        const isContainedInside = ShapeUtil.isPointInsidePolygonClipper(polygonObject, pointObject)
        // console.log({ isContainedInside })
        return isContainedInside
      }
    } catch (error) {
      console.error(error)
    }
    return false
  }

  static toTurfPoint(vec) {
    return [vec.x, vec.y]
  }

  static toTurfObject(line, iterator) {
    const points = []
    iterator(line, (point) => {
      if (point) points.push(ShapeUtil.toTurfPoint(point))
    })

    const numPonts = points.length
    if (numPonts > 1) {
      const first = new THREE.Vector2(points[0][0], points[0][1])
      const last = new THREE.Vector2(points[numPonts - 1][0], points[numPonts - 1][1])
      const dist = first.distanceToSquared(last)
      const isClosed = dist <= DISTANCE_TOLERANCE

      if (isClosed) {
        return turf.polygon([points])
      }
      return turf.lineString(points)
    }
    return null
  }

  static isContainedInsideUsingTurf(polygon, other) {
    try {
      const polygonObject = ShapeUtil.toTurfObject(polygon, ShapeUtil.traverseSegments)
      if (!polygonObject) return false

      const lineObject = ShapeUtil.toTurfObject(other, ShapeUtil.traverseSegments)
      const pointObject = other.isVector3 || other.isVector2 ? ShapeUtil.toTurfPoint(other) : null
      const boxObject =
        other.isBox2 || other.isBox3
          ? ShapeUtil.toTurfObject(other, ShapeUtil.traverseBoxSegments)
          : null
      if (!lineObject && !pointObject && !boxObject) return false

      if (lineObject || boxObject) {
        const isContainedInside = turf.booleanContains(polygonObject, lineObject || boxObject)
        // console.log({ isContainedInside })
        return isContainedInside
      }

      if (pointObject) {
        const isContainedInside = turf.booleanWithin(polygonObject, turf.point(pointObject))
        // console.log({ isContainedInside })
        return isContainedInside
      }
    } catch (error) {
      console.error(error)
    }
    return false
  }

  static fillRegion(line, color = 'lightblue') {
    const points = ShapeUtil.extractPointsFromLine(line)
    if (!points?.length) return null

    const shapePoints = ShapeUtil.removeAdjacentDuplicatePoints(points)
    if (ShapeUtil.isClosed(shapePoints)) {
      const shape = new THREE.Shape(shapePoints)
      const shapeGeometry = new THREE.ShapeGeometry(shape)
      const material = new THREE.MeshBasicMaterial({
        color,
        side: THREE.DoubleSide,
        opacity: 1,
      })
      const mesh = new THREE.Mesh(shapeGeometry, material)
      return mesh
    }
    return null
  }

  static computeRegionAreaAndPerimeter(line, exclusions) {
    const output = {
      area: 0,
      perimeter: 0,
      netArea: 0,
      netPerimeter: 0,
    }
    const shapePoints = ShapeUtil.extractPointsFromLine(line)
    if (!shapePoints?.length) return output

    // Compute area
    if (ShapeUtil.isClosed(shapePoints)) {
      const area = THREE.ShapeUtils.area(shapePoints)
      output.area = Math.abs(area)
      output.netArea = output.area
    }

    // Compute perimeter
    if (shapePoints.length > 1) {
      output.perimeter = shapePoints.reduce((accumulator, point, index, array) => {
        let dist = 0
        if (index > 0) {
          const previousPoint = array[index - 1]
          dist = previousPoint.distanceTo(point)
        }
        return accumulator + dist
      }, 0.0)
      output.netPerimeter = output.perimeter
    }

    const removeDuplicatePoints = (points) => {
      const l = points.length
      if (l > 2 && points[l - 1].equals(points[0])) {
        points.pop()
      }
    }

    // Handle exclusions
    const holes = []
    exclusions?.forEach((h) => {
      const points = ShapeUtil.extractPointsFromLine(h)
      if (!points?.length) return
      if (ShapeUtil.isClosed(points)) {
        removeDuplicatePoints(points)
        if (points.length > 2) holes.push(points)
      }
    })
    if (holes.length) {
      // Create a triangulated surface with holes
      removeDuplicatePoints(shapePoints)
      if (shapePoints.length > 2) {
        const addToAllPoints = (contour, allPoints) => {
          for (let i = 0; i < contour.length; i += 1) {
            allPoints.push(contour[i])
          }
        }
        const EDGE_HASH_SEPARATOR = '#'
        const getEdgeHash = (idx1, idx2) => {
          if (idx1 < idx2) return `${idx1}${EDGE_HASH_SEPARATOR}${idx2}`
          return `${idx2}${EDGE_HASH_SEPARATOR}${idx1}`
        }
        const getEdgeIndicesFromHash = (hash) => {
          const splitted = hash.split(EDGE_HASH_SEPARATOR)
          return splitted.map((i) => Number(i))
        }
        const addToEdgeMultiplicity = (idx1, idx2, object) => {
          const hash = getEdgeHash(idx1, idx2)
          if (!object[hash]) object[hash] = 0
          object[hash] += 1
        }
        try {
          // faces is an array of vertex indices like [ [ a,b,d ], [ b,c,d ] ] where
          // vertices are the flat array of vertices like [ x0,y0, x1,y1, x2,y2, ... ]
          // notes that these vertices are from 'sharePoints', holes[0], holes[1], etc.
          const faces = THREE.ShapeUtils.triangulateShape(shapePoints, holes)
          if (faces.length) {
            const allPoints = []
            addToAllPoints(shapePoints, allPoints)
            holes.forEach((points) => addToAllPoints(points, allPoints))

            let area = 0
            const edgesMultiplicity = {}
            faces.forEach((face) => {
              const [a, b, c] = face
              const faceLoop = []
              faceLoop.push(allPoints[a])
              faceLoop.push(allPoints[b])
              faceLoop.push(allPoints[c])
              area += THREE.ShapeUtils.area(faceLoop)

              addToEdgeMultiplicity(a, b, edgesMultiplicity)
              addToEdgeMultiplicity(b, c, edgesMultiplicity)
              addToEdgeMultiplicity(c, a, edgesMultiplicity)
            })
            output.netArea = Math.abs(area)

            let perimeter = 0
            const roomMaxIndex = shapePoints.length - 1
            const isRoomVertex = (idx) => idx <= roomMaxIndex
            Object.keys(edgesMultiplicity).forEach((hash) => {
              const multiplicity = edgesMultiplicity[hash]
              if (multiplicity === 1) {
                const indices = getEdgeIndicesFromHash(hash)
                // Consider the edges which are from room
                if (indices.length === 2 && isRoomVertex(indices[0]) && isRoomVertex(indices[1])) {
                  const points = indices.map((idx) => allPoints[idx])
                  perimeter += points[0].distanceTo(points[1])
                }
              }
            })
            output.netPerimeter = perimeter
          }
        } catch (error) {
          console.error(error)
        }
      }
    }

    return output
  }

  static isObstructed(p1, p2, objects) {
    const distVec = new THREE.Vector3().subVectors(p2, p1)
    const far = distVec.length()
    const near = 0
    const raycaster = new THREE.Raycaster(p1, distVec.normalize(), near, far)
    const oo = raycaster.intersectObjects(objects)
    return !!oo.length
  }

  static getFarthestDistance(p1, p2, objects) {
    const distVec = new THREE.Vector3().subVectors(p2, p1)
    const near = distVec.length()
    const raycaster = new THREE.Raycaster(p1, distVec.normalize(), near) // far is infinity
    const oo = raycaster.intersectObjects(objects)
    const len = oo.length
    if (!len) return null
    const dist1 = oo[len - 1].distance
    return {
      pt1: dist1,
      pt2: dist1 - near,
    }
  }

  static fillHotspotsInProximity(hotspots, walls) {
    if (!hotspots || !walls) return
    for (let i = 0; i < hotspots.length - 1; i += 1) {
      const hs1 = hotspots[i]
      for (let j = i + 1; j < hotspots.length; j += 1) {
        const hs2 = hotspots[j]
        const isIntersecting = ShapeUtil.isObstructed(hs1.position, hs2.position, walls)
        if (!isIntersecting) {
          hs1.hotspotsInProximity.push(hs2.id)
          hs2.hotspotsInProximity.push(hs1.id)

          // get distance to the back wall of proximity hotspot
          const dist1 = ShapeUtil.getFarthestDistance(hs1.position, hs2.position, walls)
          hs1.hotspotsInProximityFarWallDistance.push(dist1?.pt1 || Constants.PANO_RADIUS)
          hs1.hotspotsInProximityNearWallDistance.push(dist1?.pt2 || 0)

          const dist2 = ShapeUtil.getFarthestDistance(hs2.position, hs1.position, walls)
          hs2.hotspotsInProximityFarWallDistance.push(dist2?.pt1 || Constants.PANO_RADIUS)
          hs2.hotspotsInProximityNearWallDistance.push(dist2?.pt2 || 0)
        }
      }
    }
  }
}

export { ShapeUtil }
