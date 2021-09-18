require('colors')
const { State } = require('../process')

function isPlainObject (value) {
  return value && typeof value === 'object' && !Array.isArray(value)
}

function colorize (value) {
  const text = String(value)
  if (value === State.NO_CHANGE || value === false || value === 0) {
    return text.grey
  }
  else if (value === State.UPDATED) {
    return text.brightCyan
  }
  else if (value === State.NO_FILE || value === State.NO_DATA || value === 'error') {
    return text.red
  }
  else if (typeof value === 'number' || value === true) {
    return text.brightWhite
  }
  return text
}

function log (message, label = 'error') {
  const output = typeof message === 'string'
    ? message.brightWhite
    : message
  console.log(`\nOutliner ${label}`.red + ` :`, output, `\n`)
}

module.exports = {
  isPlainObject,
  colorize,
  log,
}
