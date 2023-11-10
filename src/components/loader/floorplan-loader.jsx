/* eslint-disable react/no-array-index-key */
/* eslint-disable react/jsx-no-useless-fragment */
import React from 'react'
import PropTypes from 'prop-types'
import 'three'
import { FileData } from '../../hooks/use-file-data'
import { DxfLoader } from './dxf-loader'

const dxfFile = [
  {
    id: '1',
    filename: 'floor1.dxf',
    data: 'https://field-visit.s3.ap-south-1.amazonaws.com/floor1.dxf',
  },
]

function FloorplanLoader(props) {
  const { data: fileData, onLoad, svgGl } = props

  // const dxfFiles = React.useMemo(
  //   () =>
  //     fileData?.floorplan?.filter(
  //       (file) =>
  //         file?.extension === 'dxf' &&
  //         (file.dataType === 'dataUrl' || file.dataType === 'blobUrl') &&
  //         file.data
  //     ),
  //   [fileData?.floorplan]
  // )

  const numDxf = dxfFile?.length || 0
  const levelsRef = React.useRef({})

  const onLoadItem = React.useCallback(
    (data) => {
      const { id, level } = data || {}
      if (id) {
        if (level) {
          fileData?.addLevel(level, svgGl)
        }
        levelsRef.current[id] = level
      }
      if (numDxf === Object.keys(levelsRef.current).length) {
        onLoad(levelsRef.current, fileData)
      }
    },
    [fileData, numDxf, onLoad, svgGl]
  )

  return (
    <>
      {dxfFile?.map((item) => (
        <React.Suspense key={item.id} fallback={null}>
          <DxfLoader key={item.id} id={item.filename} onLoad={onLoadItem} url={item.data} />
        </React.Suspense>
      ))}
    </>
  )
}

FloorplanLoader.propTypes = {
  data: PropTypes.instanceOf(FileData),
  onLoad: PropTypes.func,
  svgGl: PropTypes.bool,
}

FloorplanLoader.defaultProps = {
  data: null,
  onLoad: () => {},
  svgGl: true,
}

export { FloorplanLoader }
