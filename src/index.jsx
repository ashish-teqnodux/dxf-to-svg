import './polyfill'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import 'antd/dist/reset.css'
import { DxfRoute } from './routes/dxfRoute'

const root = createRoot(document.getElementById('root'))

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route exact path="/*" element={<DxfRoute />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
