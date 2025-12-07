import { createRoot } from 'react-dom/client'
import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import App from '../content/App'
import React from 'react'

const handleSubmit = (value: string) => {
  // Clear Chat history
  ;(document.querySelector("[data-testid='create-new-chat-button']") as HTMLButtonElement)?.click()

  // Wait for some time to let the page refresh after clearing the chat history
  setTimeout(() => {
    const promptTextArea = document.querySelector("[contenteditable='true']")

    if (promptTextArea) promptTextArea.innerHTML = value

    setTimeout(() => {
      const sendButton = document.querySelector("[data-testid='send-button']") as HTMLButtonElement
      sendButton.click()
    }, 200)
  }, 800)
}

const extensionRoot = document.createElement('div')
extensionRoot.id = 'chatgpt-template'
extensionRoot.style.width = '350px'
const cache = createCache({
  key: 'css',
  container: extensionRoot,
})

setTimeout(() => {
  const containerMain = document.querySelector('.\\@container\\/main')
  if (containerMain) {
    containerMain.insertAdjacentElement('afterend', extensionRoot)
  }
  createRoot(extensionRoot).render(
    <CacheProvider value={cache}>
      <App onSubmit={handleSubmit} />
    </CacheProvider>,
  )
}, 1000)
