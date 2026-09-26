import { createRoot } from 'react-dom/client'
import browser from 'webextension-polyfill'
import App from '../content/App'
import React from 'react'
import '../globals.css'

const handleSubmit = (value: string) => {
  const newChatButton =
    document.querySelector<HTMLButtonElement>(
      "button[data-testid='create-new-chat-button'], button[aria-label='New chat']",
    ) ||
    [...document.querySelectorAll<HTMLButtonElement>('button')].find(
      (button) => button.textContent?.trim() === 'New chat',
    )
  newChatButton?.click()

  // Wait for the new-chat composer to render
  setTimeout(() => {
    const editor = document.querySelector<HTMLElement>(
      "[data-composer-markdown][contenteditable='true'], #prompt-textarea[contenteditable='true']",
    )
    if (!editor) return

    editor.focus()
    document.execCommand('selectAll', false)
    if (!document.execCommand('insertText', false, value)) return

    const send = () => {
      const button =
        editor.closest('form')?.querySelector<HTMLButtonElement>("button[type='submit']") ||
        document.querySelector<HTMLButtonElement>(
          "button[data-testid='send-button'], button[aria-label='Send'], button[aria-label='Send prompt'], button[aria-label='Send message']",
        )
      if (!button || button.disabled || button.getAttribute('aria-disabled') === 'true') return

      observer.disconnect()
      clearTimeout(timeout)
      button.click()
    }

    const observer = new MutationObserver(send)
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['disabled', 'aria-disabled'],
    })
    const timeout = window.setTimeout(() => observer.disconnect(), 3000)
    requestAnimationFrame(send)
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
