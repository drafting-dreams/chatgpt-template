const TIME_OUT = 6000
let start = 0

type Config = {
  extensionContainerSelector: () => Element | null | undefined
  initialization: (container: Element) => void
  onTimeout?: () => void
}

function initializeExtension(config: Config) {
  if (start === 0) {
    start = Date.now()
  }

  const { extensionContainerSelector, initialization, onTimeout } = config

  const root = extensionContainerSelector()

  if (root) {
    initialization(root)
  } else if (Date.now() < start + TIME_OUT) {
    setTimeout(() => {
      initializeExtension(config)
    }, 60)
  } else {
    onTimeout?.()
  }
}

export { initializeExtension }
