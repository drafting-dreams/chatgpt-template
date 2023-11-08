import { createRoot } from 'react-dom/client'
import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import { initializeExtension } from '../utils'
import App from '../content/App'

const handleSubmit = (value: string) => {
  const actionBar = document
    .querySelector('cib-serp')
    ?.shadowRoot?.querySelector('cib-action-bar')?.shadowRoot
  // Clear Chat history
  const clearButton = actionBar?.querySelector(
    'button[aria-label="New topic"]',
  ) as HTMLButtonElement
  clearButton.click()

  // Wait for some time to let the page refresh after clearing the chat history
  setTimeout(() => {
    const textarea = actionBar
      ?.querySelector('cib-text-input')
      ?.shadowRoot?.querySelector('textarea') as HTMLTextAreaElement
    textarea.value = value

    textarea.dispatchEvent(new Event('change'))

    requestAnimationFrame(() => {
      const sendButton = actionBar?.querySelector(
        'button[description="Submit"]',
      ) as HTMLButtonElement
      sendButton.click()
    })
  }, 150)
}

const extensionContainerSelector = () =>
  document
    .querySelector('cib-serp')
    ?.shadowRoot?.querySelector('cib-conversation')
    ?.shadowRoot?.querySelector('.scroller')

const initialization = (container: Element) => {
  const extensionRoot = document.createElement('div')
  extensionRoot.id = 'bing-template'
  extensionRoot.style.cssText = `
      width: 350px;
      padding: 70px 0 40px;
      position: sticky;
      top: 0;
      flex-shrink: 0;
    `

  const rencentActivitySideBar = document
    .querySelector('cib-serp')
    ?.shadowRoot?.querySelector('cib-conversation')
    ?.querySelector('cib-side-panel')
  if (rencentActivitySideBar) {
    // @ts-expect-error
    rencentActivitySideBar.style.display = 'none'
    extensionRoot.style.paddingTop = '1px'
  }

  container.appendChild(extensionRoot)

  // The cache and CacheProvider are here to solve the issue that
  // Styles are lost in shadow roots
  // https://github.com/chakra-ui/chakra-ui/issues/2145
  const cache = createCache({
    key: 'css',
    container: extensionRoot,
  })
  createRoot(extensionRoot).render(
    <CacheProvider value={cache}>
      <App onSubmit={handleSubmit} />
    </CacheProvider>,
  )
}

const handleTimeout = () => {
  console.log('Bing template extension >>> Initialization timeout')
}

initializeExtension({
  extensionContainerSelector,
  initialization,
  onTimeout: handleTimeout,
})
