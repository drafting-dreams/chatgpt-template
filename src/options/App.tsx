import { useState, useEffect } from 'react'
import browser from 'webextension-polyfill'
import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function App() {
  const [repoInfo, setRepoInfo] = useState('')
  const [token, setToken] = useState('')
  useEffect(() => {
    browser.storage.local.get().then(({ owner, repo, path, token }) => {
      if (owner && repo && path) setRepoInfo([owner, repo, path].join('/'))
      if (token) {
        setToken(token)
      }
    })
  }, [])

  return (
    <main className="flex flex-col gap-3 bg-background p-4 text-foreground">
      <h1 className="text-xl font-semibold">Chatgpt-template</h1>
      <p className="text-sm">{'Github information: ({owner}/{repo}/{path})'}</p>
      <Input onChange={(e) => setRepoInfo(e.currentTarget.value)} value={repoInfo} />
      <p className="text-sm">
        Personal Access Token{' '}
        <a
          className="text-primary underline underline-offset-4"
          href="https://github.com/settings/tokens/new"
          target="_blank"
          rel="noreferrer"
        >
          create
        </a>
      </p>
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
    </main>
  )
}

export default App
