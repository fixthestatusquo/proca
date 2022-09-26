require("./dotenv.js");
const { pull } = require("./config");
const getId = require("./id");
const argv = require("minimist")(process.argv.slice(2), {
  boolean: ["help", "anonymous", "dry-run"],
});

const help = () => {
  console.log(
    [
      "options",
      "--help (this command)",
      //      "--dry-run (show the result but don't pull)",
      "--anonymous",
      "<id> to pull the actionpage config",
      //      "boolean inputs, no validatiton, everything but 'false' will be set to 'true'"
    ].join("\n")
  );
  process.exit(0);
};

(async () => {
  if (!argv._[0]) {
    console.error("missing actionpage id");
    help();
    process.exit(1);
  }
  let id = parseInt(process.env.actionpage || argv._[0], 10);
  if (!id) {
    id = await getId(argv._[0]);
    id = id.id;
    if (!id) {
      return console.error("pull {id | name} to pull the actionpage config");
    }
  }
  try {
    const d = await pull(id, argv.anonymous);
    console.log(JSON.stringify(d, null, 2));
  } catch (e) {
    console.error(e);
    // Deal with the fact the chain failed
  }
})();
