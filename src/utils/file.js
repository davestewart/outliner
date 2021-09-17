const Fs = require('fs')
const Path = require('path')

/**
 * Ensure target folder exists
 *
 * @param   {string}    trg       A target file path
 */
function ensureDirectory (trg) {
  const folder = Path.dirname(trg)
  if (!Fs.existsSync(folder)) {
    Fs.mkdirSync(folder, { recursive: true })
  }
}

/**
 * Read a a file
 *
 * @param   {string}    src       A source file path
 * @return  {string|undefined}
 */
function readFile (src) {
  try {
    return Fs.readFileSync(src).toString()
  }
  catch (err) {
    return undefined
  }
}

/**
 * Write a file
 *
 * @param   {string}    trg       A target file path
 * @param   {string}    data      The data to write
 */
function writeFile (trg, data) {
  ensureDirectory(trg)
  Fs.writeFileSync(trg, data)
}

function copyFile (src, trg) {
  ensureDirectory(trg)
  Fs.copyFileSync(src, trg)
}

module.exports = {
  readFile,
  writeFile,
  copyFile,
}
