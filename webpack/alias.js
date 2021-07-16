/**
 * Add aliases to webpack config.
 * locales -> src/locales/XX where XX is lang from config or 'en'
 */
const path = require("path");

module.exports = (webpack) => {
  const lang = process.env.PROCA_LANGUAGE || "en";
  webpack.resolve.alias["locales"] = path.resolve(
    __dirname,
    "../src/locales/" + lang
  );
  // webpack.resolve.alias["@config"] = path.resolve(__dirname, configFolder());
  webpack.resolve.alias["@i18n-iso-countries/lang"] =
    "i18n-iso-countries/langs/" + lang + ".json";
  return webpack;
};
