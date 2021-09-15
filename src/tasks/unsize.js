/**
 * Remove the width and height from SVG so it scales properly in OSX preview
 *
 * @param   {string}  input
 * @param   {object}  log
 * @return  {string}
 */
function unsize (input, log) {
  return input.replace(/<svg.+?>/, match => {
    return match.replace(/ \b(width|height)="\d+"/g, match => {
      log.unsize = true
      return ''
    })
  })
}

module.exports = unsize
