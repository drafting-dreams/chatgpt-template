import { useEffect, useRef, useState } from 'react'
import {
  Box,
  ChakraProvider,
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionIcon,
  AccordionPanel,
  Textarea,
} from '@chakra-ui/react'
import { parse } from '@babel/parser'
import browser from 'webextension-polyfill'
import { formatCamel } from '../utils'

type Template = {
  name: string
  content: { type: number; content?: string; placeholder?: string }[]
}

function App() {
  const [inComposition, setInComposition] = useState(false)
  const [templates, setTemplates] = useState<Template[]>([])
  const initTemplates = useRef('')
  useEffect(() => {
    browser.storage.local.get().then(({ templates }) => {
      const ast = parse(templates, { sourceType: 'module' })
      // @ts-expect-error Don't want to waste time to use type assertion
      const temp: Template[] = ast.program.body.map(({ declarations }) => {
        const declarator = declarations[0]
        const name = formatCamel(declarator.id.name, false)
        const templateLiteral = declarator.init
        const templateComponents = [...templateLiteral.expressions, ...templateLiteral.quasis]
        templateComponents.sort((a, b) => a.end - b.end)
        return {
          name,
          content: templateComponents.map((component) =>
            component.type === 'Identifier'
              ? { type: 1, placeholder: formatCamel(component.name) }
              : { type: 0, content: component.value.raw },
          ),
        }
      })
      initTemplates.current = JSON.stringify(temp)
      setTemplates(temp)
    })
  }, [])

  /**
   *
   * @param i The index of template
   *
   * @param j The index of the content in that template
   *
   * @param value new content value for the input fields
   *
   */
  const handleChange = (i: number, j: number, value: string) => {
    const newTemplates = [...templates]
    const newTemplate = { ...newTemplates[i] }
    const newContent = [...newTemplate.content]
    newContent[j] = {
      ...newContent[j],
      content: value,
    }
    newTemplates[i].content = newContent
    setTemplates(newTemplates)
  }

  return (
    <ChakraProvider>
      <Accordion allowToggle color={'rgb(236, 236, 241)'}>
        {templates.map((template, index) => (
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box as="span" flex="1" textAlign="left">
                  {template.name}
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel>
              {template.content.map((content, templateIndex) =>
                content.type ? (
                  <Textarea
                    value={content.content ?? ''}
                    placeholder={content.placeholder}
                    onChange={(e) => {
                      handleChange(index, templateIndex, e.currentTarget.value)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.altKey) {
                        handleChange(index, templateIndex, `${content.content ?? ''}\n`)
                      } else if (e.key === 'Enter' && !inComposition && !e.altKey) {
                        // Clear Chat history
                        const aTags = document.getElementsByTagName('a')
                        for (let tag of aTags) {
                          if (tag.textContent === 'Clear chat') {
                            tag.click()
                          }
                        }

                        // Wait for some time to let the page refresh after clearing the chat history
                        setTimeout(() => {
                          const promptTextArea = document.getElementById(
                            'prompt-textarea',
                          ) as HTMLTextAreaElement

                          // To trigger the input event in react
                          // https://stackoverflow.com/questions/23892547/what-is-the-best-way-to-trigger-change-or-input-event-in-react-js
                          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                            window.HTMLTextAreaElement.prototype,
                            'value',
                          )!.set as any
                          nativeInputValueSetter.call(
                            promptTextArea,
                            templates[index].content
                              .map((component) =>
                                component.content ? component.content : component.placeholder,
                              )
                              .join(''),
                          )
                          promptTextArea.dispatchEvent(new Event('input', { bubbles: true }))

                          const sendButton = document.querySelector(
                            "[data-testid='send-button']",
                          ) as HTMLButtonElement
                          sendButton.click()

                          setTemplates(JSON.parse(initTemplates.current) as Template[])
                        }, 150)
                      }
                    }}
                    onCompositionStart={() => {
                      setInComposition(true)
                    }}
                    onCompositionEnd={() => {
                      setInComposition(false)
                    }}
                  />
                ) : (
                  <Box whiteSpace="pre-wrap">{content.content}</Box>
                ),
              )}
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </ChakraProvider>
  )
}

export default App
