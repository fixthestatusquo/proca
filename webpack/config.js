const envVar = 'actionpage'
const fs = require('graceful-fs')
const path = require('path')

function getConfigOverride(defaultConfig) {
  const config = readConfigOverride()
  if (config) {
    return parseConfig(config)
  } else {
    return defaultConfig
  }
}

function readConfigOverride() {
  let apId = process.env[envVar] || process.argv[2]

  if (apId) {
    apId = parseInt(apId)
    if (Number.isNaN(apId))
      throw new Error("Please provide action page id (number in actionpage env var or as argument)")
    const fn = path.resolve(__dirname, `../config/${apId}.json`)
    try {
      return fs.readFileSync(fn)
    } catch (e) {
      console.error(`Cannot read action page config for actionpage=${apId}, did You yarn pull ${apId}?`, e.message)
      throw e
    }
  } else {
    return null
  }
}

function parseConfig(config) {
  try {
    return JSON.parse(config)
  } catch (e) {
    console.error(`Cannot parse action page config: `, e.message)
    throw e
  }
}

module.exports = {getConfigOverride}
