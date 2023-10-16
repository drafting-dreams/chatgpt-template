export function formatCamel(input: string, keepCase: boolean = true) {
  // Use a regular expression to split the input string at each uppercase letter
  // followed by a lowercase letter, digit, or underscore.
  const words = input.split(/(?=[A-Z][a-z0-9_])/)

  const transformedWords = keepCase
    ? words
    : // Capitalize the first word and convert the rest to lowercase.
      words.map((word, index) => {
        if (index === 0) {
          return word.charAt(0).toUpperCase() + word.slice(1)
        } else {
          return word.toLowerCase()
        }
      })

  // Join the words into a sentence.
  const sentence = transformedWords.join(' ')

  return sentence
}
