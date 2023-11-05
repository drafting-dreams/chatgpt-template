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
import { injectScript } from './insertScript'

type Template = {
  name: string
  content: { type: number; content?: string; placeholder?: string }[]
}

function App() {
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
                      const newTemplates = [...templates]
                      const newTemplate = { ...newTemplates[index] }
                      const newContent = [...newTemplate.content]
                      newContent[templateIndex] = {
                        ...newContent[templateIndex],
                        content: e.currentTarget.value,
                      }
                      newTemplates[index].content = newContent
                      setTemplates(newTemplates)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.altKey) {
                        // Clear Chat history
                        const sendButton = document.querySelector(
                          "[data-test-id='new-chat']",
                        ) as HTMLButtonElement
                        sendButton.click()

                        // Wait for some time to let the page refresh after clearing the chat history
                        setTimeout(() => {
                          const promptTextArea = document.getElementById(
                            'prompt-textarea',
                          ) as HTMLTextAreaElement
                          const value = templates[index].content
                            .map((component) =>
                              component.content ? component.content : component.placeholder,
                            )
                            .join('')

                          setTimeout(() => {
                            ;(document.querySelector('.ql-editor') as HTMLDivElement).focus()
                            injectScript(browser.runtime.getURL('/bard_helper.js'), value).then(
                              () => {
                                const sendButton = document.querySelector(
                                  '[aria-label="Send message"]',
                                ) as HTMLButtonElement
                                sendButton.click()

                                setTemplates(JSON.parse(initTemplates.current) as Template[])
                              },
                            )
                          }, 20)
                        }, 150)
                      }
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
