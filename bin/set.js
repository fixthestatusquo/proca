#!/usr/bin/env node
const fs = require("fs");
require("./dotenv.js");
const { read, file, save, push, pull } = require("./config");
const argv = require("minimist")(process.argv.slice(2));
const merge = require("lodash.merge");

console.log(argv);

const help = () => {
  console.log(
    [
      "options",
      "--help (this command)",
      "--push (push the modified config to the server)",
      "--pull (pull the config from the server before doing the modification)",
      "--color=#cafebebe (set the primary color)",
      "--bla",
      " {id} (actionpage id)",
    ].join("\n")
  );
  process.exit(0);
};
if (argv.help) {
  help();
}

const id = argv._[0];
if (!id) {
  console.error("actionpage id missing");
  help();
  process.exit(1);
}
(async () => {
  if (argv.pull) {
    try {
      const d = await pull(id);
    } catch (errors) {
      Array.isArray(errors) &&
        errors.map((e) => {
          console.error("\x1b[31m", e.message);
        });
    }
  }

  if (argv.color) {
    // todo, add some QA if the color is an hex
    return update(id, { layout: { primaryColor: argv.color } });
  }

  if (argv.push) {
    // must be the last one
    try {
      const d = await push(id);
    } catch (errors) {
      Array.isArray(errors) &&
        errors.map((e) => {
          console.error("\x1b[31m", e.message);
        });
    }
  }
  console.error("missing or incorrect parameter");
  help();
})();

function update(id, d) {
  let current = read(id);
  const next = merge(current, d);
  save(next);
}
