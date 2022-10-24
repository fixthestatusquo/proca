require("dotenv").config();
const i18nInit = require("./lang").i18nInit;
const i18n = require("./lang").i18next;
const argv = require("minimist")(process.argv.slice(2), {
  boolean: ["help", "keep", "dry-run", "salutation"],
});

const { read, api } = require("./config");
const { mainLanguage } = require("./lang");

if (!argv._.length || argv.help) {
  console.log(
    [
      "options",
      "--help (this command)",
      "--dry-run (show the parsed targets but don't push)",
      "--salutation(add a salutation column based on the )",
      "--keep=false (by default, replace all the contacts and remove those that aren't on the file)",
      "--file=file (by default, config/target/source/{campaign name}.json",
      "pushTarget {campaign name}",
    ].join("\n")
  );
  process.exit(0);
}
const pushCampaignTargets = async (campaignName, file) => {
  const campaign = read("campaign/" + campaignName);
  const salutations = {};
  if (argv.salutation) {
    Object.keys(campaign.config.locales).forEach((lang) => {
      const common = campaign.config.locales[lang]["common:"];
      const salutation = common?.salutation;
      if (salutation) salutations[lang] = salutation;
      if (!salutation && campaign.config.locales.en["common:"])
        salutations[lang] = campaign.config.locales.en["common:"].salutation; //WORKAROUND to default to en
    });
  }
  const targets = read("target/source/" + file);
  if (targets === null) {
    console.log("no local version of targets");
    return [];
  }
  const formatTargets = async () => {
    const results = [];
    for (t of targets) {
      if (!t.name) return null; //skip empty records
      delete t.id;

      if (t.lang) {
        t.locale = t.lang;
      } else {
        const l = mainLanguage(t.area);
        if (l) t.locale = l;
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
      if (!t.salutation && argv.salutation) {
        let gender = null;
        if (t.field.gender) {
          if (t.field.gender === "M") gender = "male";
          if (t.field.gender === "F") gender = "female";
        }
        if (salutations[t.locale]) {
          t.field.salutation = i18n.t(salutations[t.locale][gender], {
            name: t.name,
          });
        } else {
          await i18n.changeLanguage(t.locale);
          t.field.salutation = i18n.t("email.salutation", {
            context: gender,
            target: { name: t.name },
          });
        }
      }
      t.fields = JSON.stringify(t.field);
      delete t.field;
      results.push(t);
    }
    return results;
  };

  const formattedTargets = await formatTargets();

  if (campaign === null) {
    console.log("fetch campaign so I can get its name");
    return [];
  }

  const query = `
mutation UpsertTargets($id: Int!, $targets: [TargetInput!]!,$replace:Boolean) {
  upsertTargets(campaignId: $id, replace: $replace, targets: $targets) {id}
}
`;

  if (formattedTargets.length === 0) {
    console.error("No targets found");
    process.exit(1);
  }
  if (argv["dry-run"]) {
    console.log(await formattedTargets);
    process.exit(1);
  }

  const ids = await api(
    query,
    { id: campaign.id, targets: formattedTargets, replace: !argv.keep },
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
  const i = await i18nInit;
  if (!name) help();
  try {
    await pushCampaignTargets(name, argv.file || name);
  } catch (e) {
    console.error(e);
    // Deal with the fact the chain failed
  }
})();
