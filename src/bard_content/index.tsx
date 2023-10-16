import { createRoot } from 'react-dom/client'
import App from './App'

const chatWindow = document.getElementsByTagName('chat-window')[0]
const extensionRoot = document.createElement('div')
extensionRoot.id = 'bard-template'
extensionRoot.style.width = '350px'
chatWindow?.appendChild(extensionRoot)
createRoot(extensionRoot).render(<App />)
