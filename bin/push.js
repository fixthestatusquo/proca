require("./dotenv.js");

const { push } = require("./config");
const getId = require("./id");

(async () => {
  const argv = process.argv.slice(2);
  if (!argv[0]) {
    return console.error("push {id | name} to publish the actionpage config");
  }
  let id = parseInt(process.env.actionpage || argv[0], 10);
  if (!id) {
    id = await getId(argv[0]);
    id = id.id;
    if (!id) {
      return console.error("push {id | name} to publish the actionpage config");
    }
  }
  try {
    const d = await push(id);
    console.log(d);
  } catch (errors) {
    console.log(errors);
    Array.isArray(errors) &&
      errors.map(e => {
        console.error("\x1b[31m", e.message);
      });
    // Deal with the fact the chain failed
  }
})();
