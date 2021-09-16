const { processSvg, processFile } = require('./src/process.js')
const { getTasks, DEFAULT_TASKS } = require('./src/tasks')

function outlineFile (srcFile, trgFile, tasks = DEFAULT_TASKS, log = {}) {
  return processFile(srcFile, trgFile, getTasks(tasks), log)
}

function outlineSvg (svg, tasks = DEFAULT_TASKS, log = {}) {
  return processSvg(svg, getTasks(tasks), log)
}

module.exports = {
  outlineFile,
  outlineSvg,
}
