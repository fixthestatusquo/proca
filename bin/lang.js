const { join } = require("path");
const { readdirSync, lstatSync } = require("fs");
const i18next = require("i18next");
const Backend = require("i18next-fs-backend");

// DUPLICATION WARNING require and import compatibility: any update needs to be done as well into ./src/lib/i18n.js
const languages = {
  be: ["fr", "nl"],
  gr: "el",
  el: "el",
  lt: "lt",
  pt: "pt",
  bg: "bg",
  es: "es",
  lu: ["de", "fr"],
  ro: "ro",
  cz: "cs",
  fr: "fr",
  hu: "hu",
  si: "sl",
  sk: "sk",
  dk: "da",
  hr: "hr",
  mt: "en",
  de: "de",
  it: "it",
  nl: "nl",
  fi: "fi",
  ee: "et",
  cy: "el",
  at: "de",
  se: "sv",
  ie: "en",
  lv: "lv",
  pl: "pl",
};

const i18nInit = i18next.use(Backend).init({
  preload: readdirSync(join(__dirname, "../src/locales")).filter(fileName => {
    const joinedPath = join(join(__dirname, "../src/locales"), fileName);
    const isDirectory = lstatSync(joinedPath).isDirectory();
    return isDirectory;
  }),
  backend: {
    loadPath: join(__dirname, "../src/locales/{{lng}}/{{ns}}.json"),
  },
  lng: Object.keys(languages),
  fallbackLng: "en",
  //    debug: true,
  // have a common namespace used around the full app
  ns: ["common", "server"],
  defaultNS: "common",
});

const mainLanguage = (countryCode, single = true) => {
  // single: remove countries with multiple languages
  if (!countryCode) return null;
  const l = languages[countryCode.toLowerCase()];
  if (single && Array.isArray(l)) return null;
  return l;
};

const configOverride = config => {
  if (config.locales) {
    let campaignTitle = false;
    Object.keys(config.locales).forEach(k => {
      if (k.charAt(k.length - 1) === ":") {
        const ns = k.slice(0, -1);
        if (ns === "campaign") {
          config.locales[k].title =
            config.locales[k].title || config.campaign.title;
          campaignTitle = true;
        }
        i18next.addResourceBundle(
          config.lang,
          ns,
          config.locales[k],
          true,
          true
        );
        //        console.log(ns,config.lang,config.locales[k]);
        delete config.locales[k];
      }
    });
    if (!campaignTitle) {
      i18next.addResourceBundle(
        config.lang,
        "campaign",
        config.campaign,
        true,
        true
      );
    }
    i18next.addResourceBundle(
      config.lang,
      "common",
      config.locales,
      true,
      true
    );
  }
};
module.exports = {
  configOverride,
  mainLanguage,
  i18next,
  i18nInit,
};
