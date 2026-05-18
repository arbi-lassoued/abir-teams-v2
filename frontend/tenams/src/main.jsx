// import React from 'react';
// import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './context/AuthProvider';
// import { BrowserRouter } from 'react-router-dom';
import './index.css'
import App from './App'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <BrowserRouter> */}
    <AuthProvider>
      <App />
    </AuthProvider>
    {/* </BrowserRouter> */}
  </StrictMode>,
)


