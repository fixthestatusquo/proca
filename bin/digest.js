#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
require("./dotenv.js");
const argv = require("minimist")(process.argv.slice(2), {
  boolean: ["help", "dry-run", "extract", "verbose", "push"],
  alias: { v: "verbose" },
  default: { mjml: "default/digest", key: "default" },
});
const { mkdirp, read, fileExists, save } = require("./config");
const { i18nRender, i18nTplInit } = require("./template.js");
const configOverride = require("./lang").configOverride;

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
      "--key {key to use for subject in config.locales.server.digest.{key}.subject)",
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
    tmp + "email/digest/" + templateName + "/" + lang + ".json"
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
  if (!cfg) return "digest";
  cfg = cfg.digest;
  if (!cfg || !cfg[key] || !cfg[key].subject) return "digest";
  return cfg[key].subject || "digest";
};

(async () => {
  const tplName = argv.mjml;
  if (!tplName) {
    console.log("missing --mjml=template/to/use");
    process.exit(1);
  }
  const campaignName = argv._[0];
  let render = null;

  const campaign = read("campaign/" + campaignName);

  const locales = campaign.config?.locales;
  if (!locales) {
    console.error("no language in", campaignName);
    process.exit(1);
  }

  mkdirp("email/digest/" + tplName);
  for (const lang in locales) {
    try {
      const server = (await i18nTplInit(campaign)) || {};
      let config = { lang: lang, locales: locales[lang] };
      if (server) config.locales["server:"] = server;
      saveConfig(tplName, campaignName, lang, subject(config, argv.key));
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
