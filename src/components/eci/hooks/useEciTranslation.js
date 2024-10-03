import { useTranslation } from "react-i18next";
//import { useForm } from "react-hook-form";
import i18n from "../../../lib/i18n";

import eciLocale from "locales/eci";

const removeDotKey = obj => {
  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === "object") {
      removeDotKey(obj[key]);
    }
    if (key.includes(".")) {
      obj[key.replace(/\./g, "_")] = obj[key];
      delete obj[key];
    }
  });
  return obj;
};

const useEciTranslation = locale => {
  return useTranslation("common", {
    i18n: i18n.addResourceBundle(
      locale || i18n.language,
      "eci",
      removeDotKey(eciLocale)
    ),
  });
};

const countries = eciLocale.common.country;

export { useEciTranslation as useTranslation, countries };
