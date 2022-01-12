require("dotenv").config();

const { pushCampaignTargets } = require("./config");


(async () => {
  const argv = process.argv.slice(2);
  if (!argv[0]) throw Error("need pullTargets {campaignName}");
  try {
    await pushCampaignTargets(argv[0]);
  } catch (e) {
    console.error(e);
    // Deal with the fact the chain failed
  }
})();
