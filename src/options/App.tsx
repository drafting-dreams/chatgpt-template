import { ChakraProvider, Button, Link, Input, Text } from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import browser from 'webextension-polyfill'
import { Octokit } from 'octokit'
import React from 'react'

function App() {
  const [repoInfo, setRepoInfo] = useState('')
  const [token, setToken] = useState('')

  const updateTemplates = () => {
    browser.storage.local.get().then(({ owner, repo, path, token }) => {
      if (!owner || !repo || !path) {
        return
      }

      const ocktokit = token ? new Octokit({ auth: token }) : new Octokit()
      ocktokit
        .request('GET /repos/{owner}/{repo}/contents/{path}', { owner, repo, path })
        .then((res) => {
          // @ts-expect-error For us, the returned type is not an Array
          const templates = atob(res.data.content)
          console.log(templates)
          browser.storage.local.set({ templates })
        })
    })
  }

  useEffect(() => {
    browser.storage.local.get().then(({ owner, repo, path, token }) => {
      if (owner && repo && path) setRepoInfo([owner, repo, path].join('/'))
      if (token) {
        setToken(token)
      }
    })
  }, [])

  return (
    <ChakraProvider>
      <main>
        <h1>Chatgpt-template</h1>
        <Text>{'Github information: ({owner}/{repo}/{path})'}</Text>
        <Input onChange={(e) => setRepoInfo(e.currentTarget.value)} value={repoInfo} />
        <Text>
          Personal Access Token{' '}
          <Link href="https://github.com/settings/tokens/new" isExternal>
            create
          </Link>
        </Text>
        <Input
          onChange={(e) => setToken(e.currentTarget.value)}
          value={token ? '*'.repeat(token.length) : ''}
          type="password"
        />
        <Button
          onClick={() => {
            const [owner, repo, path] = repoInfo.split('/')
            browser.storage.local.set({
              owner,
              repo,
              path,
              token,
            })
          }}
        >
          Save
        </Button>
        <Button onClick={updateTemplates}>Update templates</Button>
      </main>
    </ChakraProvider>
  )
}

export default App
