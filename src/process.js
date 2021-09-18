Path = require('path')
const { readFile, writeFile, copyFile } = require('./utils/file.js')

/**
 * State constants
 */
const State = Object.freeze({
  NO_FILE: 'no file',
  NO_DATA: 'no data',
  NO_WRITE: 'no write',
  NO_CHANGE: 'no change',
  UPDATED: 'updated',
  COPIED: 'copied',
})

/**
 * Process SVG text
 *
 * @param   {string}      input           The SVG content
 * @param   {function[]}  tasks           An array of transformer functions
 * @param   {object}      [log]           An optional hash to log updates to
 * @returns {string}                      The processed SVG
 */
function processSvg (input, tasks, log = {}) {
  // run the tasks, passing the result of each to the next task
  return tasks.reduce(function (input, task) {
    return task(input, log)
  }, input)
}

/**
 * Process a single SVG file
 *
 * @param   {string}      src             The source file path
 * @param   {string|null|undefined} trg   The target file path (pass undefined to use src, false or null to skip file write)
 * @param   {function[]}  tasks           An array of task functions
 * @param   {object}      [log]           An optional hash to log updates to
 * @returns {string}                      The processed SVG
 */
function processFile (src, trg, tasks, log = {}) {
  // parameters
  if (trg === undefined) {
    trg = src
  }

  // variables
  let input = readFile(src)
  let output = input

  // no file
  if (input === undefined) {
    log.state = State.NO_FILE
    return ''
  }

  // process
  if (input) {
    // process SVG
    output = processSvg(input, tasks, log)

    // if the SVG was updated, write the file
    if (output !== input) {
      log.state = State.UPDATED
    }

    // if no change, but target folder, copy the file
    else if (trg !== src) {
      log.state = State.COPIED
    }

    // otherwise, skip
    else {
      log.state = State.NO_CHANGE
      return output
    }
  }

  // no data
  else {
    log.state = State.NO_DATA
    return output || ''
  }

  // if trg is false, skip
  if (trg === false || trg === null) {
    log.state = State.NO_WRITE
    return output
  }

  // check to see if new output is different from old output
  const oldOutput = readFile(trg)
  if (output === oldOutput) {
    log.state = State.NO_CHANGE
    return output
  }

  // if we get here, write to disk
  log.state === State.UPDATED
    ? writeFile(trg, output)
    : copyFile(src, trg)

  // return svg
  return output
}

/**
 * Process a list of SVG files
 *
 * @param {string[]}    files             An array of folder paths (relative or absolute)
 * @param {object}      options           Options to pass to the script
 * @param {function[]}  tasks             An array of task functions
 */
function processFiles (files, options, tasks) {
  return files.map(file => {
    // paths
    const srcFile = Path.join(options.source, file)
    const trgFile = options.target
      ? Path.join(options.target, file)
      : undefined

    // a log object, which will be passed to each task by-reference
    const log = {
      state: ''
    }

    // process
    processFile(srcFile, trgFile, tasks, log)

    // return
    return { file, path: trgFile || srcFile, log }
  })
}

module.exports = {
  processFiles,
  processFile,
  processSvg,
  State,
}
