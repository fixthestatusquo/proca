#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { link, admin, request, basicAuth } = require("@proca/api");
require("./dotenv.js");
const { fetch, read, file, apiLink, fileExists, save } = require("./config");
const { commit, add, onGit } = require("./git");
const getId = require("./id");
const color = require("cli-color");
const argv = require("minimist")(process.argv.slice(2), {
  boolean: ["help", "dry-run", "pull", "verbose", "push"],
  default: { git: true },
  alias: { v: "verbose" },
});

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

const array2string = (s) => {
  if (!s) return "";
  s.forEach((d, i) => {
    if (typeof s[i] === "string") return;
    s[i] = s[i].join("+");
  });
  return s;
};

const actionPageFromLocalConfig = (id, local) => {
  const config = {
    journey: array2string(local.journey),
    layout: local.layout,
    component: local.component,
    locales: local.locales,
    portal: local.portal,
  };

  if (local.test) config.test = true;
  if (local.template) config.template = local.template;

  return {
    id: id,
    actionPage: {
      name: local.filename,
      locale: local.lang,
      config: JSON.stringify(config),
    },
  };
};

const pull = async (actionPage, anonymous) => {
  //  console.log("file",file(actionPage));
  const local = read(actionPage);
  const config = await fetch(actionPage, anonymous);
  save(config);
  return config;
};

const push = async (id) => {
  const local = read(id);
  const c = apiLink();
  const actionPage = actionPageFromLocalConfig(id, local);
  const { data, errors } = await request(
    c,
    admin.UpdateActionPageDocument,
    actionPage
  );
  if (errors) {
    //    console.log(actionPage);
    throw errors;
  }
  return actionPage;
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
        const msg =
          widget.filename +
          " for " +
          widget.org.name +
          " (" +
          widget.organisation +
          ") in " +
          widget.lang +
          " part of " +
          widget.campaign.title;
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
          r = argv.git && (await commit(id + ".json", msg));
          if (argv.git && !r) {
            // no idea,
            console.warn(
              console.red("something went wrong, trying to git add")
            );
            r = await add(id + ".json");
            console.log(r);
            r = await commit(id + ".json");
          }
          if (r.summary) console.log(r.summary);
        }
      }
      if (argv.push && !argv["dry-run"]) {
        const r = argv.git && (await commit(id + ".json"));
        const result = await push(id);

        console.log(
          color.green.bold("pushed", id),
          color.blue(result.actionPage && result.actionPage.name)
        );
        if (r.summary) console.log(r.summary);
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
  module.exports = { pull };
}
