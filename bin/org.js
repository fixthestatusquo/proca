#!/usr/bin/env node
const fs = require("fs");
const fetch = require("cross-fetch");

require("dotenv").config();
const argv = require("minimist")(process.argv.slice(2), {
  boolean: [
    "help",
    "keep",
    "dry-run",
    "pull",
    "push",
    "twitter",
    "pages",
    "users",
  ],
});

const { file, api } = require("./config");

const help = () => {
  if (!argv._.length || argv.help) {
    console.log(
      [
        "options",
        "--help (this command)",
        "--dry-run (show the parsed org but don't write)",
        "--pages (fetch the action pages of the org)",
        "--users(fetch the users of the org)",
        "--pull (by default)",
        "--push (update the server)",
        "org {org name}",
      ].join("\n")
    );
    process.exit(0);
  }
};

const readOrg = (orgName) => {
  const fileName = file("org/" + orgName);
  const org = JSON.parse(fs.readFileSync(fileName));
  return org;
};

const saveOrg = (orgName, org) => {
  const fileName = file("org/" + orgName);
  fs.writeFileSync(fileName, JSON.stringify(org, null, 2));
  console.log("wrote config/" + "org/" + orgName + ".json");
  return fileName;
};

const getTwitter = async (org) => {
  const orgName =
    (org.config.twitter && org.config.twitter.screen_name) || org.name;
  try {
    const res = await fetch(
      "https://twitter.proca.app/?screen_name=" + orgName
    );

    if (res.status >= 400) {
      throw new Error("Bad response from twitter.proca.app");
    }

    const twitter = await res.json();
    twitter.picture = twitter.profile_image_url_https;
    delete twitter.profile_image_url_https;
    if (twitter) org.config.twitter = twitter;
    if (!org.config.description) org.config.description = twitter.description;
    if (!org.config.location) org.config.location = twitter.location;
    if (!org.config.url) org.config.url = twitter.url;
  } catch (err) {
    console.error(err);
  }
};

const pushOrg = async (org) => {
  const query = `mutation updateOrg ($name: String!, $config: Json!) {
    updateOrg (name:$name, input: {
      config: $config
    })
    { name }
  }`;
  if (!org.name) {
    console.log("org json invalid, check it first");
    process.exit(1);
  }
  const variables = {
    name: org.name,
    config: JSON.stringify(org.config),
    //    description: org.description || org.config.twitter.description
  };
  console.log(variables);
  const data = await api(query, variables, "updateOrg");
};

const getOrg = async (name) => {
  const extraQuery =
    (argv.pages ? " actionPages {id name locale}" : "") +
    (argv.users ? " users {email lastSigninAt role}" : "");

  const query =
    `
query GetOrg($name: String!) {
  org(name:$name) {
  ... on PrivateOrg {
      id name title processing {emailFrom,supporterConfirm,doiThankYou} config ` +
    extraQuery +
    `
    }
  }
}
`;

  const data = await api(query, { name }, "GetOrg");
  if (!data.org) throw new Error("can't find org " + name);

  if (data.org.config) data.org.config = JSON.parse(data.org.config);
  return data.org;
};

const pullOrg = async (name) => {
  let org = undefined;
  try {
    if (!argv.push || argv.pull) org = await getOrg(name);
    else org = readOrg(name);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }

  if (!org) {
    return console.error("not storing empty orgs");
  }
  if (argv.twitter) {
    await getTwitter(org);
  }
  if (argv["dry-run"]) {
    console.log(org);
    process.exit(1);
  }

  saveOrg(name, org);
  return org;
};

if (require.main === module) {
  // this is run directly from the command line as in node xxx.js
  help();
  (async () => {
    try {
      const name = argv._[0];
      let org = null;
      org = await pullOrg(name);
      if (argv.push) {
        if (!org) {
          org = readOrg(name);
        }
        await pushOrg(org);
      }
    } catch (e) {
      console.error(e);
      // Deal with the fact the chain failed
    }
  })();
} else {
  //export a bunch
  module.exports = {
    getOrg,
    pullOrg,
    readOrg,
  };
}
