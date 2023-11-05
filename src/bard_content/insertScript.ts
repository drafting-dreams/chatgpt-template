export const INPUT_ID = 'bard-templates-temp-input-content'

export function injectScript(file: string, input: string) {
  return new Promise<void>((resolve) => {
    const s = document.createElement('script')
    s.setAttribute('type', 'text/javascript')
    s.setAttribute('src', file)

    const c = document.createElement('div')
    c.setAttribute('id', INPUT_ID)
    c.innerText = input
    c.style.cssText = 'positon: fixed; height: 1px; overflow: hidden'

    s.onload = () => {
      document.body.removeChild(s)
      document.body.removeChild(c)
      resolve()
    }
    document.body.appendChild(c)
    document.body.appendChild(s)
  })
}
