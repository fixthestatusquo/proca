require("dotenv").config();

const { push } = require("./config");

(async () => {
  const argv = process.argv.slice(2);
  const id = parseInt(process.env.actionpage || argv[0]);
  if (!id) throw "need actionpage={id} or push {id}";
  try {
    const d = await push(parseInt(id, 10));
    console.log(d);
  } catch (exc) {
    const errors = exc.result.errors;
    if (errors && errors instanceof Array) {
      errors.map((e) => {
        console.error("\x1b[31m", e.message);
      });
    } else {
      console.error(exc);
    }
    // Deal with the fact the chain failed
  }
})();
