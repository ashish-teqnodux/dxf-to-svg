class FileUtil {
  static async importFromFile(file, readerType) {
    if (!file) return new Error('Invalid file')
    const data = await FileUtil.readFile(file.originFileObj || file, readerType)
    const filename = file.name
    const extension = filename.split('.').pop().toLowerCase()
    return {
      data,
      dataType: readerType,
      filename,
      extension,
    }
  }

  static async importFromUrl(url, readerType) {
    if (!url) return new Error('Invalid Url')
    const response = await fetch(url)
    const blob = await response.blob()
    const data = await FileUtil.readFile(blob, readerType)
    return data
  }

  static readFile(file, readerType) {
    return new Promise((resolve, reject) => {
      if (readerType === 'blobUrl') {
        const url = URL.createObjectURL(file)
        resolve(url)
        return
      }

      const fileReader = new FileReader()
      fileReader.onload = (event) => resolve(event.target.result)
      fileReader.onerror = () => reject(new Error('Failed to load data'))
      switch (readerType) {
        case 'arrayBuffer':
          fileReader.readAsArrayBuffer(file)
          break
        case 'binaryString':
          fileReader.readAsBinaryString(file)
          break
        case 'text':
          fileReader.readAsText(file)
          break
        case 'dataUrl':
        default:
          fileReader.readAsDataURL(file)
          break
      }
    })
  }
}

export { FileUtil }
