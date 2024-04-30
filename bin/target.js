#!/usr/bin/env node
const fs = require("fs");
require("dotenv").config();
const i18n = require("./lang").i18next;
const { commit, add, onGit } = require("./git");
const { publishTarget } = require("./publishTargets");
const color = require("cli-color");
const { mainLanguage } = require("./lang");
const { mkdirp, read, file, api, fileExists } = require("./config");

const help = (exitValue) => {
  console.log(
    color.yellow(
      [
        "options",
        "--help (this command)",
        "--dry-run (show the tagets but don't update the server)",
        //          "not done --twitter (set up as a separate proca-twitter)",
        "--git (git update [add]+commit into /config/target/) || --no-git",
        "--pull (from the server)",
        "--digest (process the source and generate a file for digest, like add salutation and language)",
        "--push (update the server)",
        "--publish (update the public list into /config/target/public and make it live)",
        "{campaign name}",
      ].join("\n"),
    ),

    color.blackBright(
      [
        "",
        "(if --push or --digest)",
        "--salutation(add a salutation column based on the gender and language)",
        "--keep[=false] (by default, replace all the contacts and remove those that aren't on the file)",
        "--source[=true] (filter the server list to only keep the targets in the source - if the server has more targets than the source/--keep)",
        "--file=file (by default, config/target/source/{campaign name}.json",
      ].join("\n"),
    ),

    color.blackBright(
      [
        "",
        "(if --publish)",
        "--email (for campaigns sending client side)",
        "--display (filters based on the display field)",
        "--source (filter the server list based on source - if the server has more targets than the source)",
        "--meps , special formatting, done if 'epid' is a field",
        "--[no-]external_id , publishes the externalid",
        "--fields=fieldA,fieldB add extra fields present in source, eg for custom filtering",
      ].join("\n"),
    ),
  );
  process.exit(+exitValue);
};

const argv = require("minimist")(process.argv.slice(2), {
  default: { git: true, salutation: true, external_id: true, source: true },
  string: ["file", "fields"],
  boolean: [
    "help",
    "keep",
    "dry-run",
    "git",
    "pull",
    "digest",
    "push",
    "publish",
    //   "twitter",
    "source",
    "salutation",
    "meps",
    "external_id",
    "email",
  ],
  unknown: (d) => {
    const allowed = []; //merge with boolean and string?
    if (d[0] !== "-") return true;
    if (allowed.includes(d.split("=")[0].slice(2))) return true;
    console.log(color.red("unknown param", d));
    help(1);
  },
});

if (argv._.length !== 1) {
  if (argv._.length === 0) {
    console.log(color.red("missing campaign name"), argv._);
  } else {
    console.log(color.red("only one campaign param allowed"), argv._);
  }
  help(true);
}

const parseEmail = (text) => {
  const emails =
    text && text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi);
  if (!emails) {
    console.log("failed to parse as an email", text);
    return [];
  }
  return emails.map((email) => ({ email: email })); // proca api requires an array of {email:bla@example.org}
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
  let targets = await getCampaignTargets(name);
  if (targets.length === 0) {
    return console.error("not storing empty targets");
  }
  if (argv["dry-run"]) return console.log(JSON.stringify(targets, null, 2));
  if (argv.source) {
    const sources = read("target/source/" + name); // the list of targets from the source
    const c = targets.filter(
      (t) => -1 !== sources.findIndex((d) => d.externalId === t.externalId),
    );
    if (targets.length !== c.length) {
      console.log("total server vs source", targets.length, c.length);
      targets = c;
    }
  }

  await saveTargets(argv.file || name, targets);
  console.log("save target");
  return targets;
};

const readTarget = (targetName) => {
  const fileName = file("target/" + targetName);
  const target = JSON.parse(fs.readFileSync(fileName));
  return target;
};

const saveDigest = async (targetName, targets) => {
  mkdirp("target/digest");
  const fileName = file("target/digest/" + targetName);
  const exists = fileExists("target/digest/" + targetName);
  fs.writeFileSync(fileName, JSON.stringify(targets, null, 2));
  console.log(
    color.green.bold("saving " + targets.length + " targets into", fileName),
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

const saveTargets = async (targetName, targets) => {
  const fileName = file("target/server/" + targetName);
  const exists = fileExists("target/server/" + targetName);
  fs.writeFileSync(fileName, JSON.stringify(targets, null, 2));
  console.log(
    color.green.bold("pulled " + targets.length + " targets into", fileName),
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
      "https://twitter.proca.app/?screen_name=" + targetName,
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

const summary = (campaign) => {
  const source = read("target/source/" + campaign);
  const server = read("target/server/" + campaign);
  const publict = read("target/public/" + campaign);
  if (argv.file) {
    const source = read("target/source/" + argv.file);
    console.log(argv.file, " :", source.length);
  } else {
    console.log("source :", source.length);
  }
  console.log("server :", server.length);
  console.log("public :", publict.length);
};

const formatTarget = async (campaignName, file) => {
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
  let targets = read("target/source/" + file);
  if (targets === null) {
    console.error(color.red("No targets found"));
    process.exit(1);
  }

  const formatTargets = async () => {
    const results = [];
    const added = new Set();

    for (const t of targets) {
      if (!t.name) continue; //skip empty records
      delete t.id;

      if (t.field.lang) {
        t.locale = t.field.lang.toLowerCase();
        delete t.field.lang;
      } else {
        const l = mainLanguage(t.area);
        if (l) t.locale = l;
      }

      if (!t.emails) {
        t.emails = parseEmail(t.email);
        delete t.email;
      }
      if (t.field.avatar === null) {
        console.log("null avatar for ", t.name);
        delete t.field.avatar;
      }
      if (t.field.gender === null) {
        console.log("null gender for ", t.name);
        delete t.field.gender;
      }
      if (!t.field.last_name) {
        console.log("missing lastname for ", t.name, "fallback to name");
        t.field.last_name = t.field.name;
      }
      if (!(t.field.salutation || t.salutation) && argv.salutation) {
        let gender = null;
        if (t.field.gender) {
          if (t.field.gender === "M") gender = "male";
          if (t.field.gender === "F") gender = "female";
        }
        if (salutations[t.locale]) {
          t.field.salutation = i18n.t(salutations[t.locale][gender], {
            name: t.name,
            last_name: t.field.last_name,
            first_name: t.field.first_name,
          });
        } else {
          let language = t.locale ? t.locale.replace("_", "-") : "en";
          await i18n.loadLanguages(t.locale || "en", (err) => {
            if (!err) return;
            console.warn(color.red("missing language", language));
          });
          await i18n.changeLanguage(language || "en");
          t.field.salutation = i18n.t("email.salutation", {
            context: gender,
            target: {
              name: t.name,
              last_name: t.field.last_name,
              first_name: t.field.first_name,
            },
          });
          // console.log("change language", t.locale,language, t.field.salutation);
        }
      }
      t.fields = JSON.stringify(t.field);
      delete t.field;
      if (t.emails.length === 0) {
        console.log("skipping record without email", t.name);
        continue;
      }
      let dupe = false;
      t.emails.forEach((d) => {
        if (added.has(d.email)) {
          console.log("target already set", t.name, d.email);
          dupe = true;
          return;
        }
        added.add(d.email);
      });
      if (dupe) continue;
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
  if (argv["verbose"]) {
    console.log(JSON.stringify(formattedTargets, null, 2));
  }
  if (argv["dry-run"]) {
    process.exit(0);
  }
  return formattedTargets;
};

const digestTarget = async (campaignName, file) => {
  const targets = await formatTarget(campaignName, file);
  console.log("targets", targets.length, file);
  const formattedTargets = targets.map((d) => {
    d.email = d.emails[0].email;
    const fields = JSON.parse(d.fields);
    delete d.emails;
    delete d.fields;
    if (!d.locale && d.lang && d.language) {
      d.locale = d.lang || d.language;
    }
    return { ...fields, ...d };
  });

  saveDigest(argv.file || campaignName, formattedTargets);
};

const pushTarget = async (campaignName, file) => {
  const campaign = read("campaign/" + campaignName);
  const formattedTargets = await formatTarget(campaignName, file);
  console.log("targets", formattedTargets.length);

  const query = `
mutation UpsertTargets($id: Int!, $targets: [TargetInput!]!,$replace:Boolean) {
  upsertTargets(campaignId: $id, replace: $replace, targets: $targets) {id}
}
`;

  const ids = await api(
    query,
    { id: campaign.id, targets: formattedTargets, replace: !argv.keep },
    "UpsertTargets",
  );
  if (ids.errors) {
    ids.errors.forEach((d) => {
      if (d.message === "has messages") {
        console.error(
          color.red(
            "can't remove contact id " +
              d.path[2] +
              " because is has supporters' messages waiting to be sent",
          ),
        );
        console.log(
          color.blue(
            "you can target --push --keep AND target --publish --source",
          ),
        );
      } else {
        const line = d.path[2];
        console.log(d.path);
        console.log(
          "error record",
          line,
          formattedTargets[line]?.name,
          formattedTargets[line]?.emails
            ? color.red(formattedTargets[line]?.emails[0].email)
            : color.red(formattedTargets[line]),
        );
      }
    });
  } else {
    console.log(color.green.bold("...pushed", formattedTargets.length));
  }
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
        "git integration disabled because the config folder isn't on git",
      ),
    );
    argv.git = false;
  }
  (async () => {
    try {
      const name = argv._[0];
      if (argv.help) {
        help(0);
      }
      if (!(argv.push || argv.pull || argv.publish || argv.digest)) {
        summary(name);
        console.error(
          color.red("missing action, either --push --pull --publish --digest"),
        );
        process.exit(1);
      }
      if (argv.digest) {
        //        await pullTarget(name, argv.file || name);
        console.log(argv.file, name, argv.file || name);
        await digestTarget(name, argv.file || name);
      }
      if (argv.push) {
        await pushTarget(name, argv.file || name);
        console.log("push done");
      }
      if (argv.pull) {
        await pullTarget(name, argv.file || name);
        console.log("pull done");
      }
      if (argv.publish) {
        await publishTarget(name, argv);
        console.log("publish done");
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
    getTwitter,
  };
}
