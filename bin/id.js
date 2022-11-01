#!/usr/bin/env node
require("./dotenv.js");
const { api } = require("./config");

const getId = async (name) => {
  const query = `query actionPage ($name:String!) {
  actionPage (name:$name) {
    id, name, locale, journey
    campaign {
      id,
      title,name,
      org {name}
    },
    org {
      name
    }
  }
}`;
  const r = await api(query, { name: name }, "actionPage");
  if (r.errors) return r;
  return r.actionPage;
};

if (require.main === module) {
  // we are a cli
  (async () => {
    const argv = process.argv.slice(2);
    const name = argv[0];
    if (!name)
      return console.error(
        "node id.js {name} to get the actionpage id based on the path"
      );
    try {
      const d = await getId(name);
      if (d.errors) {
        console.error("path " + name + " not found");
        process.exit(1);
      }
      console.log(d);
    } catch (e) {
      console.error(e);
    }
  })();
} else {
  // we are a module
  module.exports = getId;
}
