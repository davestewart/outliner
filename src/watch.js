require('colors')
const Fs = require('fs')
const Path = require('path')
const chokidar = require('chokidar')
const leftPad = require('left-pad')

// local
const { relPath } = require('./utils')

// tasks
const { outline, unsize } = require('./tasks')

/**
 * Process a single file
 *
 * @param filename    The filename to load
 * @param options     The processing options, source and target paths
 */
function processFile (filename, options) {
  // paths
  const oldFile = Path.join(options.source, filename)
  const newFile = Path.join(options.target, filename)

  // the input SVG
  let input = Fs.readFileSync(oldFile).toString()

  // process
  if (input) {
    // the queue of tasks to run
    const tasks = [outline, unsize]

    // a log object, which will be passed to each task by-reference
    const log = {
      outline: 0,
      unsize: false,
    }

    // run the tasks
    const output = tasks.reduce(function (input, task) {
      const processed = task(input, log)
      return processed || input
    }, input)

    // state
    const updated = log.outline > 0
    const state = updated ? 'Updated' : 'Copied '
    const num = leftPad(`(${log.outline})`, 4)

    // if the data has changed
    if (output && output !== input) {
      Fs.writeFileSync(newFile, output)
    }

    // if target folder is not the same as source
    else if (newFile !== oldFile) {
      Fs.writeFileSync(newFile, input)
    }

    // log output
    console.log(`${state}: ${num}  -> ${relPath(newFile)}`)
  }
}

/**
 * Main function to watch a folder
 *
 * @param options             Options to pass to the script
 * @param options.source      source folder path (relative or absolute)
 * @param options.target      target folder path (relative or absolute) defaults to the source folder, and will overwrite the source file
 * @param [options.nosize]    an optional flag to remove width and height attributes from the SVG
 */
function watchFolder (options) {
  // callback
  const onChange = filepath => {
    const filename = filepath.replace(options.source, '')
    processFile(filename, options)
  }

  // watch
  const glob = Path.join(options.source, '*.svg')
  chokidar
    .watch(glob, {
      persistent: true,
    })
    .on('add', onChange)
    .on('change', onChange)
}

module.exports = {
  watchFolder,
  processFile,
}
