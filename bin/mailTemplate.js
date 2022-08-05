#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
require("./dotenv.js");
const _set = require("lodash/set");
const _merge = require("lodash/merge");
const argv = require("minimist")(process.argv.slice(2), {
  boolean: ["help", "dry-run", "extract", "verbose"],
});
const { read, file } = require("./config");
const mjmlEngine = require("mjml");
const htmlparser2 = require("htmlparser2");
//const render = require("dom-serializer").default;

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
const extracti18n = (string) => {
  let trans = {};
  let keys = {};
  let currentKey = null; // or current key to extract the text into

  const parser = new htmlparser2.Parser({
    onopentag(name, attributes) {
      if (attributes.i18n) {
        currentKey = attributes.i18n;
      }
    },
    ontext(text) {
      if (currentKey) {
        keys[currentKey] = text.trim();
        currentKey = null;
      }
    },
    onclosetag(tagname) {},
  });
  parser.write(string);
  parser.end();

  for (let nskey in keys) {
    let key = "";
    if (nskey.includes(":")) key = nskey.replace(":", ".");
    else key = "server." + nskey;
    _set(trans, key, keys[nskey]);
  }
  if (argv["dry-run"]) {
    console.log(JSON.stringify(trans, null, 2));
    return;
  }
  if (argv.extract) {
    updateTranslation("server", trans);
  }
  return trans;
};

const parsei18n = (json) => {
  console.log("parsei18n", json.tagName);
  if (Array.isArray(json)) {
    console.log("in array");
    for (const item in json) {
      console.log("array", item);
      parsei18n(item);
    }
  } else {
    //    console.log(json);process.exit(1);
  }
  if (json.children) {
    for (const child in json.children) {
      //      console.log("parse child",json.children [child]);
      parsei18n(json.children[child]);
    }
  }
  //  console.log(json.tagName,json.attributes);
};

const mjml2html = (tpl) => {
  const render = mjmlEngine(tpl, {});

  if (argv["dry-run"]) {
    console.log(render);
    //parsei18n(render.json);
  }

  //render.html is the one we need to update?
};

(async () => {
  const name = argv._[0];
  //const display = argv.display || false;

  try {
    const fileName = path.resolve(
      __dirname,
      tmp + "email/mjml/" + name + ".mjml"
    );
    let tpl = fs.readFileSync(fileName, "utf8");
    const trans = extracti18n(tpl);
    if (argv.verbose) {
      console.log("i18n keys found", JSON.stringify(trans, null, 2));
    }
    mjml2html(tpl);
  } catch (e) {
    console.log(e);
  }
})();
