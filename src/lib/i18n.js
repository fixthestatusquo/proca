import i18n from "i18next";
//import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import {config} from "../actionPage";
import locales from 'locales/common.json'; // locales is an alias to src/locales/{process.widget.lang} 
import isoCountries from 'i18n-iso-countries';

isoCountries.registerLocale(require(`i18n-iso-countries/langs/${config.lang.toLowerCase()}.json`));

// XXX maybe refactor to use some useMemo?
export const allCountries = isoCountries.getNames(config.lang.toLowerCase(), {select: "official"});

let resources = {};

resources[config.lang.toLowerCase()] = {common:locales};

i18n
//  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // we init with resources
    resources: resources,
    languages : config.lang.toLowerCase(),
    lng: config.lang.toLowerCase(),
    fallbackLng: "en",
//    debug: true,
    // have a common namespace used around the full app
    ns: ["common"],
    defaultNS: "common",
    react: {
      transSupportBasicHtmlNodes: true
    },
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;



