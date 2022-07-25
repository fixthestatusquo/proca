const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
require("./dotenv.js");
const argv = require("minimist")(process.argv.slice(2), {
  boolean: ["help", "dry-run"],
});
const { read, file } = require("./config");
const mjmlEngine = require("mjml");

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

const mjml2html = (tpl) => {
  //preprocessors
  const render = mjmlEngine(tpl, { beautify: true });
  if (argv["dry-run"]) return console.log(render.html);
};

(async () => {
  const name = argv._[0];
  //const display = argv.display || false;

  try {
    const fileName = path.resolve(
      __dirname,
      tmp + "email/mjml/" + name + ".mjml"
    );
    const tpl = fs.readFileSync(fileName, "utf8");
    mjml2html(tpl);
  } catch (e) {
    console.log(e);
  }
})();
