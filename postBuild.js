const fs = require('fs')
const path = require('path')

function copy(fileName) {
  fs.copyFile(
    path.resolve(__dirname, `src/${fileName}`),
    path.resolve(__dirname, `dist/${fileName}`),
    (err) => {
      if (err) throw err
      console.log(`Copied ${fileName}`)
    },
  )
}

copy('manifest.json')
copy('logo.png')
