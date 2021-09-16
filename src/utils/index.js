function relPath (path) {
  return path.replace(process.cwd(), '')
}

function colorize (value) {
  const text = String(value)
  if (value === 'skipped' || value === false || value === 0) {
    return text.grey
  }
  if (value === 'updated') {
    return text.cyan
  }
  if (value === 'error') {
    return text.red
  }
  return value
}

module.exports = {
  relPath,
  colorize,
}
