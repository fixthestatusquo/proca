import i18n from "i18next";
//import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import locales from 'locales/common.json'; // locales is an alias to src/locales/{process.widget.lang} 
let resources = {};
if (process.widget) {
  resources[process.widget.lang.toLowerCase()] = {common:locales};
} else {
  resources = {common:locales}; // npm published, put all languages
  process.widget = {lang:"en"};
}

i18n
//  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // we init with resources
    resources: resources,
    languages : process.widget.lang.toLowerCase(),
    lng: process.widget.lang.toLowerCase(),
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



