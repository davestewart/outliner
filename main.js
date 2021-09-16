const Path = require('path')
const Fs = require('fs')
require('colors')
const { watchFolder } = require('./src/watch.js')

// options
const args = require('yargs/yargs')(process.argv.slice(2)).argv

// source and target folders
let [source, target] = args._
if (!target) {
  target = source
}

// build options
const options = {
  source,
  target,
  tasks: {
    outline: true,
    unsize: args.unsize,
  }
}

// if we have source and target, begin
if (source && target) {
  // convert all paths to absolute
  options.source = Path.resolve(__dirname, options.source)
  options.target = Path.resolve(__dirname, options.target)

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
