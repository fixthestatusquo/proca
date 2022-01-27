const fs = require("fs");
require("dotenv").config();
const { pullTarget, read, file } = require("./config");

const clean = (screenName) => screenName?.replace("@", "").toLowerCase();

const merge = (targets, twitters) => {
  const merged = targets.map((target) => {
    let r = twitters.find(
      (d) => clean(d.screen_name) === clean(target.fields?.screen_name)
    );
    if (!r) {
      // todo, some formatting
      r = {
        name: target.fields.name,
        country: target.area,
        description: target.fields.description,
        screenname: target.fields.screen_name,
        followers_count : 0,
        verified : false
      };
    } else {
      r.procaid = target.id;
      if (target.description) 
        r.description = target.description;
      r.country = target.area
    }
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
  const fileName = file("target/public/" + campaignName );
  fs.writeFileSync(fileName, JSON.stringify(targets, null, 2));
  return fileName;
}

(async () => {
  const argv = process.argv.slice(2);
  const name = argv[0];
  if (!argv[0]) throw "need buildCampaign {name}";
  try {
    const c = read("campaign/" + name); // the config file
    const targets = read("target/server/" + name); // the list of targets from proca server
    const twitters = read("target/twitter/" + name); // the list from twitter

    const d = merge(targets, twitters);
    console.log (d);
    //    const d = await pullCampaign(argv[0]);
    if (d) {
      const c=saveTargets(name,d);
      console.log("saved " + c);
    }
  } catch (e) {
    console.error(e);
    // Deal with the fact the chain failed
  }
})();
