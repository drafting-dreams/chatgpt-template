import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

const extensionRoot = document.createElement('div')
document.getElementById('app')!.appendChild(extensionRoot)
createRoot(extensionRoot).render(<App />)
