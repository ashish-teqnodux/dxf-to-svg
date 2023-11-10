/* eslint-disable max-classes-per-file */
/* eslint-disable no-param-reassign */
import { v4 as generateId } from 'uuid'
import React from 'react'

const DEBUG = true
const FileObjectTypes = { panorama: 'panorama', floorplan: 'floorplan', zip: 'zip' }
const FileObjectExtensions = { panorama: ['png', 'jpg', 'jpeg'], floorplan: ['dxf'], zip: ['zip'] }
// const ImageUrlType = 'dataUrl'
const ImageUrlType = 'blobUrl'
const FileObjectReaderTypes = { panorama: ImageUrlType, floorplan: ImageUrlType, zip: ImageUrlType }

class FileObject {
  constructor({ data, dataType, filename, extension, type }) {
    this.data = data // file data
    this.dataType = dataType // reader type
    this.filename = filename
    this.extension = extension
    this.type = type // floorplan, panorama
    this.id = generateId()
  }
}

class FileData {
  constructor(data) {
    this.clearFileData()
    this.setFileData(data)
  }

  setFileData(data) {
    if (!data) return
    const { type } = data
    if (FileObjectTypes[type]) {
      this[type].push(new FileObject(data))
    }
  }

  addLevel(level, isSvg) {
    if (!level) return

    const levelId = level.id
    if (levelId && !this.levelIds.includes(levelId)) {
      const {
        id,
        curatedHotspotData,
        curatedRoomData,
        bounds,
        label,
        curatedTransitionData,
        curatedStaircaseData,
      } = level.toJson()

      this.levelIds.push(levelId)
      this.levels.push({
        id,
        curatedHotspotData,
        curatedRoomData,
        curatedTransitionData,
        curatedStaircaseData,
        bounds,
        label,
      })
      this.three[levelId] = level.toThree(isSvg)
      if (DEBUG) this.debugRaw[levelId] = level
    }

    console.debug('FileData', this)
  }

  clearFileData() {
    this.panorama = [] // source files for panorama
    this.floorplan = [] // source files for floorplan
    this.levels = [] // instances of level
    this.levelIds = [] // ids of level
    this.three = {} // map from id of level to entities
    this.debugRaw = {} // raw data for debugging purposes
  }
}

FileData.types = FileObjectTypes
FileData.extensions = FileObjectExtensions
FileData.readerTypes = FileObjectReaderTypes

const FileDataContext = React.createContext()

const useFileData = () => React.useContext(FileDataContext) || {}

export { FileData, useFileData, FileDataContext }
