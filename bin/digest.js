#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
require("./dotenv.js");
const argv = require("minimist")(process.argv.slice(2), {
  boolean: ["help", "dry-run", "extract", "verbose", "push"],
  alias: { v: "verbose" },
  default: { mjml: "default/thankyou" },
});
const { read, fileExists, save } = require("./config");
const { i18nRender, i18nTplInit } = require("./template.js");
// todo add turndown
const tmp = process.env.REACT_APP_CONFIG_FOLDER
  ? "../" + process.env.REACT_APP_CONFIG_FOLDER + "/"
  : "../config/";

const help = () => {
  console.log(
    [
      "options",
      "--help (this command)",
      "--dry-run (show the result but don't write)",
      "campaign name",
      "--mjml {template to use in config/mjml/campaigName)",
    ].join("\n")
  );
  process.exit(0);
};

if (!argv._.length || argv.help) {
  return help();
}

const saveConfig = (templateName, campaignName, lang, subject) => {
  const jsonFile = path.resolve(
    __dirname,
    tmp +
      "email/digest/" +
      campaignName +
      "/" +
      templateName +
      "." +
      lang +
      ".json"
  );
  const type = "digest";
  const json = {
    meta: {
      subject: subject,
      type: type,
    },
  };
  fs.writeFileSync(jsonFile, JSON.stringify(json, null, 2));
  console.log("saved in", jsonFile);
  return json;
};

(async () => {
  const tplName = argv.mjml;
  const campaignName = argv._[0];
  let render = null;

  const campaign = read("campaign/" + campaignName);

  const locales = campaign.config?.locales;
  if (!locales) {
    console.error("no language in", campaignName);
    process.exit(1);
  }
  const server = await i18nTplInit(campaign);
  const r = i18nRender(tplName, "en", true);
  console.log(r.html);

  for (const lang in locales) {
    try {
      console.log("generate ", lang);
    } catch (e) {
      console.log(e);
    }
    if (argv.push && !argv["dry-run"]) {
      // const r = await pushTemplate(config, render.html);
    }
  }
})();
