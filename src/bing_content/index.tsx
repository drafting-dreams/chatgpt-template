import { createRoot } from 'react-dom/client'
import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import { initializeExtension } from '../utils'
import App from './App'

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
      <App />
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
