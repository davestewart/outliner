function relPath (path) {
  return path.replace(process.cwd(), '')
}

module.exports = {
  relPath,
}
