#!/usr/bin/env node
const fs = require("fs");
const fetch = require("cross-fetch");
require("dotenv").config();
const i18nInit = require("./lang").i18nInit;
const i18n = require("./lang").i18next;
const { commit, add, onGit } = require("./git");
const { publishTarget } = require("./buildTargets");
const color = require("cli-color");
const argv = require("minimist")(process.argv.slice(2), {
  default: { git: true },
  boolean: [
    "help",
    "keep",
    "dry-run",
    "git",
    "pull",
    "push",
    "publish",
    "twitter",
    "source",
    "salutation",
    "meps",
  ],
});

const { mainLanguage } = require("./lang");
const { read, file, api, fileExists } = require("./config");

const help = () => {
  if (!argv._.length || argv.help) {
    console.log(
      color.yellow(
        [
          "options",
          "--help (this command)",
          "--dry-run (show the tagets but don't update the server)",
          "not done --twitter (set up as a separate proca-twitter)",
          "--git (git update [add]+commit into /config/target/) || --no-git",
          "--pull (by default)",
          "--push (update the server)",
          "--publish (pdate the public list into /config/target/public and make it live)",
          "{campaign name}",
        ].join("\n")
      ),

      color.blackBright(
        [
          "",
          "(if --push)",
          "--salutation(add a salutation column based on the gender and language)",
          "--keep=false (by default, replace all the contacts and remove those that aren't on the file)",
          "--file=file (by default, config/target/source/{campaign name}.json",
        ].join("\n")
      ),

      color.blackBright(
        [
          "",
          "(if --publish)",
          "--email (for campaigns sending client side)",
          "--display (filters based on the display field)",
          "--source (filter the server list based on source - if the server has more targets than the source)",
          "--meps , special formatting, use the name of the party for description",
          "--fields=fieldA,fieldB add extra fields present in source, eg for custom filtering",
        ].join("\n")
      )
    );
    process.exit(0);
  }
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

const pullTarget = async (name) => {
  const targets = await getCampaignTargets(name);
  if (targets.length === 0) {
    return console.error("not storing empty targets");
  }
  if (argv["dry-run"]) return console.log(targets);

  saveTargets(argv.file || name, targets);
  return targets;
};

const readTarget = (targetName) => {
  const fileName = file("target/" + targetName);
  const target = JSON.parse(fs.readFileSync(fileName));
  return target;
};

const saveTargets = async (targetName, targets) => {
  const fileName = file("target/server/" + targetName);
  const exists = fileExists("target/server/" + targetName);
  fs.writeFileSync(fileName, JSON.stringify(targets, null, 2));
  console.log(
    color.green.bold("wrote " + targets.length + " targets into", fileName)
  );
  let r = null;
  const msg = "saving " + targets.length + " targets";
  if (argv.git) {
    if (!exists) {
      r = await add(fileName);
      console.log("adding", fileName);
    }
    r = argv.git && (await commit(fileName, msg, true));
    console.log(r.summary);
  }
  return fileName;
};

const getTwitter = async (target) => {
  const targetName =
    (target.config.twitter && target.config.twitter.screen_name) || target.name;
  try {
    const res = await fetch(
      "https://twitter.proca.app/?screen_name=" + targetName
    );

    if (res.status >= 400) {
      throw new Error("Bad response from twitter.proca.app");
    }

    const twitter = await res.json();
    twitter.picture = twitter.profile_image_url_https;
    delete twitter.profile_image_url_https;
    if (twitter) target.config.twitter = twitter;
    if (!target.config.description)
      target.config.description = twitter.description;
    if (!target.config.location) target.config.location = twitter.location;
    if (!target.config.url) target.config.url = twitter.url;
  } catch (err) {
    console.error(err);
  }
};

const pushTarget = async (campaignName, file) => {
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
      if (!t.name) continue; //skip empty records
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
          await i18n.changeLanguage(t.locale || "en");
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

  if (!formattedTargets || formattedTargets.length === 0) {
    console.error("No targets found");
    console.log(targets);

    process.exit(1);
  }
  if (argv["dry-run"]) {
    console.log(formattedTargets);
    process.exit(1);
  }

  const query = `
mutation UpsertTargets($id: Int!, $targets: [TargetInput!]!,$replace:Boolean) {
  upsertTargets(campaignId: $id, replace: $replace, targets: $targets) {id}
}
`;

  const ids = await api(
    query,
    { id: campaign.id, targets: formattedTargets, replace: !argv.keep },
    "UpsertTargets"
  );
  if (ids.errors) {
    ids.errors.forEach((d) => {
      const line = d.path[2];
      console.log(
        "error record",
        line,
        formattedTargets[line].name,
        color.red(formattedTargets[line].emails[0].email)
      );
    });
  }
  console.log(color.green.bold("pushed", formattedTargets.length));
  return ids.upsertTargets;
};

const getTarget = async (name) => {
  const extraQuery =
    (argv.pages ? " actionPages {id name locale}" : "") +
    (argv.users ? " users {email lastSigninAt role}" : "");

  const query =
    `
query GetTarget($name: String!) {
  target(name:$name) {
  ... on PrivateTarget {
      id name title processing {emailFrom,supporterConfirm,doiThankYou} config ` +
    extraQuery +
    `
    }
  }
}
`;

  const data = await api(query, { name }, "GetTarget");
  if (!data.target) throw new Error("can't find target " + name);

  if (data.target.config) data.target.config = JSON.parse(data.target.config);
  return data.target;
};

if (require.main === module) {
  // this is run directly from the command line as in node xxx.js
  if (!onGit()) {
    console.warn(
      color.italic.yellow(
        "git integration disabled because the config folder isn't on git"
      )
    );
    argv.git = false;
  }
  (async () => {
    try {
      const name = argv._[0];
      help();
      let target = null;
      if (argv.push) {
        await pushTarget(name, argv.file || name);
      }
      if (argv.pull || !(argv.push || argv.publish)) {
        target = await pullTarget(name);
      }
      if (argv.publish && !argv["dry-run"]) {
        await publishTarget(name, argv);
      }
    } catch (e) {
      console.error(e);
      // Deal with the fact the chain failed
    }
  })();
} else {
  //export a bunch
  module.exports = {
    getTarget,
    pullTarget,
    pushTarget,
    readTarget,
  };
}
