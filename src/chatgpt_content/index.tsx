import { createRoot } from 'react-dom/client'
import browser from 'webextension-polyfill'
import App from '../content/App'
import React from 'react'
import '../globals.css'

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

const shadowRoot = extensionRoot.attachShadow({ mode: 'open' })

const styleLink = document.createElement('link')
styleLink.rel = 'stylesheet'
styleLink.href = browser.runtime.getURL('chatgpt_content.css')
shadowRoot.appendChild(styleLink)

const mountPoint = document.createElement('div')
shadowRoot.appendChild(mountPoint)

setTimeout(() => {
  const containerMain = document.querySelector('.\\@container\\/main')
  if (containerMain) {
    containerMain.insertAdjacentElement('afterend', extensionRoot)
  }
  createRoot(mountPoint).render(<App onSubmit={handleSubmit} />)
}, 1000)
