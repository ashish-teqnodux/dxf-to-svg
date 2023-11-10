import React from 'react'
import { SessionLoader } from '../components/loader'
import { FileDataContext } from '../hooks/use-file-data'
import { DxfToSvg } from '../components/dxf-to-svg'

function DxfRoute() {
  const [fileData, setFileData] = React.useState(null)
  const [hasSession, setHasSession] = React.useState(false)

  return (
    <>
      {!fileData && (
        <SessionLoader
          data={fileData}
          setFileData={setFileData}
          onLoad={() => setHasSession(true)}
        />
      )}
      {fileData && hasSession && (
        <FileDataContext.Provider value={fileData}>
          <DxfToSvg />
        </FileDataContext.Provider>
      )}
    </>
  )
}

export { DxfRoute }
