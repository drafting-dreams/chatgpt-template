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
  useToast,
} from '@chakra-ui/react'
import { Octokit } from 'octokit'
import { parse } from '@babel/parser'
import browser from 'webextension-polyfill'
import { formatCamel } from './utils'

type Template = {
  name: string
  content: { type: number; content?: string; placeholder?: string }[]
}

function App() {
  const toast = useToast()
  const [templates, setTemplates] = useState<Template[]>([])
  const initTemplates = useRef('')
  useEffect(() => {
    browser.storage.local.get().then(({ owner, repo, path }) => {
      if (!owner || !repo || !path) {
        toast({
          title: 'Need Setup',
          description: 'Go to the options page, and set up your template repo.',
          status: 'info',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        })
        return
      }
      const octokit = new Octokit()
      octokit
        .request('GET /repos/{owner}/{repo}/contents/{path}', {
          owner,
          repo,
          path,
        })
        .then((res) => {
          // @ts-expect-error For us, the return type is not an Array
          const code = atob(res.data.content)
          const ast = parse(code, { sourceType: 'module' })
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
