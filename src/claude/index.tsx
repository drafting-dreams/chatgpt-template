import { createRoot } from 'react-dom/client'
import browser from 'webextension-polyfill'
import App from '../content/App'
import React from 'react'
import '../globals.css'

const getEditor = () =>
  (document.querySelector("[data-testid='chat-input']") ||
    document.querySelector("div.ProseMirror[contenteditable='true']")) as HTMLElement | null

const handleSubmit = (value: string) => {
  // Start a new chat so the question is asked in a fresh conversation
  ;((document.querySelector("a[href='/new'][aria-label='New chat']") ||
    document.querySelector("a[href='/new']")) as HTMLAnchorElement)?.click()

  // Wait for the new chat composer to render
  setTimeout(() => {
    const editor = getEditor()

    if (editor) {
      editor.focus()
      // The composer is a ProseMirror editor that owns its state, so drive it
      // through editing commands instead of assigning innerHTML directly.
      document.execCommand('selectAll', false)
      document.execCommand('insertText', false, value)
    }

    // Give ProseMirror a tick to sync state so the send button appears
    setTimeout(() => {
      const sendButton = document.querySelector(
        "button[aria-label='Send message']",
      ) as HTMLButtonElement
      sendButton?.click()
    }, 200)
  }, 800)
}

const PANEL_WIDTH = 350

const extensionRoot = document.createElement('div')
extensionRoot.id = 'chatgpt-template'
extensionRoot.style.cssText = `position:fixed;top:0;right:0;width:${PANEL_WIDTH}px;height:100vh;overflow-y:auto;z-index:2147483647;border-left:1px solid rgba(255,255,255,0.1);`

// claude.ai focuses its own composer on any keystroke via a document-level
// listener. Keep keyboard events inside our panel so typing here doesn't jump
// focus back to Claude's input. React's handlers run inside the shadow tree
// before the event reaches this host, so submitting still works.
;['keydown', 'keyup', 'keypress', 'beforeinput'].forEach((type) => {
  extensionRoot.addEventListener(type, (e) => e.stopPropagation())
})

const shadowRoot = extensionRoot.attachShadow({ mode: 'open' })

const styleLink = document.createElement('link')
styleLink.rel = 'stylesheet'
styleLink.href = browser.runtime.getURL('claude_content.css')
shadowRoot.appendChild(styleLink)

const mountPoint = document.createElement('div')
shadowRoot.appendChild(mountPoint)

// Claude's content column lives beside the sidebar inside a full-viewport-width
// flex row, so it is the composer ancestor that is narrower than that row. The
// conversation and the sticky composer are centered inside it, so padding its
// right edge re-centers everything into the space left of the panel.
const findContentColumn = (): HTMLElement | null => {
  let node = getEditor() as HTMLElement | null
  while (node && node.parentElement && node !== document.body) {
    const parent = node.parentElement
    const parentWidth = parent.getBoundingClientRect().width
    const nodeWidth = node.getBoundingClientRect().width
    if (parentWidth >= window.innerWidth - 2 && nodeWidth < parentWidth - 100) {
      return node
    }
    node = parent
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
  // Claude re-renders the content column on navigation (including our own "New
  // chat" click), so re-apply the reservation whenever the DOM changes.
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
