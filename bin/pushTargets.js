require("dotenv").config();
const argv = require("minimist")(process.argv.slice(2));

const { read, api } = require("./config");
const { mainLanguage } = require("./lang");

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
      if (t.fields.lang) {
        t.locale = t.fields.lang;
      } else {
         const l = mainLanguage(t.area);
        console.log("lang",l);
        if (l)
          t.locale = l;
      }


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
mutation UpsertTargets($id: Int!, $targets: [TargetInput!]!,$replace:Boolean) {
  upsertTargets(campaignId: $id, replace: $replace, targets: $targets) {id}
}
`;
  if (formattedTargets.length ===0){
    console.error("No targets found");
    process.exit(1);
  }

  const ids = await api(
    query,
    { id: campaign.id, targets: formattedTargets, replace:true },
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
