/**
 * Add aliases to webpack config.
 * locales -> src/locales/XX where XX is lang from config or 'en'
 */
const path = require("path");
const { getConfigOverride, configFolder } = require("./config");

module.exports = (webpack) => {
  const [configFile, config] = getConfigOverride({
    lang: "en",
  });

  const lang = config.lang.substring(0, 2).toLowerCase();

  webpack.resolve.alias["locales"] = path.resolve(
    __dirname,
    "../src/locales/" + lang
  );
  webpack.resolve.alias["@config"] = path.resolve(__dirname, configFolder());
  webpack.resolve.alias["@i18n-iso-countries/lang"] =
    "i18n-iso-countries/langs/" + lang + ".json";

  return webpack;
};
