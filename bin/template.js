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
const configOverride = require("./lang").configOverride;
const getConfigOverride = require("../webpack/config.js").getConfigOverride;
const org = require("./org");

// todo add turndown
const tmp = process.env.REACT_APP_CONFIG_FOLDER
  ? "../" + process.env.REACT_APP_CONFIG_FOLDER + "/"
  : "../config/";

const help = () => {
  console.log(
    [
      "options",
      "--help (this command)",
      "--lang=fr (to overwrite the language in the actionpage)",
      "--dry-run (show the result but don't write)",
      "--extract",
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

const pushTemplate = async (config, html) => {
  const query = `mutation upsertTemplate ($name: String!, $orgName: String!, $html: String!, $locale: String!, $subject: String,$id: Int!) {
    template: upsertTemplate (orgName:$orgName, input: {
      html: $html,
      subject: $subject,
      locale: $locale,
      name: $name,
    })
    actionPage: updateActionPage (id: $id, input: {
      thankYouTemplate: $name
    }) {
    thankYouTemplate
    }
  }`;
  const query2 = `mutation updateActionPage ($id: Int!, $template: String!) {
    actionPage: updateActionPage (id: $id, input: {
      thankYouTemplate: $template
    }) {
    thankYouTemplate
    }
  }`;
  if (!config.filename) {
    console.log("config json invalid, check it first");
    process.exit(1);
  }
  const variables = {
    name: config.filename.replaceAll("/", " "),
    orgName: config.org.name || config.lead.name,
    locale: config.lang,
    html: html,
    subject: i18n.t("email.thankyou.subject", "missing [email subject]"),
    id: config.actionpage,
  };
  const data = await api(query, variables, "upsertTemplate");
  console.log(
    "pushing ",
    variables.name,
    variables.orgName,
    variables.locale,
    variables.subject,
    data
  );
  console.log(data);
  return data;
};

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

const mjml2html = (name, id, tpl) => {
  const render = mjmlEngine(tpl, {});

  const fileName = path.resolve(
    __dirname,
    tmp + "email/actionpage/" + id + ".html"
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

const saveConfig = (id) => {
  const jsonFile = path.resolve(
    __dirname,
    tmp + "email/actionpage/" + id + ".json"
  );

  const type = "thankyou";
  const json = {
    meta: {
      subject: i18n.t("email." + type + ".subject"),
      type: type,
    },
  };

  fs.writeFileSync(jsonFile, JSON.stringify(json, null, 2));
  console.log("saved in", jsonFile);
  return json;
};

(async () => {
  const id = argv._[0];
  const tplName = argv.mjml;
  let lang = null;
  let render = null;
  //const display = argv.display || false;
  const i = await i18nInit;
  await i18n.setDefaultNamespace("server");
  const [file, config, campaign] = getConfigOverride(id);
  const server =
    campaign.config.locales &&
    campaign.config.locales[config.lang] &&
    campaign.config.locales[config.lang]["server:"]; // only campaign and common namespaces are handled by default
  if (server) config.locales["server:"] = server;
  let orgConfig = {};
  try {
    try {
      orgConfig = org.readOrg(config.org.name);
    } catch (e) {
      try {
        orgConfig = await org.getOrg(config.org.name);
      } catch (e) {
        console.log(
          "warning: not enough permissions to fetch the org config, you will not be able to use logo or other org info",
          config.org.name
        );
      }
    }
  } catch (e) {
    console.log(
      "warning: not enough permissions to fetch the org config, you will not be able to use logo or other org info",
      config.org.name
    );
    process.exit(1);
  }
  let mailConfig = read("email/actionpage/" + id);
  console.log("widget ", config.filename);
  lang = config.lang;
  if (argv.lang) {
    if (argv.lang.length !== 2) {
      console.error("invalid language", argv.lang);
      process.exit(1);
    }
    lang = argv.lang;
    console.warn("overriding language with ", lang);
  }

  const d = await i18n.changeLanguage(lang);

  configOverride(config);

  if (!mailConfig) {
    mailConfig = saveConfig(id);
    console.log("config", mailConfig);
  }
  config.locales["server:"] = _merge(config.locales["server:"], mailConfig);
  const fileName = path.resolve(
    __dirname,
    tmp + "email/mjml/" + tplName + ".mjml"
  );

  try {
    const fileName = path.resolve(
      __dirname,
      tmp + "email/mjml/" + tplName + ".mjml"
    );
    let tpl = fs.readFileSync(fileName, "utf8");
    const newTpl = await translateTpl(tpl, lang);
    render = mjml2html(tplName, id, newTpl);
  } catch (e) {
    console.log(e);
  }
  if (argv.push && !argv["dry-run"]) {
    const r = await pushTemplate(config, render.html);
  }
})();
