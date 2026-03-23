import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#131622',
            color: '#e2e8f0',
            border: '1px solid #252a3d',
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#131622' },
          },
          error: {
            iconTheme: { primary: '#f43f5e', secondary: '#131622' },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
