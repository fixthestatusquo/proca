const config = {
  transform: {
    "^.+\\.jsx?$": "babel-jest",
  },
  moduleNameMapper: {
    "^locales/(.*)$": "<rootDir>/src/locales/en/$1",
    "@i18n-iso-countries/lang": "i18n-iso-countries/langs/en.json",
  },
  setupFilesAfterEnv: ["<rootDir>/jest-setup.js"],
};

module.exports = config;
