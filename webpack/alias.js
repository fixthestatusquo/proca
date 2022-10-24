/**
 * Add aliases to webpack config.
 * locales -> src/locales/XX where XX is lang from config or 'en'
 */
const path = require("path");
const fs = require("fs");

const { getConfigOverride, configFolder } = require("./config");

module.exports = (webpack) => {
  const [configFile, config] = getConfigOverride();

  const lang = config.lang.substring(0, 2).toLowerCase();

  webpack.resolve.alias["locales"] = path.resolve(
    __dirname,
    "../src/locales/" + lang
  );

  webpack.resolve.alias["@config"] = path.resolve(__dirname, configFolder());
  webpack.resolve.alias["@components"] = path.resolve(
    __dirname,
    "../src/components/"
  );
  webpack.resolve.alias["@lib"] = path.resolve(__dirname, "../src/lib/");
  webpack.resolve.alias["@hooks"] = path.resolve(__dirname, "../src/hooks/");
  webpack.resolve.alias["@images"] = path.resolve(__dirname, "../src/images/");
  webpack.resolve.alias["@data"] = path.resolve(__dirname, "../src/data/");
  const countryList = "i18n-iso-countries/langs/" + lang + ".json";

  if (fs.existsSync("./node_modules/" + countryList)) {
    webpack.resolve.alias["@i18n-iso-countries/lang"] =
      "i18n-iso-countries/langs/" + lang + ".json";
  } else {
    console.log("can't find", lang, "default to en");
    webpack.resolve.alias["@i18n-iso-countries/lang"] =
      "i18n-iso-countries/langs/en.json";
  }

  return webpack;
};
