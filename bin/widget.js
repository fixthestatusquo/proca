#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
require("./dotenv.js");
const { pull, push, fetch, read, file, fileExists, save } = require("./config");
const { commit, add, onGit } = require("./git");
const getId = require("./id");
const color = require("cli-color");
const argv = require("minimist")(process.argv.slice(2), {
  boolean: ["help", "dry-run", "pull", "verbose", "push"],
  default: { git: true },
  alias: { v: "verbose" },
});
//const { read, file, api } = require("./config");

const help = () => {
  if (!argv._.length || argv.help) {
    console.log(
      color.yellow(
        [
          "options",
          "--help (this command)",
          "--dry-run (show the parsed widget but don't write)",
          "--pull (by default)",
          "--git (git update [add]+commit the local /config) || --no-git",
          "--push (update the server)",
          "widget {actionpage id}",
        ].join("\n")
      )
    );
    process.exit(0);
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
    try {
      const id = argv._[0];
      let widget = null;
      if (argv.pull || !argv.push) {
        widget = await fetch(id, anonymous);
        //const local = read(actionPage);
        //if (local && JSON.stringify(local) !== JSON.stringify(widget)) {
        //    backup(actionPage);
        // }
        if (!argv["dry-run"]) {
          const exists = fileExists(id);
          const fileName = save(widget);
          let r = null;
          if (!exists && argv.git) {
            r = await add(id + ".json");
            console.log("adding", r);
          }
          console.log(
            color.green.bold("saved", fileName),
            color.blue(widget.filename)
          );
          r = argv.git && (await commit(id + ".json"));
          if (argv.git && !r) {
            // no idea,
            console.log("something went wrong, trying to git add");
            r = await add(id + ".json");
            console.log(r);
            r = await commit(id + ".json");
          }
          if (r.summary) console.log(r.summary);
        }
      }
      if (argv.push && !argv["dry-run"]) {
        const result = await push(id);

        console.log(
          color.green.bold("pushed", id),
          color.blue(result.actionPage && result.actionPage.name)
        );
      }
      if (argv["dry-run"] || argv.verbose) {
        if (!widget) {
          widget = await read(id);
        }
        console.log(widget);
      }
    } catch (e) {
      console.error(e);
      // Deal with the fact the chain failed
    }
  })();
} else {
  //export a bunch
  module.exports = {};
}
