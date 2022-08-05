#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
require("./dotenv.js");

const argv = require("minimist")(process.argv.slice(2), {
  boolean: ["help", "dry-run"],
});
const { read, file } = require("./config");
const mjmlCore = require("mjml-core");
const mjmlEngine = require("mjml");
const registerComponent = mjmlCore.registerComponent;

const Mji18nComponent = require("./components/Mji18n.js").default;
registerComponent(Mji18nComponent);
console.log(mjmlCore);
const tmp = process.env.REACT_APP_CONFIG_FOLDER
  ? "../" + process.env.REACT_APP_CONFIG_FOLDER + "/"
  : "../config/";

const help = () => {
  console.log(
    [
      "options",
      "--help (this command)",
      "--dry-run (show the result but don't write)",
      "mjml file to process (in config/mjml/...",
      //      "boolean inputs, no validatiton, everything but 'false' will be set to 'true'"
    ].join("\n")
  );
  process.exit(0);
};

if (!argv._.length || argv.help) {
  return help();
}

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
  //preprocessors
  const render = mjmlEngine(tpl, {});

  if (argv["dry-run"]) {
    console.log(render);
    parsei18n(render.json);
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
    mjml2html(tpl);
  } catch (e) {
    console.log(e);
  }
})();
