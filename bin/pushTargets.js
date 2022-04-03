require("dotenv").config();
const argv = require('minimist')(process.argv.slice(2));

const { pushCampaignTargets } = require("./config");


(async () => {
  const name = argv._[0];
  if (!name) throw Error("need pushTargets {campaignName} [--source=file]");
  try {
    await pushCampaignTargets(name, argv.source || name );
  } catch (e) {
    console.error("aaa",e.errors);
    console.error(e);
    // Deal with the fact the chain failed
  }
})();
