#!/usr/bin/env node
const fs = require("fs");
const { pathConfig } = require("./config");
const simpleGit = require("simple-git");
require("./dotenv.js");
const color = require("cli-color");
const actions = [
  "help",
  "dry-run",
  "pull",
  "commit",
  "add",
  "publish",
  "status",
  "push",
];

const argv = require("minimist")(process.argv.slice(2), {
  boolean: actions,
  alias: { v: "verbose" },
});

if (argv._[0] && actions.includes(argv._[0])) {
  argv[argv._[0]] = true;
  argv._.shift();
}

const changeDir = () => {
  process.chdir(pathConfig());
};
// changeDir();

const onGit = () => {
  return fs.existsSync(pathConfig() + "/.git");
};

const help = () => {
  if (
    !(
      argv._.length > 0 ||
      argv.status ||
      argv.commit ||
      argv.pull ||
      argv.deploy ||
      argv.push
    ) ||
    argv.help
  ) {
    console.log(
      [
        "options",
        "--help (this command)",
        "--dry-run (verbose, but don't write)",
        "--pull (by default)",
        "--deploy (assuming there is a N8N configured for that)",
        "--status (show if local files are created/updated)",
        "--push (update the server)",
        "git",
      ].join("\n")
    );
    process.exit(0);
  }
};

const git = simpleGit({ baseDir: pathConfig() });

const deploy = async () => {
  const N8N_TOKEN = process.env.N8N_TOKEN;
  const url =
    process.env.N8N_URL ||
    "https://workflow.proca.app/webhook/proca-config/pull";
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + N8N_TOKEN,
    },
  });
  const body = await response.json();
  console.log(body);
  return body;
  //curl -X POST https://workflow.proca.app/webhook/proca-config/pull -H "Authorization: Bearer $N8N_TOKEN"
};

const commit = async (file, message, createIfNotExist) => {
  const cmd = process.argv.slice(1).join(" ");
  let result = null;
  if (!message) {
    message = "update by " + process.env.AUTH_USER + " running " + cmd;
  }
  try {
    if (file && file.length) {
      result = await git.commit(message, file);
    } else {
      result = await git.commit(message);
    }
  } catch (e) {
    if (createIfNotExist) {
      result = await add(file);
      console.log(result);
      result = await commit(file, message, false);
    } else {
      console.error("git commit", color.red(e));
      return false;
    }
  }
  return result;
};

const push = async () => {
  try {
    const r = await git.push();
  } catch (e) {
    if (e.git) console.error(color.red(e.git));
    else {
      console.error(color.red(e.stack));
    }
    return false;
  }
  return true;
};

const pull = async () => {
  try {
    const r = await git.pull();
  } catch (e) {
    if (e.git) console.error(color.red(e.git));
    else {
      console.error(color.red(e.stack));
    }

    return false;
  }
  return true;
};

const add = async (file) => {
  const cmd = process.argv.slice(1).join(" ");
  let result = null;
  try {
    if (file && file.length) {
      result = await git.add(file);
    } else {
      result = await git.add(".");
    }
  } catch (e) {
    console.error("git add ", color.red(e));
    return false;
  }
  return true;
};

const newFiles = async () => {
  const status = await git.status();
  return status.not_added;
};

const parseFiles = () => {
  if (argv._.length === 0) return null;
  const f = argv._.map((file) =>
    /^\d+$/.test(file) ? file + ".json" : file.replace("config/", "")
  );
  console.log(f);
  return f;
};

const status = async () => {
  const status = await git.status();
  /*
    not_added: [],
  conflicted: [],
  created: [],
  deleted: [],
  ignored: undefined,
  modified
  */
  "not_added,created,modified,deleted,conflicted".split(",").forEach((type) => {
    if (status[type].length) {
      status[type].forEach((file) => {
        console.log(color.red(type), "config/" + file);
      });
    }
  });
};

if (require.main === module) {
  // this is run directly from the command line as in node xxx.js
  help();
  (async () => {
    const anonymous = true;
    try {
      const files = parseFiles();
      if (argv.status) {
        await status();
      }
      if (argv.pull) {
        const p = await pull();
        console.log(p);
      }
      if (argv.add) {
        const p = await add(files);
      }
      if (argv.commit) {
        const r = commit(files);
        console.log(r);
      }
      if (argv["dry-run"] || argv.verbose) {
        await status();
        process.exit(1);
      }
      if (argv.push) {
        const p = await push(files);
      }
      if (argv.deploy) {
        const p = await deploy();
      }
    } catch (e) {
      console.error(e);
      // Deal with the fact the chain failed
    }
  })();
} else {
  //export a bunch
  module.exports = {
    add,
    commit,
    deploy,
    push,
    pull,
    onGit,
  };
}
