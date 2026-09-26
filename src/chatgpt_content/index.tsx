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

const PANEL_WIDTH = 350

const extensionRoot = document.createElement('div')
extensionRoot.id = 'chatgpt-template'
extensionRoot.style.cssText = `position:fixed;top:0;right:0;width:${PANEL_WIDTH}px;height:100vh;overflow-y:auto;z-index:2147483647;border-left:1px solid rgba(255,255,255,0.1);`

const shadowRoot = extensionRoot.attachShadow({ mode: 'open' })

const styleLink = document.createElement('link')
styleLink.rel = 'stylesheet'
styleLink.href = browser.runtime.getURL('chatgpt_content.css')
shadowRoot.appendChild(styleLink)

const mountPoint = document.createElement('div')
shadowRoot.appendChild(mountPoint)

// ChatGPT hydrates its server-rendered DOM with React 19, which only tolerates
// foreign nodes as direct children of <body>. Inserting the panel anywhere inside
// its tree (e.g. next to <main>) triggers hydration error #418, so the panel is
// fixed on <body> and space is reserved by padding the lowest full-width ancestor
// of the composer: the row holding the sidebar and chat column. The sidebar sits
// on the left, so only the chat column shrinks.
const findContentColumn = (): HTMLElement | null => {
  let node = (document.querySelector('#prompt-textarea') ||
    document.querySelector("[contenteditable='true']") ||
    document.querySelector('main')) as HTMLElement | null
  while (node && node !== document.body) {
    if (node.getBoundingClientRect().width >= document.documentElement.clientWidth - 2) return node
    node = node.parentElement
  }
  return null
}

let reservedColumn: HTMLElement | null = null
const reserveSpace = () => {
  if (
    reservedColumn &&
    document.contains(reservedColumn) &&
    reservedColumn.style.paddingRight === `${PANEL_WIDTH}px`
  ) {
    return
  }
  const column = findContentColumn()
  if (column) {
    column.style.paddingRight = `${PANEL_WIDTH}px`
    reservedColumn = column
  }
}

setTimeout(() => {
  document.body.appendChild(extensionRoot)
  createRoot(mountPoint).render(<App onSubmit={handleSubmit} />)

  reserveSpace()
  // ChatGPT may re-render its layout (navigation, hydration recovery), so
  // re-apply the reservation whenever the DOM changes.
  let scheduled = false
  const observer = new MutationObserver(() => {
    if (scheduled) return
    scheduled = true
    requestAnimationFrame(() => {
      scheduled = false
      reserveSpace()
    })
  })
  observer.observe(document.body, { childList: true, subtree: true })
}, 1000)
