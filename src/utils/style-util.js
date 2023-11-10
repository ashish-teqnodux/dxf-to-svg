class StyleUtil {
  static convert2Pixels(size, containerSize = 0) {
    if (!size) return 0
    if (size.toString().includes('px')) {
      const num = size.toString().replace('px', '')
      return Number(num)
    }
    if (
      size.toString().includes('%') ||
      size.toString().includes('vw') ||
      size.toString().includes('vh')
    ) {
      return (parseFloat(size) * containerSize) / 100
    }
    // if (size.toString().includes('calc')) {
    //   // 'calc(20vh-10px)' 'calc(50vw + 10)'
    //   let split = size.split('calc(')[0]
    //   split = split.replace(')', '')
    //   let operator = null
    //   split = split.split('-')
    //   if (split.length !== 1) operator = 'minus'
    //   else {
    //     split = split.split('+')
    //     if (split.length !== 1) operator = 'plus'
    //   }
    //   if (operator) {
    //     split = split.map(item => StyleUtil.convert2Pixels(item))
    //   }
    // }
    return size
  }

  static getElementSize(panel) {
    const height = panel?.getBoundingClientRect()?.height || 0
    const width = panel?.getBoundingClientRect()?.width || 0
    return { height, width }
  }

  static getElementSizeByClassName(contentClassname) {
    const panel = document.getElementsByClassName(contentClassname)?.[0]
    return StyleUtil.getElementSize(panel)
  }
}

export { StyleUtil }
