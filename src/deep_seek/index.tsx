import { createRoot } from 'react-dom/client'
import browser from 'webextension-polyfill'
import App from '../content/App'
import React from 'react'
import '../globals.css'

function findTextNodeAndParent(root, searchText) {
  const results = []
  const iterator = document.createNodeIterator(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      if (node.nodeValue.trim().toLowerCase() === searchText.toLowerCase()) {
        return NodeFilter.FILTER_ACCEPT
      }
      return NodeFilter.FILTER_SKIP
    },
  })

  let currentNode
  while ((currentNode = iterator.nextNode())) {
    results.push({
      textNode: currentNode,
      parentElement: currentNode.parentNode,
    })
  }
  return results
}

const handleSubmit = (value: string) => {
  // Clear Chat history
  findTextNodeAndParent(document.body, 'new chat')[0]?.parentElement?.click()

  // Wait for some time to let the page refresh after clearing the chat history
  setTimeout(() => {
    const textarea = document.querySelector('textarea')

    // if (promptTextArea) promptTextArea.innerHTML = value
    if (textarea) {
      textarea.focus()
      textarea.value = value
      textarea.dispatchEvent(new Event('input', { bubbles: true }))
    }

    setTimeout(() => {
      ;(
        (textarea?.parentElement?.nextElementSibling?.lastChild as HTMLElement)?.querySelector(
          'div[role="button"]',
        ) as HTMLDivElement
      ).click()
    }, 200)
  }, 800)
}

const extensionRoot = document.createElement('div')
extensionRoot.id = 'chatgpt-template'
extensionRoot.style.width = '350px'

const shadowRoot = extensionRoot.attachShadow({ mode: 'open' })

const styleLink = document.createElement('link')
styleLink.rel = 'stylesheet'
styleLink.href = browser.runtime.getURL('deep_seek_content.css')
shadowRoot.appendChild(styleLink)

const mountPoint = document.createElement('div')
shadowRoot.appendChild(mountPoint)

setTimeout(() => {
  const wrapper = document.getElementById('root')?.firstElementChild
  if (wrapper) {
    ;(wrapper as HTMLElement).style.position = 'fixed'
  }
  const chatWindow = wrapper?.lastElementChild
  chatWindow?.appendChild(extensionRoot)
  createRoot(mountPoint).render(<App onSubmit={handleSubmit} />)
}, 1000)
