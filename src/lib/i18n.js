import i18n from "i18next";
//import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import resources from '../locales'; //TODO: import from translation files
i18n
//  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // we init with resources
    resources: {
      en: {
        common:{
          sign: "Sign",
        }
      },
      fr: {common: {
          sign: "Je signe",
          "First Name":"Prénom",
      }}
    },
    languages : ["fr","en"],
    lng: "fr",
    fallbackLng: "en",
    debug: false,

    // have a common namespace used around the full app
    ns: ["common"],
    defaultNS: "common",

    keySeparator: false, // we use content as keys

    interpolation: {
      escapeValue: false
    }
  });

export default i18n;

