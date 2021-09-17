require('colors')
const Fs = require('fs')
const Path = require('path')
const Table = require('cli-table3')
const chokidar = require('chokidar')
const { processFiles } = require('./process')
const { getTasks } = require('./tasks')
const { colorize, log } = require('./utils')

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

    // make sure target folder exists
    Fs.mkdirSync(target, { recursive: true })

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
    if (log.state === 'updated') {
      filename = filename.brightWhite
    }
    else {
      filename = filename.grey
    }

    // cells
    const cells = headers.map(name => log[name]).map(value => colorize(value))

    // row
    table.push([filename, ...cells])
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
 * @param {object}    options.tasks       A hash of tasks to process
 */
function watchFolder (options) {
  // variables
  let timeoutId = 0
  let timeout = 250
  let files = []

  // get tasks
  const tasks = getTasks(options.tasks)

  // callback
  const onChange = filepath => {
    // add changed file
    files.push(filepath.replace(options.source, ''))

    // clear previous timeout
    clearTimeout(timeoutId)

    // delay processing
    timeoutId = setTimeout(() => {
      const results = processFiles(files, options, tasks)
      if (results && results.length) {
        logResults(results)
      }
      else {
        log('Nothing to process')
      }
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
  makeOptions,
  watchFolder,
}
