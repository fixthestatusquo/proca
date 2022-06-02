#!/usr/bin/env node
<<<<<<< HEAD
const { read, saveCampaign, pushCampaign } = require("./config");
const argv = require("minimist")(process.argv.slice(2));
=======
const { read, saveCampaign, pullCampaign, pushCampaign } = require("./config");
const argv = require("minimist")(process.argv.slice(2), { boolean: ["pull", "push"]});
>>>>>>> ea87c3ea4e781a2bb66015fc1a808411730b53ca
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

console.log("argv", argv);

const help = () => {
  console.log(
    [
      "--help (options list)",
      "--pull (pull the config from the server before doing the modification)",
      "--push (push the modified campaign config to the server)",
      "--lang=en or en,es,el (set empty locales of the campaign)",
      "--locales.en.campaign:=whatever (set the locales, carefully - no validation)",
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

const update = (id, change) => {
  const next = merge(current, change);
  saveCampaign(next);
  console.log("updated", id);
};


(async () => {
<<<<<<< HEAD
    if (argv.pull) {
      try {
        const d = await pullCampaign(id);
      } catch (errors) {
        Array.isArray(errors) &&
          errors.map((e) => {
            console.error("\x1b[31m", e.message);
          });
      }
    }

  if (argv.pull) {
    try {
      const campaign = await pullCampaign(id);
      saveCampaign(campaign);
       console.log("pulled " + id);
      } catch (error) {
      console.error(error);
    }
  }

  if (argv.lang) {
    let arr = [];
    argv.lang.indexOf(",") > -1
      ? (arr = argv.lang.split(","))
      : arr.push(argv.lang);
    let locales = {};
    arr.map((lang) => {
      if (languages.includes(lang)) {
        locales[lang] = {};
      } else {
        console.log("Invalid language");
      }
    });
    if (locales !== {}) {
      const change = {};
      change.config = { locales: locales };
      update(id, change);
    }
  }

  if (argv.locales) {
    // DANGER: no validation
    update(id, { config: { locales: argv.locales } });
  }

  if (argv.push) {
    console.log("here");
    // must be the last one
    console.log("pushing to server",id);
    try {
      const d = await pushCampaign(id);
      console.log(d);
      console.log("does not work??? " + id);
    } catch (errors) {
      Array.isArray(errors) &&
        errors.map((e) => {
          console.error("\x1b[31m", e.message);
        });
    }
  }
})();
