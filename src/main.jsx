import React from 'react'
import ReactDOM from 'react-dom/client'
import MainRoute from './MainRoute.jsx' // ✅ Use your new route file
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MainRoute />
  </React.StrictMode>,
)