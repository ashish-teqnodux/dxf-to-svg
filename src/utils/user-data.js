/* eslint-disable no-param-reassign */
class UserData {
  static setRefId(object, refId) {
    if (!object) return
    if (!object.userData) object.userData = {}
    object.userData.refId = refId
  }

  static getRefId(object) {
    if (!object) return null
    if (!object.userData) return null
    return object.userData.refId
  }

  static findByRefId(scene, refId) {
    let obj = null
    scene.traverse((object) => {
      if (obj) return
      if (!object.userData) return

      if (!object.userData.refId) return

      if (object.userData.refId === refId) obj = object
    })
    return obj
  }

  static setStyle(object, style) {
    if (!object) return
    if (!object.userData) object.userData = {}
    object.userData.style = style
  }

  static getStyle(object) {
    if (!object) return null
    if (!object.userData) return null
    return object.userData.style
  }

  static copy(from, to) {
    if (!from || !to) return
    if (!from.userData) return
    if (!to.userData) to.userData = {}
    to.userData = { ...to.userData, ...from.userData }
  }
}

export { UserData }
