const TEXT_STYLE = {
  lineColor: 'black',
  lineWidth: 0.1,
  fontFamily: "'poppins', sans-serif",
  fontSize: '13px',
  fontWeight: 'normal',
  textTransform: 'uppercase',
}

// Target to source
const target2Source = Object.freeze({
  levels: {
    source: ['Floor Level'],
    hasLabels: true,
  },
  dimensions: {
    // dimension of rooms
    source: ['Room Labels'],
    hasLabels: true,
    renderLabels: TEXT_STYLE, // create renderable svg-object from text
  },
  rooms: {
    // rooms
    source: ['Room Borders'],
    hasGeometry: true,
    fill: true,
    fillColor: '#fff9e3',
    lineColor: 'blue',
    lineWidth: 1,
    lineDash: 3,
  },
  roomItems: {
    // items e.g. furniture kept in the room
    source: ['Room Item'],
    hasGeometry: true,
    fill: true,
    fillColor: '#b5d3c2',
    lineColor: '#b5d3c2',
    lineWidth: 1,
  },
  cameras: {
    // hotspots
    source: ['Cam'],
    hasLabels: true,
    lineColor: '#b5d3c2',
    lineWidth: 1,
    fillColor: '#b5d3c2',
  },
  doors: {
    // doors
    source: ['A-DOOR'],
    hasGeometry: true,
    lineColor: 'black',
    lineWidth: 1,
  },
  glazes: {
    // windows
    source: ['A-GLAZ'],
    hasGeometry: true,
    lineColor: '#4fb0e2',
    lineWidth: 6,
  },
  walls: {
    // walls
    source: ['A-WALL'],
    hasGeometry: true,
    fill: true,
    fillColor: 'black',
    lineColor: 'black',
    lineWidth: 1,
  },
  staircaseSteps: {
    // staircaseSteps
    source: ['Staircase'],
    hasGeometry: true,
    hasLabels: true,
    renderLabels: {
      // create renderable svg-object from text
      ...TEXT_STYLE,
      fontSize: '4px',
    },
    lineColor: '#979797', // '#4fb0e2',
    lineWidth: 1,
  },
  staircases: {
    // staircases
    source: ['Staircase Border'],
    hasGeometry: true,
    lineColor: '#d5d5d5', //  '#979797'
    lineWidth: 1,
    fill: true,
    fillColor: '#d5d5d5', // '#d5d5d5', // or white
  },
  transitions: {
    // transitions
    source: ['Transition'],
    hasGeometry: true,
    hasLabels: true,
    renderLabels: {
      // create renderable svg-object from text
      ...TEXT_STYLE,
      fontSize: '4px',
    },
    // lineColor: '#4fb0e2',
    lineColor: 'red',
    lineWidth: 6,
  },
})

// Source to target
const source2Target = {}
Object.keys(target2Source).forEach((layer) => {
  const { source, ...rest } = target2Source[layer]
  source.forEach((src) => {
    source2Target[src] = { layer, ...rest }
  })
})

const LayerMapper = {
  target2Source,
  source2Target,
  sources: Object.freeze(Object.keys(source2Target)),
  targets: Object.freeze(Object.keys(target2Source)),
}

export { LayerMapper }
