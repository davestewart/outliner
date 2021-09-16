require('colors')

function isPlainObject (value) {
  return value && typeof value === 'object' && !Array.isArray(value)
}

function colorize (value) {
  const text = String(value)
  if (value === 'skipped' || value === false || value === 0) {
    return text.grey
  }
  else if (value === 'updated') {
    return text.brightCyan
  }
  else if (value === 'error' || value === 'no such file') {
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
