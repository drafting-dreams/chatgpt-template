import { createRoot } from 'react-dom/client'
import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import App from './App'

const TIME_OUT = 5000
let start = Date.now()
let chatWindow: any

function initialize() {
  chatWindow = document
    .querySelector('cib-serp')
    ?.shadowRoot?.querySelector('cib-conversation')
    ?.shadowRoot?.querySelector('.scroller')

  if (chatWindow) {
    const extensionRoot = document.createElement('div')
    extensionRoot.id = 'bing-template'
    extensionRoot.style.cssText = `
      width: 350px;
      padding: 70px 0 40px;
      position: sticky;
      top: 0;
      flex-shrink: 0;
    `
    chatWindow?.appendChild(extensionRoot)

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
  } else if (Date.now() < start + TIME_OUT) {
    // Loop until shadow roots are all loaded
    requestAnimationFrame(initialize)
  } else {
    console.log('Bing template extension >>> Initialization timeout')
  }
}

initialize()
