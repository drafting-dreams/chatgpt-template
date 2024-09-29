import { createRoot } from 'react-dom/client'
import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import App from '../content/App'

const handleSubmit = (value: string) => {
  // Clear Chat history
  const aTags = document.getElementsByTagName('a')
  aTags[0].click()

  // Wait for some time to let the page refresh after clearing the chat history
  setTimeout(() => {
    const promptTextArea = document.getElementById('prompt-textarea') as HTMLTextAreaElement

    // To trigger the input event in react
    // https://stackoverflow.com/questions/23892547/what-is-the-best-way-to-trigger-change-or-input-event-in-react-js
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      'value',
    )!.set as any
    nativeInputValueSetter.call(promptTextArea, value)
    promptTextArea.dispatchEvent(new Event('input', { bubbles: true }))

    const sendButton = document.querySelector(
      "[data-testid='fruitjuice-send-button']",
    ) as HTMLButtonElement
    sendButton.click()
  }, 150)
}

const extensionRoot = document.createElement('div')
extensionRoot.id = 'chatgpt-template'
extensionRoot.style.width = '350px'
const cache = createCache({
  key: 'css',
  container: extensionRoot,
})

setTimeout(() => {
  const chatWindow = document.querySelector('.w-full.h-full')
  chatWindow?.appendChild(extensionRoot)
  createRoot(extensionRoot).render(
    <CacheProvider value={cache}>
      <App onSubmit={handleSubmit} />
    </CacheProvider>,
  )
}, 1000)
