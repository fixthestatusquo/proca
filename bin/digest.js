#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const color = require("cli-color");
require("./dotenv.js");
const argv = require("minimist")(process.argv.slice(2), {
  boolean: ["help", "dry-run", "extract", "verbose", "push"],
  alias: { v: "verbose" },
  default: { mjml: "default" },
});
const { mkdirp, read } = require("./config");
const { i18nRender, i18nTplInit } = require("./template.js");
const configOverride = require("./lang").configOverride;

const tmp = process.env.REACT_APP_CONFIG_FOLDER
  ? "../" + process.env.REACT_APP_CONFIG_FOLDER + "/"
  : "../config/";

const help = () => {
  console.log(
    [
      "options",
      "--help (this command)",
      "--dry-run (show the result but don't write)",
      "[campaign name]",
      "--mjml (template to use in config/mjml/[campaign name]) and for subject",
      "--key {key to use for subject in config.locales.server.digest.{key}.subject)",
      "--lang process only one language",
    ].join("\n")
  );
  process.exit(0);
};

if (!argv._.length || argv.help) {
  help();
}

const saveConfig = (templateName, campaignName, lang, subject, campaign) => {
  const jsonFile = path.resolve(
    __dirname,
    tmp + "email/digest/" + templateName + "/" + lang + ".json"
  );
  const type = "digest";
  let json = {
    meta: {
      type: type,
      config: campaign.config.component.digest,
    },
  };
  if (subject) json.meta.subject = subject;
  fs.writeFileSync(jsonFile, JSON.stringify(json, null, 2));
  console.log("saved in", jsonFile);
  return json;
};

const saveTemplate = (render, templateName, campaignName, lang) => {
  const fileName = path.resolve(
    __dirname,
    tmp + "email/digest/" + templateName + "/" + lang + ".html"
  );
  if (argv.verbose) {
    console.log(JSON.stringify(render.errors, null, 2));
  }
  if (argv["dry-run"]) {
    console.log("would write in ", fileName, render.html);
    return;
  }
  console.log("saved in", fileName);
  fs.writeFileSync(fileName, render.html);

  return render;
};

const subject = (config, key) => {
  let cfg = config.locales["server:"];
  if (!cfg) return false;
  cfg = cfg.digest;
  if (!cfg || !cfg[key] || !cfg[key].subject) return config.title;
  return cfg[key].subject;
};

(async () => {
  const campaignName = argv._[0];
  const tplName = campaignName + "/" + argv.mjml;
  if (!tplName) {
    console.log("missing --mjml=template/to/use");
    process.exit(1);
  }
  console.log(color.blue("using ", tplName));
  let render = null;

  const campaign = read("campaign/" + campaignName);
  if (!campaign) {
    console.error(color.red("campaign ", campaignName, "not found"));
    process.exit(1);
  }

  let locales = campaign.config?.locales;
  if (!locales) {
    console.error("no language in", campaignName);
    process.exit(1);
  }
  if (argv.lang) {
    locales = {};
    locales[argv.lang] = campaign.config.locales[argv.lang];
  }

  mkdirp("email/digest/" + tplName);
  for (const lang in locales) {
    try {
      const server = (await i18nTplInit(campaign, lang)) || {};
      let config = { lang: lang, locales: locales[lang] };
      let s = subject(config, argv.key || argv.mjml);
      if (server) config.locales["server:"] = server;
      saveConfig(tplName, campaignName, lang, s, campaign);
      configOverride(config);
      render = await i18nRender(tplName, lang, true);
      saveTemplate(render, tplName, campaignName, lang);
    } catch (e) {
      console.log(e);
    }
    if (argv.push && !argv["dry-run"]) {
      // const r = await pushTemplate(config, render.html);
    }
  }
})();
