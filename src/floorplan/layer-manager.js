/* eslint-disable no-param-reassign */
import * as THREE from 'three'
import { Layer } from './layer'
import { LayerMapper } from './layer-mapper'
import { ShapeUtil } from '../utils/shape-util'
import { SvgUtil, UnitsUtil } from '../utils'
import { UserData } from '../utils/user-data'

/**
 * This equivalent to a level/storey/floor - composed of multiple layers
 */
class LayerManager {
  constructor(id, data) {
    this.id = id
    const { dxf, entities: layers3 } = data || {}
    this.setDxfData(dxf)
    this.setLayers(layers3)
    this.curateLevelData()
  }

  setDxfData(data) {
    const { header, tables, blocks, entities } = data || {}
    this.header = header || {}
    this.tables = tables || {}
    this.blocks = blocks || {}
    this.entities = entities || []
    return this
  }

  /**
   * Handling of threejs objects
   * @param {THREE.Object3D} layers3
   * @returns
   */
  setLayers(layers3) {
    const dxf = this
    this.layers = {}
    const filtered3 = []
    console.log(layers3, 'layers322--')
    layers3?.forEach((item) => {
      let labels3 = null
      let filled3 = null
      const { name, uuid: refId } = item || {}
      // Filter extra layers
      if (!name || !LayerMapper.sources.includes(name)) return
      const target = LayerMapper.source2Target[name]
      console.log(target.layer, name, 'LayerMapper.source2Target')
      if (!target) return

      const {
        layer: layerName,
        hasGeometry,
        hasLabels,
        renderLabels,
        encloseBorder,
        ...style
      } = target

      // Attached refId
      UserData.setRefId(item, refId)
      // Update the world matrix
      item.updateWorldMatrix(true, true)

      // Identify if item is already inserted with the same layerName
      let finalItem = filtered3.find((i) => i.name === layerName)
      let finalItemRefId = refId
      if (finalItem) {
        finalItemRefId = UserData.getRefId(finalItem)
      } else {
        // Insert new item
        finalItem = item
        // eslint-disable-next-line no-param-reassign
        item.name = layerName
        filtered3.push(item)
      }

      // Create layer
      const layer = this.layers[layerName] || new Layer(finalItemRefId, layerName)
      this.layers[layerName] = layer

      console.log(item, 'item--11')
      // Add child elements to layer
      item.children.forEach((obj, index) => {
        if (obj) {
          // eslint-disable-next-line no-unused-expressions
          if (!obj.name) obj.name === `${layerName.slice(0, -1)}${index}`
          const sibling = layer.add(obj, { hasGeometry, hasLabels, renderLabels, dxf, ...style })
          if (sibling) {
            const { svgObject, type } = sibling
            if (hasLabels && renderLabels && type === 'label') {
              if (!labels3) {
                labels3 = new THREE.Group()
                console.log(labels3, 'labels3--')
                labels3.name = `${layerName}Labels`
                filtered3.push(labels3)
              }
              labels3.add(svgObject)
            }
            if (hasGeometry && type === 'filled') {
              if (!filled3) {
                filled3 = new THREE.Group()
                filled3.name = `${layerName}Filled`
                filtered3.push(filled3)
              }
              filled3.add(svgObject)
            }
          }
          if (finalItem !== item) {
            finalItem.add(obj)
          }
        }
      })

      // if (layerName === 'staircases') {
      //    console.log(layerName, item.toJSON(), layers3, filtered3)
      // }
    })

    this.layers3 = filtered3

    const { layers } = this
    Object.keys(layers).forEach((layerName) => {
      const target = LayerMapper.target2Source[layerName]
      const { hasGeometry, hasLabels, encloseBorder } = target || {}
      layers[layerName].curateLayer({
        hasGeometry,
        hasLabels,
        encloseBorder,
        layer3: filtered3.find((i) => i.name === layerName),
      })
    })

    // compute the bounds
    let box
    this.layers3.forEach((object3) => {
      if (object3) {
        if (!box) box = new THREE.Box3().setFromObject(object3)
        else box.expandByObject(object3)
      }
    })
    this.bounds = box

    return this
  }

  curateLevelData() {
    const { layers3, layers } = this
    if (!layers || !layers3) return this

    const EPSILON_WALL_THICKNESS = 2
    const EPSILON_STAIRCASE_STEP_THICKNESS = 2
    const checkPointOnBoundary = (object3d, point, epsilon) =>
      ShapeUtil.isPointOnLine(point, object3d, epsilon)
    const checkContainment = (object1, object2, object3d) => {
      if (!Layer.containsObject(object1, object2)) return false
      return ShapeUtil.isContainedInside(object3d, object2.position)
    }

    // Prepared curated data
    const curatedData = []

    // Prepare association among rooms/dimensions/labels/hotspots
    const {
      cameras,
      rooms: roomsLayer,
      dimensions,
      levels,
      roomItems,
      transitions,
      staircases,
      staircaseSteps,
    } = layers

    console.log(layers, 'levels--')
    // levels
    let label = ''
    levels?.objects?.forEach((obj) => {
      if (obj.text) {
        label = obj.text
      }
    })
    // label of the level
    this.label = label
    const level = {
      id: this.id,
      label: this.label,
    }

    // Curated transitions
    const curatedTransitions = []
    const transitionLayer3 = layers3.filter(
      (item) => transitions?.refId === UserData.getRefId(item)
    )?.[0]
    transitions?.objects?.forEach((transition) => {
      const position = transition.box?.getCenter(new THREE.Vector3()) || transition.position
      const curatedTransition = {
        ...transition,
        position,
        rooms: [],
        staircases: [],
      }
      curatedTransition.label = curatedTransition.text
      delete curatedTransition.text
      curatedTransitions.push(curatedTransition)

      if (transition.sibling) {
        const transition3 = UserData.findByRefId(transitionLayer3, curatedTransition.refId)
        UserData.copy({ userData: curatedTransition }, transition3)
      }
    })
    this.curatedTransitionData = curatedTransitions

    // Curated staircases
    const curatedStaircases = []
    const staircasesLayer3 = layers3.filter(
      (item) => staircases?.refId === UserData.getRefId(item)
    )?.[0]
    staircases?.objects?.forEach((staircase) => {
      const curatedStaircase = {
        ...staircase,
        transitions: [],
        steps: [],
        text: '', // label
      }
      // Link staircase and transition
      const staircase3 = UserData.findByRefId(staircasesLayer3, staircase.refId)
      curatedTransitions.forEach((transition) => {
        if (
          checkPointOnBoundary(staircase3, transition.position, EPSILON_STAIRCASE_STEP_THICKNESS)
        ) {
          curatedStaircase.transitions.push(transition.refId)
          transition.staircases.push(staircase.refId)
        }
      })

      // Link staircase and staircaseSteps
      staircaseSteps?.objects?.forEach((step) => {
        if (checkContainment(staircase, step, staircase3)) {
          // eslint-disable-next-line no-param-reassign
          if (!staircase.steps) staircase.steps = []
          staircase.steps.push(step.refId)
          curatedStaircase.steps.push(step.refId)
          if (step.text) {
            curatedStaircase.text = step.text
          }
        }
      })

      if (staircase?.sibling) {
        UserData.copy({ userData: curatedStaircase }, staircase3)
      }
      curatedStaircases.push(curatedStaircase)
    })
    this.curatedStaircaseData = curatedStaircases
    console.log(layers3, roomsLayer, 'layers3--')
    // Curated rooms
    const roomsLayer3 = layers3.filter((item) => roomsLayer.refId === UserData.getRefId(item))?.[0]
    const furnishingsLayer3 = roomItems
      ? layers3.filter((item) => roomItems.refId === UserData.getRefId(item))?.[0]
      : null

    // Loop over all rooms
    roomsLayer?.objects?.forEach((room) => {
      const room3 = UserData.findByRefId(roomsLayer3, room.refId)
      console.log(room3, 'room3--')
      if (!room3) return

      const curatedRoom = {
        refId: room.refId,
        label: '',
        dimensions: {
          width: '',
          height: '',
          unit: '',
        },
        // hotspots: [],
        siblings: [], // uuid of associated threejs objects
        siblingsPosition: [], //
        furnishings: [],
        transitions: [],
        box: room.box,
        position: room.position,
      }
      // filled regions
      if (room.sibling) {
        curatedRoom.siblings.push(room.sibling)
        curatedRoom.siblingsPosition.push(room.siblingPosition)
      }

      // hotspots
      cameras?.objects?.forEach((hotspot) => {
        if (checkContainment(room, hotspot, room3)) {
          // eslint-disable-next-line no-param-reassign
          // if (!room.hotspots) room.hotspots = []
          // room.hotspots.push(hotspot.refId)

          const position = hotspot.position || hotspot.box?.getCenter(new THREE.Vector3())
          // curatedRoom.hotspots.push({
          //   refId: hotspot.refId,
          //   position,
          //   panorama: null,
          //   label: hotspot.text,
          // })

          if (hotspot.sibling) {
            curatedRoom.siblings.push(hotspot.sibling)
            curatedRoom.siblingsPosition.push(hotspot.siblingPosition)
          }
        }
      })

      // transitions - (touching to the room / inside the room)
      curatedTransitions.forEach((transition) => {
        if (
          checkPointOnBoundary(room3, transition.position, EPSILON_WALL_THICKNESS) ||
          checkContainment(room, transition, room3)
        ) {
          transition.rooms.push(curatedRoom.refId)
          curatedRoom.transitions.push(transition.refId)
        }
      })

      // furnishings - exclude area/perimeter
      const furnishings3 = []
      roomItems?.objects?.forEach((furniture) => {
        if (checkContainment(room, furniture, room3)) {
          // eslint-disable-next-line no-param-reassign
          if (!room.furnishings) room.furnishings = []
          room.furnishings.push(furniture.refId)

          const position = furniture.position || furniture.box?.getCenter(new THREE.Vector3())
          curatedRoom.furnishings.push({
            refId: furniture.refId,
            position,
          })
          const obj3 = UserData.findByRefId(furnishingsLayer3, furniture.refId)
          if (obj3) furnishings3.push(obj3)
        }
      })

      // Compute area, perimeter, netArea, netPerimeter
      curatedRoom.dimensions = {
        ...curatedRoom.dimensions,
        ...ShapeUtil.computeRegionAreaAndPerimeter(room3, furnishings3),
      }

      // dimensions
      dimensions?.objects?.forEach((dimension) => {
        if (checkContainment(room, dimension, room3)) {
          const { text, refId } = dimension
          // eslint-disable-next-line no-param-reassign
          if (!room.dimensions) room.dimensions = []
          room.dimensions.push(refId)

          const { width, height, label, unit } = UnitsUtil.parseDimension(text)
          if (width && !curatedRoom.dimensions.width) curatedRoom.dimensions.width = width
          if (height && !curatedRoom.dimensions.height) curatedRoom.dimensions.height = height
          // If not yet fixed in the previous iteration then do that
          if (unit && !curatedRoom.dimensions.unit) {
            curatedRoom.dimensions.unit = unit
            // NOTE: DXF data is in INCHES and so convert the same to FEET

            if (curatedRoom.dimensions.area) {
              // conversion from sqinch to sqft
              curatedRoom.dimensions.area /= 12 * 12
            }
            if (curatedRoom.dimensions.netArea) {
              // conversion from sqinch to sqft
              curatedRoom.dimensions.netArea /= 12 * 12
            }
            if (curatedRoom.dimensions.perimeter) {
              // conversion from inch to ft
              curatedRoom.dimensions.perimeter /= 12
            }
            if (curatedRoom.dimensions.netPerimeter) {
              // conversion from inch to ft
              curatedRoom.dimensions.netPerimeter /= 12
            }
          }
          if (label) {
            if (curatedRoom.label) curatedRoom.label = `${curatedRoom.label} ${label}`
            else curatedRoom.label = label
          }
          if (dimension.sibling) {
            curatedRoom.siblings.push(dimension.sibling)
            curatedRoom.siblingsPosition.push(dimension.siblingPosition)
          }
        }
      })

      if (curatedRoom.label) room3.name = curatedRoom.label
      curatedRoom.level = level

      // Attached curatedRoom (siblings etc) as userData
      UserData.copy({ userData: curatedRoom }, room3)
      curatedData.push(curatedRoom)
    })

    this.curatedRoomData = curatedData

    const walls = layers3.filter((item) => item.name === 'walls')?.[0]
    // this.curatedHotspotData = LayerManager.prepareHotspotData(curatedData, [walls], level)
    return this
  }

  // static prepareHotspotData(curatedRoomData, walls, level) {
  //   if (!curatedRoomData) return []
  //   const hotspotsData = []
  //   curatedRoomData.forEach((room) => {
  //     const { hotspots, refId: roomId } = room
  //     hotspots?.forEach((hs) => {
  //       if (hotspotsData.findIndex((item) => item.refId === hs.refId) !== -1) return
  //       // Update the same hotspot object
  //       hs.id = hs.refId
  //       hs.roomId = roomId
  //       hs.panorama = null
  //       hs.hotspotsInProximity = []
  //       hs.hotspotsInProximityFarWallDistance = [] // distance from current hotspot to the wall behind (away/farther) the proximity hotspot
  //       hs.hotspotsInProximityNearWallDistance = []
  //       hs.level = level
  //       hotspotsData.push(hs)
  //     })
  //   })

  //   ShapeUtil.fillHotspotsInProximity(hotspotsData, walls)

  //   return hotspotsData
  // }

  static convertLayerToSvg(object3, allLayers) {
    const layerName = object3.name
    if (layerName === 'walls') {
      const nodes = object3.children.map((line) => {
        const node = SvgUtil.fromThree(line, true)
        SvgUtil.applyStylesFrom(node, line)
        return node
      })
      if (nodes?.length) return LayerManager.createSvgGroup(nodes, object3)
      return object3
    }
    if (layerName === 'doors') {
      const nodes = object3.children.map((line) => {
        const node = SvgUtil.fromThree(line)
        SvgUtil.applyStylesFrom(node, line)
        return node
      })
      if (nodes?.length) return LayerManager.createSvgGroup(nodes, object3)
      return object3
    }
    if (layerName === 'glazes') {
      const nodes = object3.children
        .map((line) => {
          const node = SvgUtil.fromThree(line)
          SvgUtil.applyStylesFrom(node, line)
          return node
        })
        .filter((item) => !!item)
      if (nodes?.length) return LayerManager.createSvgGroup(nodes, object3)
      return object3
    }
    if (layerName === 'staircases') {
      const staircases = []
      object3.children.forEach((line) => {
        const node = SvgUtil.fromThree(line)
        if (node) {
          SvgUtil.applyStylesFrom(node, line)
          const sc = LayerManager.createSvgGroup([node], line)
          if (sc) {
            sc.name = 'staircase'
            staircases.push(sc)
          }
        }
      })
      if (staircases?.length) {
        const result = new THREE.Group()
        result.add(...staircases)
        result.userData = object3.userData
        result.name = object3.name
        return result
      }
      return object3
    }
    if (layerName.startsWith('staircaseSteps')) {
      const staircaseSteps = []
      object3.children.forEach((line) => {
        const node = SvgUtil.fromThree(line)
        if (node) {
          SvgUtil.applyStylesFrom(node, line)
          const sc = LayerManager.createSvgGroup([node], line)
          if (sc) {
            sc.name = 'staircaseStep'
            staircaseSteps.push(sc)
          }
        }
      })
      if (staircaseSteps?.length) {
        const result = new THREE.Group()
        result.add(...staircaseSteps)
        result.userData = object3.userData
        result.name = object3.name
        return result
      }
      return object3
    }
    if (layerName.startsWith('transitions')) {
      const transitions = []
      object3.children.forEach((line) => {
        try {
          const node = SvgUtil.fromThree(line)
          SvgUtil.applyStylesFrom(node, line)
          const transition = LayerManager.createSvgGroup([node], line)
          if (transition) transitions.push(transition)
        } catch (err) {
          // console.error(err)
        }
      })
      if (transitions?.length) {
        const result = new THREE.Group()
        result.add(...transitions)
        result.userData = object3.userData
        result.name = object3.name || 'transition'
        return result
      }
      return object3
    }

    // if (layerName === 'cameras') {
    //   const refIdsToRender = allLayers[layerName]?.objects?.map((obj) => obj.refId)
    //   const deep = false
    //   if (deep) {
    //     const nodes = []
    //     object3.children.forEach((icon) => {
    //       const refId = UserData.getRefId(icon)
    //       if (refIdsToRender.includes(refId)) {
    //         const node = SvgUtil.createCircle(icon.position, 5)
    //         SvgUtil.applyStylesFrom(node, icon)
    //         nodes.push(node)
    //       }
    //     })
    //     if (nodes?.length) return LayerManager.createSvgGroup(nodes, object3)
    //   } else {
    //     const cirles3 = []
    //     object3.children.forEach((icon) => {
    //       const refId = UserData.getRefId(icon)
    //       if (refIdsToRender.includes(refId)) {
    //         const node = SvgUtil.createCircle(icon.position, 5)
    //         SvgUtil.applyStylesFrom(node, icon)
    //         const cirle3 = LayerManager.createSvgGroup([node], icon)
    //         cirles3.push(cirle3)
    //       }
    //     })
    //     if (cirles3?.length) {
    //       const result = new THREE.Group()
    //       result.add(...cirles3)
    //       result.userData = object3.userData
    //       result.name = object3.name || 'hotspot'
    //       return result
    //     }
    //   }
    //   return object3
    // }

    console.debug(`Skipping ${layerName}`)
    return null
  }

  toJson() {
    // all but layers3
    const { layers3, ...restProps } = this
    // console.log(this)
    return restProps
  }

  toThree(isSvg, grouping = true, svgConversion = true) {
    // STAGE: 1 Parse layer3 to threejs
    const checkSvgEntity = (ent) => {
      const { material, geometry } = ent
      if (!geometry && !material) return true // group or object3d
      if (!geometry || !material) return false // incomplete / unsupported

      if (
        material instanceof THREE.LineBasicMaterial ||
        material instanceof THREE.LineDashedMaterial
      )
        return true

      if (material instanceof THREE.MeshBasicMaterial) {
        if (geometry instanceof THREE.InstancedBufferGeometry) return false
        return true
      }

      // unsupported
      return false
    }

    const checkThreeEntity = (ent) => {
      if (ent.isSVGObject) return false
      return true
    }

    const checkEntity = (ent) => {
      if (!ent) return false
      if (isSvg) return checkSvgEntity(ent)
      return checkThreeEntity(ent)
    }

    // Filter entities based on compatibility
    const entitiesIn = this.layers3

    const entities = []
    const tobeRemoved = []
    entitiesIn.forEach((item) => {
      item?.traverse((child) => {
        if (checkEntity(child)) {
          if (item === child) entities.push(item)
        } else if (child.parent) tobeRemoved.push(child)
      })
    })
    tobeRemoved.forEach((child) => child.parent.remove(child))

    const needGrouping = grouping && isSvg
    if (!needGrouping) return entities

    // Make sure all entities are part of same root!
    const root = new THREE.Group()
    root.name = 'floorplan'
    entities.forEach((ent) => root.add(ent))

    // STAGE: 2 Grouping room to svg

    // Attempt to group the entities siblings (i.e. room has sibling attribute)
    const groupedNodes = []
    entities.forEach((item) => {
      item?.traverse((child) => {
        const siblings = child.userData?.siblings
        if (siblings?.length) {
          const nodes = []
          const originals = []
          let node = SvgUtil.fromThree(child, true)
          if (node) {
            nodes.push(node)
            originals.push(child)
          } else {
            console.warn('Child object not found!')
          }
          siblings.forEach((uuid) => {
            const object = root.getObjectByProperty('uuid', uuid)
            if (originals[0] === child && object.name?.endsWith('Filled')) {
              // skip this and apply fill settings
              SvgUtil.applyStylesFrom(nodes[0], object)

              originals.push(object)
            } else {
              node = SvgUtil.fromThree(object)
              if (node) {
                nodes.push(node)
                originals.push(object)
              } else {
                console.warn('Sibling object not found!')
              }
            }
          })

          if (nodes.length) {
            groupedNodes.push({
              nodes,
              originals,
            })
          }
        }
      })
    })

    // apply changes in root now
    const rooms = new THREE.Group() // LayerManager.createSvgGroup([])
    rooms.name = 'rooms'
    root.add(rooms)
    groupedNodes.forEach((item) => {
      const { nodes, originals } = item
      // Note: first one is room
      const group = LayerManager.createSvgGroup(nodes, originals[0])
      if (group) {
        rooms.attach(group)
        originals.forEach((obj) => obj?.parent?.remove(obj))
      }
    })

    if (!svgConversion) return [root]

    // STAGE: 3 Conversion to svg

    // Convert remaining layers to svg objects
    const toRemove = []
    const toAdd = []
    const allLayers = this.layers
    root.children.forEach((child) => {
      if (!child.isSVGObject && child !== rooms) {
        if (child.children.length) {
          const converted = LayerManager.convertLayerToSvg(child, allLayers)
          if (converted && converted !== child) toAdd.push(converted)
          if (converted !== child) toRemove.push(child)
        } else {
          toRemove.push(child)
        }
      }
    })
    toAdd.forEach((item) => root.add(item))
    toRemove.forEach((item) => root.remove(item))

    const names = ['staircaseSteps', 'staircaseStepsLabels', 'transitionsLabels']
    const moveToEnd = []
    root.children.forEach((child) => {
      if (names.includes(child.name)) {
        moveToEnd.push(child)
      }
    })
    moveToEnd.forEach((item) => root.remove(item))
    moveToEnd.forEach((item) => root.add(item))

    console.debug('scene', this.label, root)
    return [root]
  }

  static createSvgGroup(nodes, original) {
    const group = SvgUtil.toThree(SvgUtil.createGroup(nodes), original)
    const refId = UserData.getRefId(original)
    if (refId) UserData.setRefId(group, refId)
    return group
  }
}

export { LayerManager }
