require("dotenv").config();
const argv = require("minimist")(process.argv.slice(2));

const { read, api } = require("./config");

const pushCampaignTargets = async (campaignName, file) => {
  const targets = read("target/source/" + file);
  if (targets === null) {
    console.log("no local version of targets");
    return [];
  }
  const formattedTargets = targets
    .map((t) => {
      t.fields = JSON.stringify(t.field);
      if (!t.name) return null; //skip empty records
      delete t.id;
      delete t.field;
      if (!t.emails) {
        t.emails = [];
        if (t.email) {
          // check if multiple emails separated by ";"
          //t.emails = [ {email: t.email.trim()}];
          t.email
            .replace(",", ";")
            .split(";")
            .forEach((d) => {
              t.emails.push({ email: d.trim() });
            });
          delete t.email;
        }
      }
      return t;
    })
    .filter((d) => d !== null);

  const campaign = read("campaign/" + campaignName);
  if (campaign === null) {
    console.log("fetch campaign so I can get its name");
    return [];
  }
  const query = `
mutation UpsertTargets($id: Int!, $targets: [TargetInput!]!) {
  upsertTargets(campaignId: $id, replace: true, targets: $targets) {id}
}
`;
  const ids = await api(
    query,
    { id: campaign.id, targets: formattedTargets },
    "UpsertTargets"
  );
  if (ids.errors) {
    console.error(ids.errors[0]);
  }
  console.log(ids);
  return ids.upsertTargets;
};


(async () => {
  const name = argv._[0];
  if (!name) throw Error("need pushTargets {campaignName} [--source=file]");
  try {
    await pushCampaignTargets(name, argv.source || name);
  } catch (e) {
    console.error(e);
    // Deal with the fact the chain failed
  }
})();
