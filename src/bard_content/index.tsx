import { createRoot } from 'react-dom/client'
import { initializeExtension } from '../utils'
import App from '../content/App'
import { injectScript } from './insertScript'
import browser from 'webextension-polyfill'

const handleSubmit = (value: string) => {
  // Clear Chat history
  const sendButton = document.querySelector("[data-test-id='new-chat']") as HTMLButtonElement
  sendButton.click()

  // Wait for some time to let the page refresh after clearing the chat history
  setTimeout(() => {
    setTimeout(() => {
      ;(document.querySelector('.ql-editor') as HTMLDivElement).focus()
      injectScript(browser.runtime.getURL('/bard_helper.js'), value).then(() => {
        const sendButton = document.querySelector(
          '[aria-label="Send message"]',
        ) as HTMLButtonElement
        sendButton.click()
      })
    }, 20)
  }, 150)
}

const extensionContainerSelector = () => document.getElementsByTagName('chat-window')[0]
const initialization = (container: Element) => {
  const extensionRoot = document.createElement('div')
  extensionRoot.id = 'bard-template'
  extensionRoot.style.width = '350px'
  container.appendChild(extensionRoot)
  createRoot(extensionRoot).render(<App onSubmit={handleSubmit} />)
}

const handleTimeout = () => {
  console.log('Bard template extension >>> Initialization timeout')
}

initializeExtension({ extensionContainerSelector, initialization, onTimeout: handleTimeout })
