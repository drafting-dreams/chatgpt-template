import browser from 'webextension-polyfill'
import { Octokit } from 'octokit'
import React from 'react'
import { Button } from '@/components/ui/button'

function App() {
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
          browser.storage.local.set({ templates })
        })
    })
  }

  return (
    <div className="bg-background p-3 text-foreground">
      <Button onClick={updateTemplates}>Update templates</Button>
    </div>
  )
}

export default App
