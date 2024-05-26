import { createRoot } from 'react-dom/client'
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

const chatWindow = document.getElementById('__next')?.querySelector('.w-full.h-full')
const extensionRoot = document.createElement('div')
extensionRoot.id = 'chatgpt-template'
extensionRoot.style.width = '350px'
chatWindow?.appendChild(extensionRoot)
createRoot(extensionRoot).render(<App onSubmit={handleSubmit} />)
