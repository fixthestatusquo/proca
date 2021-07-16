const envVar = "actionpage";
const fs = require("graceful-fs");
const path = require("path");

function getConfigOverride(defaultConfig) {
  const config = readConfigOverride();
  if (config) {
    config[1] = parseConfig(config[1]);
    return config;
  }
  throw Error("\n\n\n           Oops ! Tell me which config file to use: yarn command *config*\n\n\n");
}

function configFolder() {
  return process.env.REACT_APP_CONFIG_FOLDER
    ? "../" + process.env.REACT_APP_CONFIG_FOLDER + "/"
    : "../config/";
}
function readConfigOverride() {
  let apId = process.env[envVar] || process.argv[2];

  if (apId) {
    const configFile = apId + ".json";
    const fn = path.resolve(__dirname, configFolder() + configFile);
    try {
      return [configFile, fs.readFileSync(fn)];
    } catch (e) {
      console.error(
        `Cannot read action page config for actionpage=${apId}, did You yarn pull ${apId}?`,
        e.message
      );
      throw e;
    }
  } else {
    return null;
  }
}

function parseConfig(config) {
  try {
    return JSON.parse(config);
  } catch (e) {
    console.error(`Cannot parse action page config: `, e.message);
    throw e;
  }
}

module.exports = { getConfigOverride, configFolder };
