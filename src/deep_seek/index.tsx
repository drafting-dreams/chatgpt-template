import { createRoot } from 'react-dom/client'
import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import App from '../content/App'
import React from 'react'

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
const cache = createCache({
  key: 'css',
  container: extensionRoot,
})

setTimeout(() => {
  const wrapper = document.getElementById('root')?.firstElementChild
  if (wrapper) {
    ;(wrapper as HTMLElement).style.position = 'fixed'
  }
  const chatWindow = wrapper?.lastElementChild
  chatWindow?.appendChild(extensionRoot)
  createRoot(extensionRoot).render(
    <CacheProvider value={cache}>
      <App onSubmit={handleSubmit} />
    </CacheProvider>,
  )
}, 1000)
