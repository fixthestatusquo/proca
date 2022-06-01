#!/usr/bin/env node
const { read, saveCampaign } = require("./config");
const argv = require("minimist")(process.argv.slice(2));
const merge = require("lodash.merge");

const languages = [
  "ar",
  "bg",
  "ca",
  "ce",
  "cs",
  "da",
  "de",
  "el",
  "en",
  "en_GB",
  "es",
  "et",
  "eu",
  "fi",
  "fr",
  "fr_CA",
  "fr@informal",
  "ga",
  "ha",
  "he",
  "hi",
  "hr",
  "hu",
  "it",
  "lt",
  "lv",
  "me",
  "mt",
  "nl",
  "pl",
  "pt",
  "ro",
  "rom",
  "ru",
  "sk",
  "sl",
  "sr",
  "sv",
  "uk",
  "yo",
];

const help = () => {
  console.log(
    [
      "--help (options list)",
      "--lang=en (set the language of the campaign)",
      "--locales=en or en,es,el (set empty locales of the campaign)",
      "input name of json file",
    ].join("\n")
  );
  process.exit(0);
};

if (argv.help) {
  help();
}

const id = argv._[0];
const current = read("campaign/" + id);
if (!current) {
  console.error("can't read campaign ", id);
  process.exit(1);
}

(async () => {
  if (argv.lang) {
    if (languages.includes(argv.lang)) {
      const next = merge(current, { lang: argv.lang });
      saveCampaign(next);
    } else {
      console.log("Invalid language");
    }
  }

  if (argv.locales) {
    let arr = [];
    argv.locales.indexOf(",") > -1
      ? (arr = argv.locales.split(","))
      : arr.push(argv.locales);
    let locales = {};
    arr.map((locale) => {
      if (languages.includes(locale)) {
        locales[locale] = {};
      } else {
        console.log("Invalid locale");
      }
    });
    if (locales !== {}) {
      const current = read("campaign/" + id);
      const next = merge(current, { config: { locales } });
      saveCampaign(next);
    }
  }
  if (argv.push) {
    // must be the last one
    try {
      const d = await pushCampaign(id);
    } catch (errors) {
      Array.isArray(errors) &&
        errors.map((e) => {
          console.error("\x1b[31m", e.message);
        });
    }
  }
})();
