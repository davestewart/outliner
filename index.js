require('colors')
const chokidar = require('chokidar')
const Fs = require('fs')
const Path = require('path')
const cheerio = require('cheerio')
const maker = require('makerjs')

// ---------------------------------------------------------------------------------------------------------------------
// options
// ---------------------------------------------------------------------------------------------------------------------

const svgOptions = {
  bezierAccuracy: 0.25,
}

// @see https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-linejoin
const svgJoints = {
  round: 0,
  miter: 1,
  bevel: 2,
}

// ---------------------------------------------------------------------------------------------------------------------
// svg
// ---------------------------------------------------------------------------------------------------------------------

// @see https://maker.js.org/docs/advanced-drawing/#Outlining%20a%20model
function processPath (pathData, width, cap = 'miter') {
  // options
  const distance = Number(width) / 2
  const joints = svgJoints[cap]

  // make path
  const input = maker.importer.fromSVGPathData(pathData, { bezierAccuracy: svgOptions.bezierAccuracy })

  // expand to outline
  // @see https://maker.js.org/docs/api/modules/makerjs.model.html#expandpaths
  const outline = maker.model.expandPaths(input, distance, 0) // joints seem unreliable; stick to round

  // export
  maker.model.simplify(outline)
  return maker.exporter.toSVGPathData({ models: { outline } }, false, [0, 0])
}

function processSvg (input) {
  // load file
  const options = { xml: { normalizeWhitespace: true } }
  const $ = cheerio.load(input, options)

  // paths
  const paths = $('path[stroke-width]')
  if (paths.length) {
    // process
    paths.each(function (i, e) {
      // element
      const $e = $(e)

      // variables
      const id = $e.attr('id')
      const fillRule = $e.attr('fill-rule')
      const width = $e.attr('stroke-width')
      const join = $e.attr('stroke-linejoin')
      const fill = $e.attr('stroke')
      const d = $e.attr('d')
      const isClosed = /z/i.test(d) || fillRule === 'evenodd'

      // generate outline
      const path = processPath(d, width, join)

      // update
      $e.attr('d', path)
      $e.attr('fill', fill)
      isClosed
        ? $e.attr('fill-rule', 'evenodd')
        : $e.removeAttr('fill-rule')

      // cleanup
      $e.removeAttr('stroke')
      $e.removeAttr('stroke-width')
      $e.removeAttr('stroke-linecap')
    })

    // render
    return $.root().html()
  }
}

// ---------------------------------------------------------------------------------------------------------------------
// files
// ---------------------------------------------------------------------------------------------------------------------

function relPath (path) {
  return path.replace(__dirname, '')
}

function processFile (filename, options) {
  // paths
  const oldFile = Path.join(options.source, filename)
  const newFile = Path.join(options.target, filename)

  // process
  let input = Fs.readFileSync(oldFile).toString()
  if (input) {
    // remove root width and height
    if (options.nosize) {
      input = input.replace(/<svg.+?>/, match => match.replace(/ \b(width|height)="\d+"/g, ''))
    }

    // process
    let output = processSvg(input)

    // if the data has changed
    if (output && output !== input) {
      Fs.writeFileSync(newFile, output)
      console.log('Updated:', relPath(newFile).green)
    }

    // if target folder is not the same as source
    else if (newFile !== oldFile) {
      Fs.writeFileSync(newFile, input)
      console.log('Copied: ', relPath(newFile).grey)
    }
  }
}

/**
 * Main function to watch a folder
 *
 * @param options             Options to pass to the script
 * @param options.source      source folder path (relative or absolute)
 * @param options.target      target folder path (relative or absolute) defaults to the source folder, and will overwrite the source file
 * @param [options.nosize]    an optional flag to remove width and height attributes from the SVG
 */
function watchFolder (options) {
  // callback
  const onChange = filepath => {
    const filename = filepath.replace(options.source, '')
    processFile(filename, options)
  }

  // watch
  const glob = Path.join(options.source, '*.svg')
  chokidar
    .watch(glob, {
      persistent: true,
    })
    .on('add', onChange)
    .on('change', onChange)
}

module.exports = {
  watchFolder
}
