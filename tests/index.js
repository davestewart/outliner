const Fs = require('fs')
const { outlineSvg, outlineFile } = require('../')

const srcFile = './demo/source/icon-folder.svg'

function testFile () {
  const log = {}
  const output = outlineFile(srcFile, undefined, undefined, log)
  console.log({ output, log })
}

function testSvg () {
  const log = {}
  const input = Fs.readFileSync(srcFile).toString()
  const output = outlineSvg(input, undefined, log)
  console.log({ input, output, log })
}

testFile()
testSvg()
