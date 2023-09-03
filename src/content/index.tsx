import { createRoot } from 'react-dom/client'
import App from './App'

const chatWindow = document.getElementById('__next')?.querySelector('.w-full.h-full')
const extensionRoot = document.createElement('div')
extensionRoot.id = 'chatgpt-template'
extensionRoot.style.width = '350px'
chatWindow?.appendChild(extensionRoot)
createRoot(extensionRoot).render(<App />)
