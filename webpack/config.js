const envVar = "actionpage";
const fs = require("graceful-fs");
const path = require("path");
const merge = require("lodash").merge;

function getConfigOverride(defaultConfig) {
  const config = readConfigOverride();
  if (config) {
    return config;
  }
  throw Error(
    "\n\n\n           Oops ! Tell me which config file to use: yarn command *config*\n\n\n"
  );
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
      const config = parseConfig(fs.readFileSync(fn));
      let campaignConfig = {};
      if (config.campaign.name) {
        campaignConfig = parseConfig(
          fs.readFileSync(
            path.resolve(
              __dirname,
              configFolder() + "/campaign/" + config.campaign.name + ".json"
            )
          )
        );
        if (campaignConfig.config.demand) {
          // TODO: remove after we migrated all campaigns to the new format
          config.locales["campaign:"] = {
            description: campaignConfig.config.demand,
          };
        }
        ["layout", "component"].map((k) => {
          config[k] = merge(config[k], campaignConfig.config[k]);
        });
        if (!config.portal || config.portal.length === 0)
          config.portal = campaignConfig.config.portal;
        if (!config.journey || config.journey.length === 0)
          config.journey = campaignConfig.config.journey;
        if (!config.locales) config.locales = {};
        if (
          campaignConfig.config.locales &&
          campaignConfig.config.locales[config.lang] &&
          campaignConfig.config.locales[config.lang]["common:"]
        ) {
          config.locales = merge(
            config.locales,
            campaignConfig.config.locales[config.lang]["common:"]
          );
          delete campaignConfig.config.locales[config.lang]["common:"];
        }
        if (
          campaignConfig.config.locales &&
          campaignConfig.config.locales[config.lang]
        ) {
          config.locales["campaign:"] =
            campaignConfig.config.locales[config.lang];
          if (campaignConfig.config.locales[config.lang].title)
            config.campaign.title =
              campaignConfig.config.locales[config.lang].title;
        }
        console.log(config.lang, campaignConfig.config.locales);
      }
      console.log(config);
      process.exit(1);
      return [configFile, config, campaignConfig];
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
    console.error(`Cannot parse config: `, e.message);
    throw e;
  }
}

module.exports = { getConfigOverride, configFolder };
