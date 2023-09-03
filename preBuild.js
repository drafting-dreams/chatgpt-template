const fs = require('fs')
const path = require('path')

const dist = path.resolve(__dirname, 'dist')
if (fs.existsSync(dist)) {
  fs.rmSync(path.resolve(__dirname, 'dist'), { recursive: true })
}
