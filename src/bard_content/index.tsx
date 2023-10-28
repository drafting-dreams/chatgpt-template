import { createRoot } from 'react-dom/client'
import { initializeExtension } from '../utils'
import App from './App'

const extensionContainerSelector = () => document.getElementsByTagName('chat-window')[0]

const initialization = (container: Element) => {
  const extensionRoot = document.createElement('div')
  extensionRoot.id = 'bard-template'
  extensionRoot.style.width = '350px'
  container.appendChild(extensionRoot)
  createRoot(extensionRoot).render(<App />)
}

const handleTimeout = () => {
  console.log('Bard template extension >>> Initialization timeout')
}

initializeExtension({ extensionContainerSelector, initialization, onTimeout: handleTimeout })
