const Path = require('path')
const Fs = require('fs')
const { watchFolder } = require('./index')

// options
const options = require('yargs/yargs')(process.argv.slice(2)).argv

// source and target folders
let [source, target] = options._
if (!target) {
  target = source
}

// if we have source and target, begin
if (source && target) {
  // convert all paths to absolute
  options.source = Path.resolve(__dirname, source)
  options.target = Path.resolve(__dirname, target)

  // make sure source folder exists
  if (!Fs.existsSync(options.source)) {
    console.error('Source folder does not exist')
    return
  }

  // make sure target folder exists
  Fs.mkdirSync(target, { recursive: true })

  // start watching
  watchFolder(options)
}

// if no source, complain
else {
  console.log('Please specify source (and optionally target) folders')
}
