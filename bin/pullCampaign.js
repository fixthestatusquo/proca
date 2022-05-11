require("./dotenv.js");

const { pullCampaign, saveCampaign } = require("./config");

(async () => {
  const argv = process.argv.slice(2);
  if (!argv[0]) throw "need pullCampaign {name}";
  try {
    const d = await pullCampaign(argv[0]);
    console.log(d);
    if (d) {
      const c = saveCampaign(d);
      console.log("saved " + c);
    }
  } catch (e) {
    console.error(e);
    // Deal with the fact the chain failed
  }
})();
