const fs = require("fs");
require("./dotenv.js");
const { read, file } = require("./config");
const { commit, push, deploy } = require("./git");
const argv = require("minimist")(process.argv.slice(2), {
  boolean: ["help", "keep", "dry-run", "git", "verbose"],
  string: ["file"],
  default: { git: true },
});

const clean = (screenName) => screenName?.replace("@", "").toLowerCase().trim();

const merge = (targets, twitters, options) => {
  const merged = targets.map((target) => {
    let r =
      twitters &&
      twitters.find(
        (d) => clean(d.screen_name) === clean(target.fields?.screen_name)
      );
    if (!r) {
      // todo, some formatting
      r = {
        procaid: target.id,
        name: target.name,
        country: target.area,
        description: target.fields.description || target.fields.party,
        screen_name: target.fields.screen_name,
        //        followers_count: 0,
        verified: false,
      };
    } else {
      r.procaid = target.id;
      r.name = target.name; //? not sure which one we want to keep
      if (target.fields.description) {
        r.description = target.fields.description;
      }
      r.country = target.area;
    }
    r.sort =
      target.fields.sort ||
      (target.fields.last_name
        ? target.fields.last_name.toLowerCase()
        : target.name.toLowerCase());
    if (options.meps) {
      r.description = target.fields.party;
      r.eugroup = target.fields.eugroup;
      if (target.fields.epid) {
        r.profile_image_url_https =
          "https://www.europarl.europa.eu/mepphoto/" +
          target.fields.epid +
          ".jpg";
      }
    }
    if (target.fields.avatar) {
      r.profile_image_url_https = target.fields.avatar;
    }

    if (options.email && target.emails?.length) {
      r.email = target.emails[0].email;
    }

    if (options.display) {
      r.display = !!target.fields.display;
    }
    if (target.locale) {
      r.locale = target.locale;
      r.lang = target.locale;
    }
    if (target.lang) {
      r.lang = target.lang;
    }
    if (target.fields.constituency) {
      r.constituency = target.fields.constituency;
      r.area = target.area;
      delete r.country;
    }

    if (argv.fields) {
      const extraFields = argv.fields.split(",");
      extraFields.forEach((key) => {
        r[key] = target.fields[key] || ""; // beware, can overwrite a default field
      });
    }
    if (target.fields.salutation) r.salutation = target.fields.salutation;

    return r;
  });
  return merged;
};

/* proca format:
   {
    area: 'FI',
    externalId: 'rec0XJIF02o6UzWfk',
    fields: {
      description: 'Ministry of Agriculture and Forestry',
      name: 'Jari Leppä',
      screen_name: '@JariLeppa'
    },
    id: '2c10c12c-d78e-4696-ab57-926b487d74b5',
    name: 'Jari Leppä'
  },
 * twitter format:
 {
    id: 1092130388296826900,
    name: 'Erki Savisaar',
    screen_name: 'ErkiSavisaar',
    location: 'Tallinn, Estonia',
    description: 'Hariduselt IT-mees kuid rahva soovil edendan Eesti elu saadikuna Riigikogus',
    url: 'https://www.facebook.com/savisaarerki/',
    profile_image_url_https: 'https://pbs.twimg.com/profile_images/1092137006040313857/3n9Rd92s_normal.jpg',
    followers_count: 19,
    lang: null,
    verified: false,
    country: ''
  }
*/
const saveTargets = (campaignName, targets) => {
  const fileName = file("target/public/" + campaignName);
  if (argv.verbose) console.log(fileName, targets);
  if (argv["dry-run"]) return;

  fs.writeFileSync(fileName, JSON.stringify(targets, null, 2));
  return fileName;
};

const publishTarget = async (campaignName) => {
  const name = argv.file ? argv.file : campaignName;
  const publicEmail = argv.email || false;
  const display = argv.display || false;
  const meps = argv.meps || false;

  try {
    read("campaign/" + name); // the config file
    let targets = read("target/server/" + campaignName); // the list of targets from proca server
    if (argv.source) {
      const sources = read("target/source/" + name); // the list of targets from proca server
      const c = targets.filter(
        (t) => -1 !== sources.findIndex((d) => d.externalId === t.externalId)
      );
      console.log("total server vs source", targets.length, c.length);
      targets = c;
    }

    let twitters = null;
    try {
      twitters = read("target/twitter/" + name); // the list from twitter
    } catch (e) {
      console.log("no twitter list");
      twitters = [];
    }

    const d = merge(targets, twitters || [], {
      email: publicEmail,
      display: display,
      meps: meps,
    });
    //    const d = await pullCampaign(argv[0]);
    if (d) {
      //if (argv.sort) {
      const sort = argv.sort || "sort";
      //d.sort((a, b) => b?.followers_count - a?.followers_count); still need to figure out the order
      //d.sort((a, b) => a[sort] - b[sort]);
      d.sort((a, b) => a[sort].localeCompare(b[sort]));

      const c = saveTargets(name, d);
      console.log("saved " + c);
      const msg = "saving " + d.length + " targets";
      if (argv["dry-run"]) return;
      const r = argv.git && (await commit(c, msg, true));
      if (r?.summary) {
        console.log(r.summary);
        await push();
        await deploy();
      }
      return d;
    }
  } catch (e) {
    console.error(e);
    return e;
    // Deal with the fact the chain failed
  }
};

if (require.main === module) {
  // this is run directly from the command line as in node xxx.js
  if (!argv._.length || argv.help) {
    console.log(
      [
        "options",
        "--help (this command)",
        "--dry-run (show the parsed targets but don't push)",
        "--email (for campaigns sending client side)",
        "--display (filters based on the display field)",
        "--source (filter the server list based on source - if the server has more targets than the source)",
        "--meps[=committeeA,committeeB] if meps, special formatting",
        "--fields=fieldA,fieldB add extra fields present in source, eg for custom filtering",
        "buildTarget {campaign name}",
      ].join("\n")
    );
    process.exit(0);
  }

  (async () => {
    publishTarget(argv._[0], argv);
  })();
} else {
  module.exports = {
    publishTarget,
  };
}
