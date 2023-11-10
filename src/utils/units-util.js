class UnitsUtil {
  static getSymbol(unit) {
    switch (unit) {
      case 'ft':
        return `'`
      case 'in':
        return `"`
      case 'm':
        return 'm'
      case 'cm':
        return 'cm'
      case 'mm':
        return 'mm'
      case 'sqft':
        return 'sqft'
      case 'sqm':
        return 'sqm'
      default:
        return null
    }
  }

  static getUnitSystem(symbol) {
    switch (symbol) {
      case "'":
      case '"':
      case 'ft':
      case 'in':
      case 'sqft':
        return 'imperial'
      case 'mm':
      case 'cm':
      case 'm':
      case 'sqm':
        return 'metric'
      default:
        return null
    }
  }

  static parseDimension(text) {
    const splitted = text?.split(' x ')
    if (splitted?.length > 1) {
      const [width, height] = splitted
      return {
        width: UnitsUtil.extractImperialNumber(width), // feet
        height: UnitsUtil.extractImperialNumber(height), // feet
        unit: UnitsUtil.extractUnitSystem(width) || UnitsUtil.extractUnitSystem(height),
      }
    }
    if (splitted[0]) {
      return { label: text }
    }
    return {}
  }

  static extractUnitSystem(text) {
    const match = text.match(/(\d*\.?\d+)\s?(in|mm|cm|m|'|"|ft+)/i)
    const len = match.length
    if (len) {
      return UnitsUtil.getUnitSystem(match[len - 1])
    }
    return null
  }

  static extractImperialNumber(text) {
    const calculateFeet = (text, isFeet) => {
      if (isFeet) return parseFloat(text)

      const numbers = text.split(' ').map((temp) => {
        const splitted = temp.split('/')
        const hasSlash = splitted.length > 1
        if (!hasSlash) return parseFloat(temp)
        return parseFloat(splitted[0]) / parseFloat(splitted[1])
      })

      const inch = numbers.reduce((total, current) => total + current, 0)
      return inch / 12
    }

    const splitedText = text.split(`'`)
    const hasFeet = splitedText.length > 1

    const numberText = splitedText.map((x) => x.trim()).filter((x) => !!x)
    const numbers = numberText.map((text, index) =>
      calculateFeet(text.replaceAll('-', '').replaceAll('"', ''), index === 0 && hasFeet)
    )
    const feet = numbers.reduce((total, current) => total + current, 0)
    return feet
  }
}

export { UnitsUtil }
