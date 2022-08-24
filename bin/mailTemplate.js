#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
require("./dotenv.js");
const _set = require("lodash/set");
const _merge = require("lodash/merge");
const argv = require("minimist")(process.argv.slice(2), {
  boolean: ["help", "dry-run", "extract", "verbose"],
  alias: { v: "verbose", l: "lang" },
  default: { lang: "en" },
});
const { read, file } = require("./config");
const mjmlEngine = require("mjml");
const htmlparser2 = require("htmlparser2");
const render = require("dom-serializer").default;
const i18nInit = require("./lang").i18nInit;
const i18n = require("./lang").i18next;

const tmp = process.env.REACT_APP_CONFIG_FOLDER
  ? "../" + process.env.REACT_APP_CONFIG_FOLDER + "/"
  : "../config/";

const help = () => {
  console.log(
    [
      "options",
      "--help (this command)",
      "--dry-run (show the result but don't write)",
      "--extract",
      "mjml file to process (in config/mjml/...",
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

const mjml2html = (name, lang, tpl) => {
  const render = mjmlEngine(tpl, {});

  const fileName = path.resolve(
    __dirname,
    tmp + "email/html/" + name + "." + lang + ".html"
  );
  if (argv.verbose) {
    console.log(JSON.stringify(render.errors, null, 2));
  }
  if (argv["dry-run"]) {
    console.log("would write in ", fileName, render.html);
    return;
  }

  fs.writeFileSync(fileName, render.html);

  //render.html is the one we need to update?
};

(async () => {
  const name = argv._[0];
  //const display = argv.display || false;
  const i = await i18nInit;
  await i18n.setDefaultNamespace("server");
  if (argv.lang.length !== 2) {
    console.error("invalid language", argv.lang);
    process.exit(1);
  }
  const d = await i18n.changeLanguage(argv.lang);
  try {
    const fileName = path.resolve(
      __dirname,
      tmp + "email/mjml/" + name + ".mjml"
    );
    let tpl = fs.readFileSync(fileName, "utf8");
    const newTpl = await translateTpl(tpl, argv.lang);
    mjml2html(name, argv.lang, newTpl);
  } catch (e) {
    console.log(e);
  }
})();
