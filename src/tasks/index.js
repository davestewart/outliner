const { log, isPlainObject } = require('../utils')

/**
 * Build the queue of tasks from the supplied names / handlers
 *
 * @param   {object}        tasks     A (name => state) hash of task names (should match files in tasks folder)
 * @param   {string[]}      tasks     An array of task names (should match files in tasks folder)
 * @param   {function[]}    tasks     An array of handlers (will be passed stright through)
 * @return  {function[]}
 */
function getTasks (tasks) {
  // convert hash to array
  if (isPlainObject(tasks)) {
    tasks = Object.keys(tasks).reduce((output, key) => {
      if (tasks[key]) {
        output.push(key)
      }
      return output
    }, [])
  }

  // convert names to handlers
  return tasks.reduce((handlers, task) => {
    // task is already a handler
    if (typeof task === 'function') {
      handlers.push(task)
    }

    // task is a name
    if (typeof task === 'string') {
      try {
        const handler = require(`./${task}.js`)
        handlers.push(handler)
      }
      catch (err) {
        log(`Unable to load task "${task}"`)
      }
    }

    // return handler
    return handlers
  }, [])
}

const DEFAULT_TASKS = ['outline', 'unsize']

module.exports = {
  DEFAULT_TASKS,
  getTasks,
}
