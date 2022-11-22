const fs = require("fs");

require("dotenv").config();
const argv = require("minimist")(process.argv.slice(2), {
  boolean: ["help", "keep", "dry-run"],
});

const { file, write, api } = require("./config");

if (!argv._.length || argv.help) {
  console.log(
    [
      "options",
      "--help (this command)",
      "--dry-run(show the parsed targets but don't write)",
      "--file=file (by default, config/target/server/{campaign name}.json",
      "pullTargets {campaign name}",
    ].join("\n")
  );
  process.exit(0);
}

const saveTargets = (campaignName, targets) => {
  const fileName = file("target/server/" + campaignName);
  fs.writeFileSync(fileName, JSON.stringify(targets, null, 2));
  return fileName;
};

const getCampaignTargets = async (name) => {
  const query = `
query GetCampaignTargets($name: String!) {
  campaign(name:$name) {
  ... on PrivateCampaign {
    targets {
      id name area fields locale externalId
      ... on PrivateTarget {
          emails { email, emailStatus }
        }
      }
    }
  }
}
`;

  const data = await api(query, { name }, "GetCampaignTargets");
  if (!data.campaign) throw new Error("can't find campaign " + name);
  if (!data.campaign.targets || data.campaign.targets.length === 0)
    throw new Error("No targets.");
  data.campaign.targets = data.campaign.targets.map((t) => {
    if (t.fields) t.fields = JSON.parse(t.fields);
    return t;
  });
  return data.campaign.targets;
};

const pullCampaignTargets = async (name) => {
  const targets = await getCampaignTargets(name);
  if (targets.length === 0) {
    return console.error("not storing empty targets");
  }
  if (argv["dry-run"]) return console.log(targets);

  saveTargets(argv.file || name, targets);
  return targets;
};

if (require.main === module) {
  (async () => {
    try {
      await pullCampaignTargets(argv._[0]);
    } catch (e) {
      console.error(e);
      // Deal with the fact the chain failed
    }
  })();
} else {
  //export a bunch
  const pullTarget = pullCampaignTargets;
  module.exports = {
    pullTarget,
  };
}
