import JSZip from 'jszip'
import { FileUtil } from './file-util'

class ZipUtil {
  static async unpackData(zip, filename, readerType = 'dataUrl') {
    const extension = filename.split('.').pop().toLowerCase()
    const blob = await zip.file(filename).async('blob')
    const url = await FileUtil.readFile(blob, readerType)
    return {
      data: url,
      dataType: readerType,
      filename,
      extension,
    }
  }

  static async unzip(file, readerType) {
    const data = await FileUtil.readFile(file.originFileObj || file, 'arrayBuffer')
    const zip = await JSZip.loadAsync(data)

    const output = []
    const promises = Object.keys(zip.files).map(async (key) => {
      try {
        const file = zip.file(key)
        if (file) {
          const filename = file.name
          if (!filename.startsWith('__MACOSX')) {
            const value = await ZipUtil.unpackData(zip, filename, readerType)
            if (value) output.push(value)
          }
        }
      } catch (error) {
        console.error(error)
      }
      return null // something
    })
    await Promise.all(promises)

    return output
  }
}

export { ZipUtil }
