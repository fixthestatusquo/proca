/**
  * Add aliases to webpack config.
  * locales -> src/locales/XX where XX is lang from config or 'en'
  */ 
const path = require("path")
const {getConfigOverride} = require('./config')

module.exports = webpack => {
  const config = getConfigOverride({
    lang: "en"
  })

  webpack.resolve.alias['locales'] = path.resolve(__dirname, '../src/locales/' + config.lang.toLowerCase())
  webpack.resolve.alias['@config'] = path.resolve(__dirname, '../config')
  webpack.resolve.alias['@i18n-iso-countries/lang'] = 'i18n-iso-countries/langs/' + config.lang.toLowerCase() + '.json'

  return webpack
}
