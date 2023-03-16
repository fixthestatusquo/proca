#!/usr/bin/env node
const fs = require("fs");
const fetch = require("cross-fetch");
require("dotenv").config();
const i18nInit = require("./lang").i18nInit;
const i18n = require("./lang").i18next;
const { commit, add, onGit } = require("./git");
const color = require("cli-color");
const argv = require("minimist")(process.argv.slice(2), {
  default: { git: true },
  boolean: ["help", "dry-run", "git", "pull", "push", "extract"],
});
const { saveCampaign, pullCampaign } = require("./campaign");

const { mainLanguage } = require("./lang");
const { read, save, file, api, fileExists, mkdirp } = require("./config");

const help = () => {
  if (!argv._.length || argv.help) {
    console.log(
      color.yellow(
        [
          "options",
          "--help (this command)",
          "--dry-run (show but don't update)",
          "--git (git update [add]+commit into /config/locale/) || --no-git",
          "--extract (split the campaign.json locales into config/locale) || --no-extract",
          "?--pull (update from the server)",
          "?--push (update the server)",
          "{campaign name}",
          "{language code to translate to, eg 'fr'}",
        ].join("\n")
      )
    );
  }
};

const saveLocale = async (campaign, lang, locale) => {
  const fileName = file("locale/" + campaign + "/" + lang);
  const exists = fileExists(fileName);
  fs.writeFileSync(fileName, JSON.stringify(locale, null, 2));
  console.log(color.green.bold("wrote " + fileName));
  if (argv.git) {
    if (!exists) {
      r = await add(fileName);
      console.log("adding", fileName);
    }
    const msg = "extract locale" + lang + " for " + campaign;
    r = argv.git && (await commit(fileName, msg));
  }
  return fileName;
};
const extract = async (name) => {
  const campaign = read("campaign/" + name);
  mkdirp("locale/" + name);
  let langs = [];
  for (const locale in campaign.config.locales) {
    langs.push(locale);
    await saveLocale(name, locale, campaign.config.locales[locale]);
  }
  let r = null;
  const msg = "extract locales" + langs.join(",") + " for " + campaign;
  return;
  if (argv.git) {
    console.log(r.summary);
  }
};

if (require.main === module) {
  // this is run directly from the command line as in node xxx.js
  help();
  if (!onGit()) {
    console.warn(
      color.italic.yellow(
        "git integration disabled because the config folder isn't on git"
      )
    );
    argv.git = false;
  }
  (async () => {
    const anonymous = true;
    const campaignName = argv._[0];
    const toLang = argv._[0];
    try {
      if (argv.extract) {
        await extract(campaignName);
      }
    } catch (e) {
      console.error(e);
      // Deal with the fact the chain failed
    }
  })();
} else {
  //export a bunch
  module.exports = { pull, push, translate };
}
