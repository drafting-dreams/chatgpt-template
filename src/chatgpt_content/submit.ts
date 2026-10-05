const EDITOR_SELECTOR =
  "[data-composer-markdown][contenteditable='true'], #prompt-textarea[contenteditable='true']"
const SEND_SELECTOR =
  "button[data-testid='send-button'], button[aria-label='Send'], button[aria-label='Send prompt'], button[aria-label='Send message']"

const getEditor = () =>
  [...document.querySelectorAll<HTMLElement>(EDITOR_SELECTOR)].find(
    (editor) => editor.getClientRects().length > 0,
  )

const getSendButton = (editor: HTMLElement) => {
  const form = editor.closest('form')
  const sendButtons = [...(form || document).querySelectorAll<HTMLButtonElement>(SEND_SELECTOR)]
  const candidates = sendButtons.length
    ? sendButtons
    : [...(form?.querySelectorAll<HTMLButtonElement>("button[type='submit']") || [])]

  return candidates.find(
    (button) =>
      !button.matches(':disabled') &&
      button.getAttribute('aria-disabled') !== 'true' &&
      button.getClientRects().length > 0,
  )
}

export const createSubmitHandler = () => {
  let submitting = false

  return (value: string) => {
    if (submitting || !value.trim()) return
    submitting = true

    const newChatButton =
      document.querySelector<HTMLElement>(
        "[data-testid='create-new-chat-button'], button[aria-label='New chat'], a[aria-label='New chat']",
      ) ||
      [...document.querySelectorAll<HTMLButtonElement>('button')].find(
        (button) => button.textContent?.trim() === 'New chat',
      )

    let filledEditor: HTMLElement | undefined
    let filledContent = ''
    let finished = false
    let scheduled = 0
    let retry = 0

    const observer = new MutationObserver(() => scheduleAttempt())
    const finish = () => {
      finished = true
      submitting = false
      observer.disconnect()
      clearTimeout(start)
      clearTimeout(timeout)
      clearTimeout(scheduled)
      clearInterval(retry)
    }

    const attempt = () => {
      if (finished) return
      const editor = getEditor()
      if (!editor) return

      if (editor !== filledEditor || !editor.textContent?.trim()) {
        editor.focus()
        document.execCommand('selectAll', false)
        if (!document.execCommand('insertText', false, value)) return
        filledEditor = editor
        filledContent = editor.textContent || ''
        scheduleAttempt()
        return
      }

      if (editor.textContent !== filledContent) {
        finish()
        return
      }

      const button = getSendButton(editor)
      if (!button) return
      finish()
      button.click()
    }

    // Run after the page's input handlers and coalesce mutations from the same render.
    const scheduleAttempt = () => {
      if (finished || scheduled) return
      scheduled = window.setTimeout(() => {
        scheduled = 0
        attempt()
      }, 0)
    }

    const start = window.setTimeout(() => {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
      })
      retry = window.setInterval(scheduleAttempt, 100)
      scheduleAttempt()
    }, newChatButton ? 800 : 0)

    const timeout = window.setTimeout(() => {
      finish()
      console.warn('ChatGPT Template: timed out waiting for the composer or Send button.')
    }, 10000)

    newChatButton?.click()
  }
}
