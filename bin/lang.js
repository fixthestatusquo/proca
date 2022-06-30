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
  cy: "cy",
  at: "de",
  se: "sv",
  ie: "en",
  lv: "lv",
  pl: "pl",
};

const i18nInit = i18next.use(Backend).init({
  preload: readdirSync(join(__dirname, "../src/locales")).filter((fileName) => {
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
  ns: ["common"],
  defaultNS: "common",
});

const mainLanguage = (countryCode, single = true) => {
  // single: remove countries with multiple languages
  if (!countryCode) return null;
  const l = languages[countryCode.toLowerCase()];
  if (single && Array.isArray(l)) return null;
  return l;
};

module.exports = {
  mainLanguage,
  i18next,
  i18nInit,
};
