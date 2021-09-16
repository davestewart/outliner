const Fs = require('fs')
const Path = require('path')

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
 * @param   {string}      srcFile         The source file path
 * @param   {string}      trgFile         The target file path
 * @param   {function[]}  tasks           An array of task functions
 * @param   {object}      [log]           An optional hash to log updates to
 * @returns {string}                      The processed SVG
 */
function processFile (srcFile, trgFile, tasks, log = {}) {
  // variables
  let input = ''
  let output = ''

  // svg
  try {
    input = Fs.readFileSync(srcFile).toString()
    output = input
  }
  catch (err) {
    log.state = 'no such file'
    return ''
  }

  // process
  if (input) {
    // process SVG
    output = processSvg(input, tasks, log)

    // if the SVG was updated, write the file
    if (output !== input) {
      log.state = 'updated'
      if (trgFile) {
        Fs.writeFileSync(trgFile, output)
      }
    }

    // if no change and new folder, copy the file
    else if (trgFile !== srcFile) {
      log.state = 'copied'
      if (trgFile) {
        Fs.copyFileSync(srcFile, trgFile)
      }
    }

    else {
      log.state = 'skipped'
    }
  }

  // no input
  else {
    log.state = 'no input'
  }

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
    const trgFile = Path.join(options.target, file)

    // a log object, which will be passed to each task by-reference
    const log = {
      state: ''
    }

    // process
    processFile(srcFile, trgFile, tasks, log)

    // add path
    // log['file path'] = trgFile

    // return
    return { file, log }
  })
}

module.exports = {
  processFiles,
  processFile,
  processSvg,
}
