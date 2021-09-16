require('colors')
const Fs = require('fs')
const Path = require('path')
const chokidar = require('chokidar')
const Table = require('cli-table3')
const { colorize } = require('./utils')

// tasks
const { outline, unsize } = require('./tasks')

/**
 * Process a single file
 *
 * @param file        The filename to load
 * @param options     The processing options, source and target paths
 */
function processFile (file, options) {
  // paths
  const srcFile = Path.join(options.source, file)
  const trgFile = Path.join(options.target, file)

  // the input SVG
  let input = Fs.readFileSync(srcFile).toString()

  // process
  if (input) {
    // the queue of tasks to run
    const tasks = [outline, unsize]

    // a log object, which will be passed to each task by-reference
    const log = {
      state: 'skipped',
      paths: 0,
      unsize: false,
    }

    // run the tasks
    const output = tasks.reduce(function (input, task) {
      const processed = task(input, log)
      return processed || input
    }, input)

    // if the SVG was updated, write the file
    if (output !== input) {
      Fs.writeFileSync(trgFile, output)
      log.state = 'updated'
    }

    // if no change and new folder, copy the file
    else if (trgFile !== srcFile) {
      Fs.copyFileSync(srcFile, trgFile)
      log.state = 'copied'
    }

    // log output
    return { file, log }
  }
}


/**
 * Process a list of files
 *
 * @param {string[]}  files               An array of folder paths (relative or absolute)
 * @param {object}    options             Options to pass to the script
 */
function processFiles (files, options) {
  // results
  const results = files.map(file => processFile(file, options))

  // table
  const table = new Table({
    head: [`Files (${files.length})`, 'State', 'Paths', 'Unsized'],
    style: { compact: true, 'padding-left': 1 },
  })

  // generate table
  results.forEach(result => {
    // variables
    const { file, log } = result

    // cells
    const filename = file.replace('/', '').replace('.svg', '')
    const state = colorize(log.state)
    const paths = colorize(log.paths)
    const unsize = colorize(log.unsize)

    // row
    table.push([filename, state, paths, unsize])
  })

  // output
  console.log(table.toString())
}

/**
 * Main function to watch a folder
 *
 * @param {object}    options             Options to pass to the script
 * @param {string}    options.source      Source folder path (relative or absolute)
 * @param {string}    options.target      Target folder path (relative or absolute) defaults to the source folder, and will overwrite the source file
 * @param {boolean}   [options.nosize]    An optional flag to remove width and height attributes from the SVG
 */
function watchFolder (options) {
  // variables
  let timeoutId = 0
  let timeout = 250
  let files = []

  // callback
  const onChange = filepath => {
    // add changed file
    files.push(filepath.replace(options.source, ''))

    // clear previous timeout
    clearTimeout(timeoutId)

    // delay processing
    timeoutId = setTimeout(() => {
      processFiles(files, options)
      files = []
    }, timeout)
  }

  // watch
  const glob = Path.join(options.source, '*.svg')
  chokidar
    .watch(glob, { persistent: true })
    .on('add', onChange)
    .on('change', onChange)
}

module.exports = {
  watchFolder,
  processFile,
}
