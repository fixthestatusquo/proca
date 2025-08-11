const envVar = "actionpage";
const fs = require("graceful-fs");
const path = require("node:path");
const merge = require("lodash").merge;

function getConfigOverride(id) {
const config = readConfigOverride(id);
if (config) {
  return config;
}
throw Error(
  "\n\n\n           Oops ! Tell me which config file to use: yarn command *config*\n\n\n",
);
}

const configFolder =() =>(process.env.PROCA_CONFIG_FOLDER  || path.resolve(__dirname, "../config/"));

function readConfigOverride(id) {
//  console.log(id);console.trace("Here I am!")

let apId = id || process.env[envVar] || process.argv[2];

if (apId) {
  const configFile = apId + ".json";
  const fn = path.resolve(__dirname, configFolder() + '/' + configFile);
  try {
    const config = parseConfig(fs.readFileSync(fn));
    let campaignConfig = {};
    if (config.campaign.name) {
      campaignConfig = parseConfig(
        fs.readFileSync(
          path.resolve(
            __dirname,
            configFolder() + "/campaign/" + config.campaign.name + ".json",
          ),
        ),
      );
      if (!config.locales) config.locales = {};
      config.layout = merge(campaignConfig.config.layout,config.layout);
        config.component = merge(
          {
            share: {},
            dispatch: {},
            register: { field: {} },
            consent: {},
            country: undefined,
          },
          campaignConfig.config.component,
          config.component,
        );
        if (!config.portal || config.portal.length === 0) {
          config.portal = campaignConfig.config.portal;
        }
        if (!config.import || config.import.length === 0) {
          config.import = campaignConfig.config.import;
        }
        if (!config.journey || config.journey.length === 0) {
          config.journey = campaignConfig.config.journey || [
            "Petition",
            "Share",
          ];
        }
        if (
          campaignConfig.config.locales &&
          campaignConfig.config.locales[config.lang] &&
          campaignConfig.config.locales[config.lang]["common:"]
        ) {
          config.locales = merge(
            campaignConfig.config.locales[config.lang]["common:"],
            config.locales,
          );
          delete campaignConfig.config.locales[config.lang]["common:"];
        }
        if (
          // TODO: investigate
          campaignConfig.config.portal &&
          campaignConfig.config.portal[0] === "Snowflake" &&
          campaignConfig.config.locales &&
          campaignConfig.config.locales[config.lang] &&
          campaignConfig.config.locales[config.lang]["letter:"]
        ) {
          console.log("IT SHOULD NOT HAPPEN");
          process.exit(1);
          config.locales = merge(
            {
              "letter:": campaignConfig.config.locales[config.lang]["letter:"],
            },
            config.locales,
          );
          delete campaignConfig.config.locales[config.lang]["letter:"];
        }
        if (
          campaignConfig.config.locales &&
          campaignConfig.config.locales[config.lang]
        ) {
          let campaigns = merge(
            campaignConfig.config.locales[config.lang]["campaign:"],
            config.locales["campaign:"],
          );
          Object.keys(campaignConfig.config.locales[config.lang])
            .filter((d) => d.slice(-1) !== ":")
            .forEach((d) => {
              //                typeof campaignConfig.config.locales[config.lang][d] ===
              //                  "string",
              if (
                typeof campaignConfig.config.locales[config.lang][d] ===
                "string"
              ) {
                campaigns[d] = campaignConfig.config.locales[config.lang][d];
              } else {
                if (!config.locales["campaign:"])
                  config.locales["campaign:"] = {};
                campaigns[d] = merge(
                  campaignConfig.config.locales[config.lang][d],
                  config.locales["campaign:"][d],
                );
              }
            });
          config.locales["campaign:"] = campaigns;
          if (
            config.locales["campaign:"] &&
            config.locales["campaign:"].title
          ) {
            config.campaign.title = config.locales["campaign:"].title;
          }
        }
      } else {
        console.error("can't find the campaign.name on the config", config);
      }
      config.locale = config.lang;
      config.lang = config.lang.substring(0, 2).toLowerCase();
      if (process.env.DEBUG && process.env.DEBUG === "CONFIG") {
        console.log(JSON.stringify(config, null, 2));
        process.exit(1);
      }
      return [configFile, config, campaignConfig];
    } catch (e) {
      const confFolder = configFolder();
      if (!fs.existsSync(confFolder)) {
        console.error("missing folder", confFolder, ". mkdir it");
        process.exit(1);
      }
      console.error(
        `Cannot read action page config for actionpage=${apId}, did You yarn pull ${apId}?`,
        e.message,
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
