require("dotenv").config();
const i18nInit = require("./lang").i18nInit;
const i18n = require("./lang").i18next;
const color = require("cli-color");
const argv = require("minimist")(process.argv.slice(2), {
  boolean: ["help", "keep", "dry-run", "salutation"],
});
const { pushTarget } = require("./target");

const { read, api } = require("./config");
const { mainLanguage } = require("./lang");

if (!argv._.length || argv.help) {
  console.log(
    [
      "options",
      "--help (this command)",
      "--dry-run (show the parsed targets but don't push)",
      "--salutation(add a salutation column based on the )",
      "--keep=false (by default, replace all the contacts and remove those that aren't on the file)",
      "--file=file (by default, config/target/source/{campaign name}.json",
      "pushTarget {campaign name}",
    ].join("\n")
  );
  process.exit(0);
}
(async () => {
  const name = argv._[0];
  const i = await i18nInit;
  if (!name) help();
  try {
    await pushTarget(name, argv.file || name);
  } catch (e) {
    console.error(e);
    // Deal with the fact the chain failed
  }
})();
