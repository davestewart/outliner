require('colors')
const Fs = require('fs')
const Path = require('path')
const Table = require('cli-table3')
const chokidar = require('chokidar')
const { colorize, log } = require('./utils')
const { processFiles } = require('./process')
const { getTasks } = require('./tasks')
const { State } = require('./process.js')

const cwd = process.cwd()

/**
 * Build options for main watch task
 *
 * @param   {string}  source    A relative or absolute source folder path
 * @param   {string}  target    A relative or absolute target folder path
 * @param   {object}  flags     A hash of task names
 * @return  {{source, target, tasks}|void}
 */
function makeOptions (source, target, flags = {}) {
  const options = {
    source,
    target,
    tasks: {
      outline: true,
      autosize: flags.autosize,
    },
  }

  // if we have source and target, begin
  if (source && target) {
    // convert all paths to absolute
    options.source = Path.resolve(cwd, options.source)
    options.target = Path.resolve(cwd, options.target)

    // make sure source folder exists
    if (!Fs.existsSync(options.source)) {
      log(`Source folder "${Path.relative(cwd, options.source)}" does not exist`)
      return
    }

    // debug
    log(JSON.stringify(options, null, '  '), 'options')

    // return
    return options
  }

  // if no source, complain
  else {
    log('Please specify source (and optionally target) folders')
  }
}

/**
 * Log results of processing multiple files
 *
 * @param {{file: string, log: object}[]}   results   An array of result objects
 */
function logResults (results) {
  // headers
  const first = results[0]
  const headers = Object.keys(first.log)

  // table
  const table = new Table({
    head: [`files (${results.length})`, ...headers],
    style: { compact: true, 'padding-left': 1 },
  })

  // add rows
  results.forEach(result => {
    // variables
    const { file, log } = result

    // filename
    let filename = file.replace('/', '').replace('.svg', '')
    if (log.state === State.UPDATED) {
      filename = filename.brightWhite
    }
    else {
      filename = filename.grey
    }

    // cells
    const cells = headers.map(name => log[name]).map(value => value !== undefined ? colorize(value) : '')

    // row
    table.push([filename, ...cells])
  })

  // output
  console.log(table.toString())
}

// ---------------------------------------------------------------------------------------------------------------------
// watching
// ---------------------------------------------------------------------------------------------------------------------

/**
 * the list of files waiting to be processed
 *
 * We keep track of this so files are processed in batches
 *
 * @type {string[]}
 */
let pendingFiles = []

/**
 * The list of files being processed
 *
 * We keep track of this so when source files are overwritten, they don't get reprocessed
 *
 * @type {string[]}
 */
let currentFiles = []

/**
 * Main function to watch a folder
 *
 * There's some trickery with sets of files and timeouts; this is to prevent source files
 * from being processed twice; @see https://github.com/davestewart/outliner/issues/25
 *
 * @param {object}    options             Options to pass to the script
 * @param {string}    options.source      Source folder path (relative or absolute)
 * @param {string}    options.target      Target folder path (relative or absolute) defaults to the source folder, and will overwrite the source file
 * @param {object}    options.tasks       A hash of tasks to process
 */
function watchFolder (options) {
  // timeout variables
  const delayStart = 500
  const delayClear = 500
  let timeoutId = 0

  // get tasks
  const tasks = getTasks(options.tasks)

  // callback
  const onChange = absPath => {
    // rel path
    const relPath = absPath.replace(options.source, '')

    // ignore files that are already being / have just been processed
    if (currentFiles.includes(relPath)) {
      return
    }

    // add changed file
    pendingFiles.push(relPath)

    // clear previous timeout
    clearTimeout(timeoutId)

    // delay processing
    timeoutId = setTimeout(() => {
      // set pending files as current
      currentFiles = [...pendingFiles]
      pendingFiles = []

      // process files
      const results = processFiles(currentFiles, options, tasks)

      // clear current files after a short delay
      setTimeout(() => {
        currentFiles = []
      }, delayClear)

      // log results
      if (results && results.length) {
        logResults(results)
      }
    }, delayStart)
  }

  // watch
  const glob = Path.join(options.source, '**/*.svg')
  chokidar
    .watch(glob)
    .on('add', onChange)
    .on('change', onChange)
}

module.exports = {
  makeOptions,
  watchFolder,
}
