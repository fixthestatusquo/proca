const languages = {
  be: ["fr", "nl"],
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

const mainLanguage = (countryCode, single = true) => {
  // single: remove countries with multiple languages
  const l = languages[countryCode.toLowerCase()];
  if (single && Array.isArray(l)) return null;
  return l;
};

module.exports = {
  mainLanguage,
};
