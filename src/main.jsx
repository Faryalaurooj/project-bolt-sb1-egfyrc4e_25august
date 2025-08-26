import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import { CustomizationProvider } from './context/CustomizationContext'
import ToastContainer from './components/common/ToastContainer'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <CustomizationProvider>
        <App />
        <ToastContainer />
      </CustomizationProvider>
    </Router>
  </React.StrictMode>
)