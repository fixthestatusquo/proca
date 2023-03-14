#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
require("./dotenv.js");
const _set = require("lodash/set");
const _merge = require("lodash/merge");
const argv = require("minimist")(process.argv.slice(2), {
  boolean: ["help", "dry-run", "extract", "verbose", "push"],
  alias: { v: "verbose" },
  default: { mjml: "default/thankyou" },
});
const { read, file, api } = require("./config");
const mjmlEngine = require("mjml");
const htmlparser2 = require("htmlparser2");
const render = require("dom-serializer").default;
const i18nInit = require("./lang").i18nInit;
const i18n = require("./lang").i18next;
// const configOverride = require("./lang").configOverride;
const org = require("./org");

// const pushTemplate = require('./template.js').pushTemplate;

const tmp = process.env.REACT_APP_CONFIG_FOLDER
  ? "../" + process.env.REACT_APP_CONFIG_FOLDER + "/"
  : "../config/";

  console.log("argv", argv);
const help = () => {
  console.log(
    [
      "options",
      "--help (this command)",
      "--lang=fr (to overwrite the language in the actionpage)",
      "--dry-run (show the result but don't write)",
      "--extract",
      "--digest (to crete a digest template for each language)",
      "actionpage_id",
      "--mjml {template to use in config/mjml, default default/thankyou)",
      //      "boolean inputs, no validatiton, everything but 'false' will be set to 'true'"
    ].join("\n")
  );
  process.exit(0);
};

if (!argv._.length || argv.help) {
  return help();
}


const updateTranslation = (namespace, parsed) => {
  const file = path.resolve(__dirname, "../src/locales/en/server.json");
  const initial = JSON.parse(fs.readFileSync(file, "utf8"));
  const updated = _merge({}, parsed[namespace], initial);
  if (argv["dry-run"]) {
    console.log(JSON.stringify(updated, null, 2));
    return;
  }
  fs.writeFileSync(file, JSON.stringify(updated, null, 2));
};

const deepify = (keys) => {
  // convert an array of keys for the t function to the translation json
  let trans = {};
  for (let nskey in keys) {
    let key = "";
    if (nskey.includes(":")) key = nskey.replace(":", ".");
    else key = "server." + nskey;
    _set(trans, key, keys[nskey]);
  }
  return trans;
};

const translateTpl = (tpl, lang) =>
  new Promise((resolve, reject) => {
    const keys = {};
    const util = htmlparser2.DomUtils;
    const handler = new htmlparser2.DomHandler((error, dom) => {
      if (error) {
        console.log(error);
        reject(error);
      }
      const i18node = util.find(
        (e) => util.getAttributeValue(e, "i18n"),
        dom,
        true,
        999
      );
      i18node.forEach((d) => {
        const text = util.getChildren(d)[0];
        if (text.type !== "text") {
          console.log("wrong children", d);
          reject({ error: "wrong child, was expecting text", elem: d });
        }
        keys[d.attribs.i18n] = text.data;
        console.log("key", d.attribs.i18n, i18n.t(d.attribs.i18n));
        text.data = i18n.t(d.attribs.i18n); // translation to the new language
      });
      const trans = deepify(keys);
      if (argv.extract) {
        if (argv["dry-run"]) {
          console.log("i18n keys", keys, JSON.stringify(trans, null, 2));
        } else updateTranslation("server", trans);
      }
      resolve(render(dom));
    });
    const parser = new htmlparser2.Parser(handler);
    const dom = parser.write(tpl);
    parser.end();
  });

const mjml2html = (name, campaignName, tpl, lang) => {
  console.log("mjml2html", name, campaignName, tpl);
  const render = mjmlEngine(tpl, {});

  const fileName =
    path.resolve(
      tmp + "email/digest/" + name + "." + lang  + ".html"
    );

  console.log("fileName", fileName);
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

const saveConfig = (templateName, lang, subject ) => {

  const jsonFile =
  path.resolve(
    __dirname,
    tmp + "email/digest/" + templateName + '.' + lang + ".json"
  )

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

  let lang = null;
  let render = null;

  const i = await i18nInit;
  await i18n.setDefaultNamespace("server");

  const p = path.resolve(
    __dirname, tmp + "campaign/" + campaignName + '.json');

  const campaign = JSON.parse(fs.readFileSync(p));

  const locales = campaign.config?.locales;



  for (const lang in locales) {
if (locales[lang]["server:"]) {
    console.log("language", locales[lang]["server:"]);

    const { digest } = locales[lang]["server:"]

  let org = campaign.org.name;
  console.log("org", org)
   let orgConfig = {};
  try {
    console.log("campaign.config.org.name", org)
    try {
      orgConfig = org.readOrg(org);
      console.log("orgConfig", orgConfig)
    } catch (e) {
      try {
        orgConfig = await org.getOrg(org);
        console.log("orgConfig jeijeeej", orgConfig)
      } catch (e) {
        console.log(
          "warning: not enough permissions to fetch the org config, you will not be able to use logo or other org info",
          org
        );
      }
    }
  } catch (e) {
    console.log(
      "warning: not enough permissions to fetch the org config, you will not be able to use logo or other org info",
      campaign.config.org.name
    );
    process.exit(1);
  }
// TO DO: RETURN IF NOT EXISTS
    mailConfig = saveConfig(tplName, lang, digest.initial.subject);


  try {
    const fileName = path.resolve(
      __dirname,
      tmp + "email/mjml/" + tplName + ".mjml"
    );
    let tpl = fs.readFileSync(fileName, "utf8");
    const newTpl = await translateTpl(tpl, lang);
    render = mjml2html(tplName, campaignName, newTpl, lang);
  } catch (e) {
    console.log(e);
  }
  if (argv.push && !argv["dry-run"]) {
    // const r = await pushTemplate(config, render.html);
  }
  }
  }
}

  ) ();