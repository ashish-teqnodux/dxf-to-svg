import React from 'react'
import PropTypes from 'prop-types'
import { FileData } from '../../hooks/use-file-data'
import { FloorplanLoader } from './floorplan-loader'
import { useSpinner } from '../../stores'

const FLOORPLAN = 'floorplan'

function SessionLoader(props) {
  const { onLoad, setFileData } = props
  const setLoadingStarted = useSpinner((state) => state.setLoadingStarted)
  const setLoadingEnded = useSpinner((state) => state.setLoadingEnded)
  const loadingStatus = useSpinner((state) => state.loading)

  const fileData = new FileData()

  React.useLayoutEffect(() => {
    setLoadingStarted(FLOORPLAN)
  }, [setLoadingStarted])

  const onLoadFloorplan = React.useCallback(
    (data, fileData) => {
      setLoadingEnded(FLOORPLAN)
      onLoad(!!data)
      setFileData(fileData)
    },
    [onLoad, setLoadingEnded]
  )

  const isLoading = React.useMemo(
    () => Object.keys(loadingStatus).some((key) => loadingStatus[key]),
    [loadingStatus]
  )

  if (!fileData) return null

  return (
    <>
      {isLoading && <div>{/* <Spin spinning={isLoading} /> */}</div>}
      <FloorplanLoader data={fileData} onLoad={onLoadFloorplan} svgGl />
    </>
  )
}

SessionLoader.propTypes = {
  onLoad: PropTypes.func,
  data: PropTypes.instanceOf(FileData),
}

SessionLoader.defaultProps = {
  onLoad: () => {},
  data: null,
}

export { SessionLoader }
