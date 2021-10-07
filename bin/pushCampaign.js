#!/usr/bin/node
require("dotenv").config();

const { pushCampaign } = require("./config");

(async () => {
  const argv = process.argv.slice(2);
  if (!argv[0]) throw "need pushCampaign {name}";
  try {
    const d = await pushCampaign(argv[0]);
    console.log(d);
  } catch (e) {
    console.error(e);
    // Deal with the fact the chain failed
  }
})();
