#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const crossFetch = require("cross-fetch");
const { link, admin, request, basicAuth } = require("@proca/api");
require("./dotenv.js");
const {
  API_URL,
  api,
  read,
  file,
  apiLink,
  fileExists,
  save,
  checked,
} = require("./config");
//const { pullCampaign, saveCampaign } = require("./config");
const { commit, add, onGit } = require("./git");
const color = require("cli-color");
const argv = require("minimist")(process.argv.slice(2), {
  boolean: ["help", "dry-run", "pull", "verbose", "push", "git"],
  default: { git: true },
  alias: { v: "verbose" },
});

const help = () => {
  if (!argv._.length || argv.help) {
    console.log(
      color.yellow(
        [
          "options",
          "--help (this command)",
          "--dry-run (show the parsed campaign but don't write)",
          "--pull (by default)",
          "--git (git update [add]+commit the local /config) || --no-git",
          "--push (update the server)",
          "campaign {campaign name}",
        ].join("\n")
      )
    );
    process.exit(0);
  }
};

const saveCampaign = (campaign, lang = "en") => {
  console.log(color.yellow(file("campaign/" + campaign.name)));
  fs.writeFileSync(
    file("campaign/" + campaign.name),
    JSON.stringify(campaign, null, 2)
  );
  return "campaign/" + checked(campaign.name) + ".json";
};

const getCampaign = async (name) => {
  const query = `
query getCampaign ($name:String!){
  campaign (name:$name) {
      id,
      title,name,config,
      org {name,title}
  }
}`;

  const data = await api(query, { name: name }, "getCampaign");
  if (!data.campaign) throw new Error("can't find campaign " + name);
  data.campaign.config = JSON.parse(data.campaign.config);
  return data.campaign;
};

const getPage = async (name) => {
  const query = `
query getPage ($name:String!){
  actionPage (name:$name) {
    id, name, locale, org {
      name, title
    }
  }
}`;

  const data = await api(query, { name: name }, "getPage");
  return data.actionPage;
};

const pullCampaign = async (name) => {
  return await getCampaign(name);
};

const pushCampaign = async (name) => {
  const campaign = read("campaign/" + name);
  const query = `
mutation updateCampaign($orgName: String!, $name: String!, $config: Json!) {
  upsertCampaign(orgName: $orgName, input: {
    name: $name, config: $config, actionPages: []
  }) {
    id
  }
}
`;
  let headers = basicAuth({
    username: process.env.AUTH_USER,
    password: process.env.AUTH_PASSWORD,
  });
  headers["Content-Type"] = "application/json";
  let data;

  try {
    const res = await crossFetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        query: query,
        variables: {
          orgName: campaign.org.name,
          name: campaign.name,
          title: campaign.title,
          config: JSON.stringify(campaign.config),
        },
        operationName: "updateCampaign",
      }),
      headers: headers,
    });

    if (res.status >= 400) {
      throw new Error("Bad response from server");
    }
    const resJson = await res.json();
    if (resJson.errors) {
      console.log(resJson.errors);
    }
    data = resJson.data;
  } catch (err) {
    throw err;
  }
  if (data.upsertCampaign.id !== campaign.id) {
    console.log(data, campaign);
    throw new Error(
      "created a new campaign instead of editing the existing one",
      data.upsertCampaign.id,
      campaign.id
    );
  }
  return data.upsertCampaign;
};

if (require.main === module) {
  // this is run directly from the command line as in node xxx.js
  help();
  if (!onGit()) {
    console.warn(
      color.italic.yellow(
        "git integration disabled because the config folder isn't on git"
      )
    );
    argv.git = false;
  }
  (async () => {
    const anonymous = true;
    try {
      const name = argv._[0];
      let campaign = null;
      let fileName = "campaign/" + name + ".json";
      if (argv.pull || !argv.push) {
        try {
          campaign = await pullCampaign(name, anonymous);
        } catch (e) {
          console.error(color.red(e));
          process.exit(1);
        }
        //const local = read(campaign);
        //if (local && JSON.stringify(local) !== JSON.stringify(campaign)) {
        //    backup(campaign);
        // }
        const msg =
          campaign.id +
          " for " +
          campaign.org.name +
          " (" +
          campaign.org.title +
          ")";

        if (!argv["dry-run"]) {
          const exists = fileExists("campaign/" + name);
          const result = saveCampaign(campaign);
          let r = null;
          if (!exists && argv.git) {
            r = await add(fileName);
            console.log("adding", r);
          }
          console.log(
            color.green.bold("saved", fileName),
            color.blue(campaign.name)
          );
          r = argv.git && (await commit(fileName, msg));
          if (argv.git && !r) {
            // no nameea,
            console.warn(
              console.red("something went wrong, trying to git add")
            );
            r = await add(fileName);
            console.log(r);
            r = await commit(fileName);
          }
          if (r.summary) console.log(r.summary);
        }
      }
      if (argv.push && !argv["dry-run"]) {
        const r = argv.git && (await commit(fileName));
        const result = await pushCampaign(name);
        console.log(color.green.bold("pushed", name), color.blue(result.id));
        if (r.summary) console.log(r.summary);
      }
      if (argv["dry-run"] || argv.verbose) {
        if (!campaign) {
          campaign = await readCampaign(name);
        }
        console.log(campaign);
      }
    } catch (e) {
      console.error(e);
      // Deal with the fact the chain failed
    }
  })();
} else {
  //export a bunch
  module.exports = { saveCampaign, pushCampaign, pullCampaign };
}
