require('colors')
const { watchFolder, makeOptions } = require('./src/watch')

// arguments
const args = require('yargs/yargs')(process.argv.slice(2)).argv

// source and target folders
const [source, target] = args._

// run
const options = makeOptions(source, target, args)
if (options) {
  watchFolder(options)
}
