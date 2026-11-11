require("dotenv").config();
const { fetch } = require("./config.js");

(async () => {
  const argv = process.argv.slice(2);
  const id = parseInt(process.env.actionpage || argv[0], 10);
  if (!id) throw new Error("need actionpage={id} or fetch {id}");
  try {
    const d = await fetch(parseInt(id, 10));
    console.log(JSON.stringify(d, null, 2));
  } catch (e) {
    console.error(e);
    // Deal with the fact the chain failed
  }
})();
