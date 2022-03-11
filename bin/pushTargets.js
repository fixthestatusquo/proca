require("dotenv").config();

const { pushCampaignTargets } = require("./config");


(async () => {
  const argv = process.argv.slice(2);
  if (!argv[0]) throw Error("need pushTargets {campaignName}");
  try {
    await pushCampaignTargets(argv[0]);
  } catch (e) {
    console.error(e);
    // Deal with the fact the chain failed
  }
})();
