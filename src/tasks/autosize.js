/**
 * Remove the width and height from SVG so it scales properly in OSX preview
 *
 * @param   {string}  input
 * @param   {object}  log
 * @return  {string}
 */
function autosize (input, log) {
  log.autosize = false
  return input.replace(/<svg.+?>/, match => {
    return match.replace(/ \b(width|height)="\d+"/g, match => {
      log.autosize = true
      return ''
    })
  })
}

module.exports = autosize
