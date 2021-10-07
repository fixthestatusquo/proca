const config = {
  transform: {
    "^.+\\.jsx?$": "babel-jest",
    ".+\\.(svg|css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$":
      "jest-transform-stub",
  },
  moduleNameMapper: {
    "^locales/(.*)$": "<rootDir>/src/locales/en/$1",
    "@i18n-iso-countries/lang": "i18n-iso-countries/langs/en.json",
  },
};

module.exports = config;
