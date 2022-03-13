require("./dotenv.js");
const { pull } = require("./config");
const getId = require ('./id');

(async () => {
  const argv = process.argv.slice(2);
  if (!argv[0]) {
    return console.error("pull {id | name} to pull the actionpage config");
  }
  let id = parseInt(process.env.actionpage || argv[0], 10);
  if (!id) {
    id = await getId(argv[0]);
    id = id.id;
    if (!id) {
      return console.error("pull {id | name} to pull the actionpage config");
    }
  }
  try {
    const d = await pull(id);
    console.log(d);
  } catch (e) {
    console.error(e);
    // Deal with the fact the chain failed
  }
})();
