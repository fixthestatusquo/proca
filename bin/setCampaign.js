#!/usr/bin/env node
const { read, saveCampaign } = require("./config");
const argv = require("minimist")(process.argv.slice(2));
const merge = require("lodash.merge");

const locales = ["ar", "bg", "ca", "ce", "cs", "da", "de", "el", "en", "en_GB", "es", "et", "eu",
                  "fi", "fr", "fr_CA", "fr@informal", "ga", "ha", "he", "hi", "hr", "hu", "it", "lt",
                  "lv", "me", "mt", "nl", "pl", "pt", "ro", "rom", "ru", "sk", "sl", "sr", "sv", "uk", "yo"];

const help = () => {
  console.log(
    [
      "--help (options list)",
      "--lang=en (set the language of the campaign)",
      // "--locale=en or en,es,el (set the locales of the campaign)",
    ].join("\n")
  );
  process.exit(0);
};

if (argv.help) {
  help();
}
console.log("args", argv);
const id = argv._[0];

if (argv.lang) {
  if (locales.includes(argv.lang)) {
    const current = read(id);
    const next = merge(current, { lang: argv.lang });
    saveCampaign(next);
  } else {
    console.log("Invalid language");
  }

}

