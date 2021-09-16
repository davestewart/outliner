require('colors')
const Fs = require('fs')
const Path = require('path')
const chokidar = require('chokidar')
const Table = require('cli-table3')
const { colorize } = require('./utils')

/**
 * Build the queue of tasks from the supplied options
 *
 * @param   {object}    options           The main options object
 * @param   {object}    options.tasks     A hash of task names (should match files in tasks folder)
 * @return  {function[]}
 */
function getTasks (options) {
  return Object.keys(options.tasks).reduce((tasks, name) => {
    const state = options.tasks[name]
    if (state) {
      try {
        const handler = require(`./tasks/${name}.js`)
        tasks.push(handler)
      }
      catch (err) {
        console.warn(`Unable to load task "${name}"`)
      }
    }
    return tasks
  }, [])
}

/**
 * Process a single file
 *
 * @param {string}      file              The filename to load
 * @param {object}      options           The processing options, source and target paths
 * @param {function[]}  tasks             An array of task functions
 */
function processFile (file, options, tasks) {
  // paths
  const srcFile = Path.join(options.source, file)
  const trgFile = Path.join(options.target, file)

  // the input SVG
  let input = Fs.readFileSync(srcFile).toString()

  // process
  if (input) {
    // a log object, which will be passed to each task by-reference
    const log = {
      state: 'skipped',
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

    // return info for logging
    return { file, log }
  }
}


/**
 * Process a list of files
 *
 * @param {string[]}    files             An array of folder paths (relative or absolute)
 * @param {object}      options           Options to pass to the script
 * @param {function[]}  tasks             An array of task functions
 */
function processFiles (files, options, tasks) {
  // results
  const results = files.map(file => processFile(file, options, tasks))

  // table
  const headers = Object.keys(results[0].log)
  const table = new Table({
    head: [`files (${files.length})`, ...headers],
    style: { compact: true, 'padding-left': 1 },
  })

  // generate table
  results.forEach(result => {
    // variables
    const { file, log } = result

    // cells
    const filename = file.replace('/', '').replace('.svg', '')
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
 * @param {boolean}   [options.nosize]    An optional flag to remove width and height attributes from the SVG
 */
function watchFolder (options) {
  // variables
  let timeoutId = 0
  let timeout = 250
  let files = []

  // get tasks
  const tasks = getTasks(options)

  // callback
  const onChange = filepath => {
    // add changed file
    files.push(filepath.replace(options.source, ''))

    // clear previous timeout
    clearTimeout(timeoutId)

    // delay processing
    timeoutId = setTimeout(() => {
      processFiles(files, options, tasks)
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
