import i18n from "i18next";
//import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { config } from "../actionPage";
import locales from "locales/common.json"; // locales is an alias to src/locales/{process.widget.lang}
import isoCountries from "i18n-iso-countries";
import isoCountriesLang from "@i18n-iso-countries/lang"; // alias to just used locales

// DUPLICATION WARNING require and import compatibility: any update needs to be done as well into ./bin/lang.js
const languages = {
  be: ["fr", "nl"],
  gr: "el",
  el: "el",
  lt: "lt",
  pt: "pt",
  bg: "bg",
  es: "es",
  lu: ["fr", "de"],
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

const mainLanguage = (countryCode, single = true) => {
  // single: remove countries with multiple languages
  const l = languages[countryCode.toLowerCase()];
  if (single && Array.isArray(l)) return null;
  return l;
};

isoCountries.registerLocale(isoCountriesLang);

// XXX maybe refactor to use some useMemo?
export const allCountries = isoCountries.getNames(
  config.lang.toLowerCase().slice(0, 2),
  {
    select: "alias",
  }
);

const resources = {};

export const getCountryName = iso =>
  isoCountries.getName(
    iso.toUpperCase(),
    config.lang.toLowerCase().slice(0, 2),
    { select: "alias" }
  );

const lang = config.lang.length === 2 ? config.lang.toLowerCase() : config.lang;

resources[lang] = { common: locales };
i18n
  //  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // we init with resources
    resources: resources,
    languages: lang,
    lng: lang,
    fallbackLng:
      config.lang.length === 2 ? "en" : config.lang.toLowerCase().slice(0, 2),
    //debug: true,
    // have a common namespace used around the full app
    ns: ["common"],
    defaultNS: "common",
    react: {
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: [
        "br",
        "strong",
        "b",
        "em",
        "i",
        "p",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "ol",
        "ul",
        "li",
      ],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export { mainLanguage };
export default i18n;
