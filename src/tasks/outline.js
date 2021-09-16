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

/**
 * Process SVG and convert paths to fills
 *
 * @param   {string}  input
 * @param   {object}  log
 * @return  {string}
 */
function processSvg (input, log) {
  // load file
  const options = { xml: { normalizeWhitespace: true } }
  const $ = cheerio.load(input, options)

  // paths
  const paths = $('path[stroke-width]')

  // logs
  log.outline = paths.length

  // process
  if (paths.length) {
    // process
    paths.each(function (i, e) {
      // element
      const $e = $(e)

      // variables
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
      const attrs = Object.keys($e.get(0).attribs)
      attrs.forEach(attr => {
        if (attr.startsWith('stroke')) {
          $e.removeAttr(attr)
        }
      })
    })

    // render
    return $.root().html()
  }

  // return unchanged
  return input
}

module.exports = processSvg
