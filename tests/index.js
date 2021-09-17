const Fs = require('fs')
const { outlineSvg, outlineFile } = require('../')

const src = './demo/source/icon-folder.svg'
const trg = './demo/target/icon-folder.svg'

function testFile () {
  const log = {}
  const output = outlineFile(src, trg, undefined, log)
  console.log({ output, log })
}

function testSvg () {
  const log = {}
  const input = Fs.readFileSync(src).toString()
  const output = outlineSvg(input, undefined, log)
  console.log({ input, output, log })
}

function testCustom () {
  const log = {}
  const replaceColor = (svg, log) => {
    log.replaceColor = true
    return svg.replace(/#[a-z0-9]+/gi, 'currentColor')
  }
  const output = outlineFile(src, false, [replaceColor], log)
  console.log({ output, log })
}

testFile()
testSvg()
testCustom()
