const fs = require("fs");
const { pullTarget } = require("./target");
require("dotenv").config();
const argv = require("minimist")(process.argv.slice(2), {
  boolean: ["help", "keep", "dry-run"],
});

const { file, write, api } = require("./config");

if (require.main === module) {
  if (!argv._.length || argv.help) {
    console.log(
      [
        "options",
        "--help (this command)",
        "--dry-run(show the parsed targets but don't write)",
        "--file=file (by default, config/target/server/{campaign name}.json",
        "pullTargets {campaign name}",
      ].join("\n")
    );
  }

  (async () => {
    try {
      await pullTarget(argv._[0]);
    } catch (e) {
      console.error(e);
      // Deal with the fact the chain failed
    }
  })();
} else {
  //export a bunch
  console.log("warning: use bin/target directly");
  module.exports = {
    pullTarget,
  };
}
