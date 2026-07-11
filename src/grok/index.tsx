import { createRoot } from 'react-dom/client'
import browser from 'webextension-polyfill'
import App from '../content/App'
import React from 'react'
import '../globals.css'

const getEditor = () =>
  (document.querySelector(
    "div.ProseMirror[contenteditable='true'][aria-label='Ask Grok anything']",
  ) || document.querySelector("div.ProseMirror[contenteditable='true']")) as HTMLElement | null

const handleSubmit = (value: string) => {
  // Start a new chat so the question is asked in a fresh conversation. Grok's
  // "New Chat" sidebar entry is an anchor to "/" identified only by its label.
  ;(
    [...document.querySelectorAll("a[href='/']")].find(
      (a) => a.textContent?.trim() === 'New Chat',
    ) as HTMLAnchorElement | undefined
  )?.click()

  // Wait for the new chat composer to render
  setTimeout(() => {
    const editor = getEditor()

    if (editor) {
      editor.focus()
      // The composer is a TipTap/ProseMirror editor that owns its state, so
      // drive it through editing commands instead of assigning innerHTML.
      document.execCommand('selectAll', false)
      document.execCommand('insertText', false, value)
    }

    // Give ProseMirror a tick to sync state so the send button enables
    setTimeout(() => {
      const sendButton = document.querySelector(
        "button[data-testid='chat-submit']",
      ) as HTMLButtonElement
      sendButton?.click()
    }, 200)
  }, 800)
}

const PANEL_WIDTH = 350

const extensionRoot = document.createElement('div')
extensionRoot.id = 'chatgpt-template'
extensionRoot.style.cssText = `position:fixed;top:0;right:0;width:${PANEL_WIDTH}px;height:100vh;overflow-y:auto;z-index:2147483647;border-left:1px solid rgba(255,255,255,0.1);`

// Grok's TipTap composer grabs focus on document-level keystrokes, so keep
// keyboard events inside our panel to stop typing here from jumping focus back
// to Grok's input. React's handlers run inside the shadow tree before the event
// reaches this host, so submitting still works.
;['keydown', 'keyup', 'keypress', 'beforeinput'].forEach((type) => {
  extensionRoot.addEventListener(type, (e) => e.stopPropagation())
})

const shadowRoot = extensionRoot.attachShadow({ mode: 'open' })

const styleLink = document.createElement('link')
styleLink.rel = 'stylesheet'
styleLink.href = browser.runtime.getURL('grok_content.css')
shadowRoot.appendChild(styleLink)

const mountPoint = document.createElement('div')
shadowRoot.appendChild(mountPoint)

// Grok centers its conversation and sticky composer inside #grok-content-area,
// the full-height region beside the sidebar. Padding its right edge shrinks that
// region so everything re-centers into the space left of the panel.
const findContentColumn = (): HTMLElement | null =>
  document.getElementById('grok-content-area')

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
  // Grok re-renders the content area on navigation (including our own "New Chat"
  // click), so re-apply the reservation whenever the DOM changes.
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
