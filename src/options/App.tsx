import { ChakraProvider, Button, Input, Text } from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import browser from 'webextension-polyfill'

function App() {
  const [repoInfo, setRepoInfo] = useState('')
  useEffect(() => {
    browser.storage.local.get().then(({ owner, repo, path }) => {
      if (owner && repo && path) setRepoInfo([owner, repo, path].join('/'))
    })
  }, [])

  return (
    <ChakraProvider>
      <main>
        <h1>Chatgpt-template</h1>
        <Text>{'Github information: ({owner}/{repo}/{path})'}</Text>
        <Input onChange={(e) => setRepoInfo(e.currentTarget.value)} value={repoInfo} />
        <Button
          onClick={() => {
            const [owner, repo, path] = repoInfo.split('/')
            browser.storage.local.set({
              owner,
              repo,
              path,
            })
          }}
        >
          Save
        </Button>
      </main>
    </ChakraProvider>
  )
}

export default App
