import Helvetiker from './helvetiker_regular.blob'

const getContentUrl = (json) => {
  const blob = new Blob([JSON.stringify(json)], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  return url
}

const Fonts = {
  Helvetiker: getContentUrl(Helvetiker),
}

export { Fonts }
