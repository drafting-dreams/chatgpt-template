import { INPUT_ID } from './insertScript'
;(function insertText() {
  const input = document.getElementById(INPUT_ID)?.innerText ?? ''
  const quill = (document.querySelector('rich-textarea') as any).__quill
  quill.insertText(0, input, 'user')
})()
