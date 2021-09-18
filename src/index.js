const { processSvg, processFile, State } = require('./process.js')
const { getTasks, DEFAULT_TASKS } = require('./tasks')

function outlineFile (src, trg, tasks = DEFAULT_TASKS, log = {}) {
  return processFile(src, trg, getTasks(tasks), log)
}

function outlineSvg (svg, tasks = DEFAULT_TASKS, log = {}) {
  return processSvg(svg, getTasks(tasks), log)
}

module.exports = {
  outlineFile,
  outlineSvg,
  State,
}
