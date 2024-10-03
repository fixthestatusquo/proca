#!/usr/bin/env node
require("./dotenv.js");
const {
  api,
  read,
  fileExists,
  runDate,
  save: saveWidget,
} = require("./config");
const { commit, add, onGit } = require("./git");
const { saveCampaign, pullCampaign } = require("./campaign");
const { build, serve } = require("./esbuild");
//const getId = require("./id");
const color = require("cli-color");
const help = exit => {
  console.log(
    color.yellow(
      [
        "options",
        "--help (this command)",
        "--pull",
        "--build",
        "--serve (http server for dev)",
        "--dry-run (show but don't write)",
        "--verbose",
        "--campaign || --no-campaign pull the campaign or not",
        "--git (git update [add]+commit the local /config) || --no-git",
        "--push (update the server)",
        "{widget id} or {campaign name}",
      ].join("\n")
    )
  );
  process.exit(exit || 0);
};
const argv = require("minimist")(process.argv.slice(2), {
  boolean: [
    "help",
    "dry-run",
    "pull",
    "verbose",
    "push",
    "git",
    "campaign",
    "build",
    "serve",
  ],
  default: { git: true, campaign: true },
  alias: { v: "verbose" },
  unknown: d => {
    const allowed = []; //merge with boolean and string?
    if (d[0] !== "-" || require.main !== module) return true;
    if (allowed.includes(d.split("=")[0].slice(2))) return true;
    console.log(color.red("unknown param", d));
    help(1);
  },
});

const string2array = s => {
  if (!s || s.length === 0 || s[0] === "") {
    return null;
  }
  s.forEach((d, i) => {
    if (typeof d !== "string") return;
    const sub = d.split("+");
    if (sub.length === 1) return;
    s[i] = sub;
  });
  return s;
};

const array2string = s => {
  if (!s) return "";
  s.forEach((d, i) => {
    if (typeof d === "string") return;
    s[i] = d.join("+");
  });
  return s;
};

const fetchAll = async campaign => {
  const query = `query allPages ($name: String! ) {
  campaign (name:$name) {name ...on PrivateCampaign {
     actionPages {id, name, location}
    }
  }
}`;
  const r = await api(
    query,
    {
      name: campaign,
    },
    "allPages"
  );
  if (r.errors) {
    console.log(r);
    console.log(
      "check that your .env has the correct AUTH_USER and AUTH_PASSWORD"
    );
    throw new Error(r.errors[0].message);
  }

  if (argv.verbose) {
    console.log(r.campaign.actionPages);
  }
  return r.campaign.actionPages;
};

const actionPageFromLocalConfig = (id, local) => {
  const config = {
    journey: array2string(local.journey),
    layout: local.layout,
    component: local.component,
    locales: local.locales,
    portal: local.portal,
  };

  if (local.test) config.test = true;
  if (local.template) config.template = local.template;
  if (local.import) config.import = local.import;
  return {
    id: id,
    actionPage: {
      name: local.filename,
      locale: local.lang,
      config: JSON.stringify(config),
    },
  };
};

const addPage = async (name, campaignName, locale, orgName) => {
  let campaign = { org: { name: orgName } }; // no need to fetch the campaign if the orgName is specified

  const query = `mutation addPage($campaign:String!,$org: String!, $name: String!, $locale: String!) {
  addActionPage(campaignName:$campaign, orgName: $org, input: {
    name: $name, locale:$locale
  }) {
    id
  }
}
`;

  if (!orgName) {
    try {
      campaign = await pullCampaign(campaignName);
    } catch (e) {
      console.log("error", e);
      throw e;
    }
  }

  if (!campaign) {
    throw new Error("campaign not found: " + campaignName);
  }

  const r = await api(
    query,
    {
      name: name,
      locale: locale,
      campaign: campaignName,
      org: campaign.org.name,
    },
    "addPage"
  );
  if (r.errors) {
    try {
      console.log(r.errors);
      if (r.errors[0].path[1] === "name") {
        console.error("invalid name", name);
        throw new Error(r.errors[0].message);
      }
      if (r.errors[0].extensions?.code === "permission_denied") {
        console.error("permission denied to create", name, campaign?.org.name);
        throw new Error(r.errors[0].message);
      }
      const page = await fetchByName(name);
      console.warn("duplicate of widget", page.id);
      throw new Error(r.errors[0].message);
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
  console.log(
    {
      name: name,
      locale: locale,
      campaignName: campaignName,
      orgName: campaign.org.name,
    },
    r
  );
  //  if (!page) throw new Error("actionpage not found:" + name);
  //  await pull(page.id);
  //  console.log(r);
  console.log("action page " + name + " #" + r?.id);
  return r;
};

const fetchByName = async name => {
  let data = undefined;

  const query = `
query actionPage ($name:String!) {
  actionPage (name:$name) {
    id, name, locale,
    thankYouTemplate,
    ... on PrivateActionPage { supporterConfirmTemplate, location, extraSupporters },
    campaign {
      id,
      title,name,config,
      org {name,title}
    },
    org {
      title,
      name,
      config,
      ... on PrivateOrg { processing { supporterConfirm, supporterConfirmTemplate }}
    }
    , config
  }
}
`;

  try {
    data = await api(query, { name: name }, "actionPage", true);
  } catch (err) {
    console.log(err);
    throw err;
  }
  if (!data.actionPage) throw new Error(data.toString());
  return data.actionPage;
};

const getConfig = data => {
  data.actionPage.config = JSON.parse(data.actionPage.config);
  data.actionPage.org.config = JSON.parse(data.actionPage.org.config);
  data.actionPage.campaign.config = JSON.parse(data.actionPage.campaign.config);
  let config = {
    actionpage: data.actionPage.id,
    organisation: data.actionPage.org.title,
    org: {
      name: data.actionPage.org.name,
      privacyPolicy:
        (data.actionPage.org.config.privacy &&
          data.actionPage.org.config.privacy.policyUrl) ||
        "",
      url: data.actionPage.org.config.url || "",
    },
    lang: data.actionPage.locale,
    filename: data.actionPage.name,
    lead: data.actionPage.campaign.org,
    campaign: {
      title: data.actionPage.campaign.title,
      name: data.actionPage.campaign.name,
    },
    journey: string2array(data.actionPage.config.journey),
    layout: data.actionPage.config.layout || {},
    component: data.actionPage.config.component || {},
    portal: data.actionPage.config.portal || [],
    locales: data.actionPage.config.locales || {},
  };
  if (data.actionPage.config.test) config.test = true;
  if (data.actionPage.config.import)
    config.import = data.actionPage.config.import;

  if (data.actionPage.location) config.location = data.actionPage.location;

  if (data.actionPage.extraSupporters)
    config.extraSupporters = data.actionPage.extraSupporters;

  if (config.component.consent && data.actionPage.org.processing) {
    let consentEmail = config.component.consent.email || {};
    if (
      data.actionPage.org.processing.supporterConfirm &&
      (data.actionPage.org.processing.supporterConfirmTemplate ||
        data.actionpage.supporterConfirmTemplate)
    )
      consentEmail.confirmAction = true;

    if (
      !consentEmail.confirmAction &&
      Boolean(data.actionPage.thankYouTemplate)
    ) {
      consentEmail.confirmOptIn = true;
      config.email = { thankyou: data.actionPage.thankYouTemplate };
    }
    console.log(data.actionPage);
    process.exit(1);
    if (Object.keys(consentEmail).length > 0)
      config.component.consent.email = consentEmail; // we always overwrite based on the templates
  }
  if (!config.journey) {
    delete config.journey;
  }
  return config;
};

const fetchAPI = async (actionPage, { campaign = true }) => {
  let data = undefined;

  const query = `
query actionPage ($id:Int!) {
  actionPage (id:$id) {
    id, name, locale,
    thankYouTemplate,
    ... on PrivateActionPage { supporterConfirmTemplate, location, extraSupporters },
    campaign {
      id,
      title,name,config,
      org {name,title}
    },
    org {
      title,
      name,
      config,
      ... on PrivateOrg { processing { supporterConfirm, supporterConfirmTemplate }}
    }
    , config
  }
}
`;

  //data = await api(query, { id: actionPage }, "actionPage", anonymous);
  data = await api(query, { id: actionPage }, "actionPage");
  if (!data.actionPage) {
    console.err(data);
    throw new Error(data.toString());
  }

  const config = getConfig(data);
  if (campaign) {
    return [config, data.actionPage.campaign];
  }
  return config;
  //  const ap = argv.public ? data.actionPage : data.org.actionPage

  //  let t = null
  //  t = fmt.actionPage(ap, data.org)
  //  console.log(t)
};
const pull = async (
  actionPage,
  { anonymous = true, campaign = true, save = true }
) => {
  //  console.log("file",file(actionPage));
  read(actionPage); // not sure what it does
  const [config, campaignData] = await fetchAPI(actionPage, {
    anonymous: anonymous,
    campaign: campaign,
  });
  if (save) {
    saveWidget(config);
    if (argv.campaign) saveCampaign(campaignData, config.lang);
  }
  return campaign ? [config, campaign] : campaign;
};

const push = async id => {
  const query = `
mutation updateActionPage($id: Int!, $name:String!,$locale:String,$config: Json!) {
  updateActionPage(id: $id, input: {name:$name, locale:$locale,config:$config}) {
    id,name,locale
  }
}
`;
  //  let headers = authHeader();
  //  headers["Content-Type"] = "application/json";
  const local = read(id);
  const actionPage = actionPageFromLocalConfig(id, local).actionPage;
  let r = await api(
    query,
    {
      id,
      name: actionPage.name,
      config: actionPage.config,
      locale: actionPage.locale,
    },
    "updateActionPage"
  );

  if (r.errors) {
    console.log(r);
    console.log(
      "check that your .env has the correct AUTH_USER and AUTH_PASSWORD"
    );
    throw new Error(r.errors[0].message || "can't push");
  }
  r = r.updateActionPage;

  if (argv.verbose) {
    console.log(r?.config);
  }
  console.log("action page " + r?.name + " #" + r?.id);
  return r;
};

if (require.main === module) {
  // this is run directly from the command line as in node xxx.js
  if (argv._.length === 0 || argv.help) {
    console.error(color.red("missing param widget id(s) or campaign_name"));
    help(argv.help ? 0 : 1);
  }
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
    let ids = argv._;
    if (isNaN(argv._[0])) {
      const campaign = argv._[0];
      const widgets = await fetchAll(campaign);
      if (argv._.length > 1) {
        console.error(
          color.red(
            "either fetch all the widgets of the campaign or with id(s), not both"
          )
        );
        process.exit(1);
      }
      widgets.forEach(d => {
        ids.push(d.id);
      });
      console.log(color.blue(argv.campaign, "->", ids.length, "widgets"));
      if (argv["dry-run"]) {
        return;
      }
    }

    for (const id of ids) {
      try {
        let widget = null;
        if (argv.pull) {
          const exists = fileExists(id);
          const [widget] = await pull(id, {
            anonymous: anonymous,
            campaign: true,
            save: !argv["dry-run"],
          });
          //const local = read(actionPage);
          //if (local && JSON.stringify(local) !== JSON.stringify(widget)) {
          //    backup(actionPage);
          // }
          const msg =
            widget.filename +
            " for " +
            widget.org.name +
            " (" +
            widget.organisation +
            ") in " +
            widget.lang +
            " part of " +
            widget.campaign.title;
          if (!argv["dry-run"]) {
            const fileName = saveWidget(widget); // don't need to save twice, but easier to get the fileName
            let r = null;
            if (!exists && argv.git) {
              r = await add(id + ".json");
              console.log("adding", r);
            }
            console.log(
              runDate(),
              color.green.bold("saved", fileName),
              color.blue(widget.filename)
            );
            r = argv.git && (await commit(id + ".json", msg));
            if (argv.git && !r) {
              // no idea,
              console.warn(
                color.red("something went wrong, trying to git add")
              );
              r = await add(id + ".json");
              console.log(r);
              r = await commit(id + ".json");
            }
            if (r.summary) console.log(r.summary);
          }
        }
        if (argv.build) {
          await build(id);
        }
        if (argv.serve) {
          await serve(id);
        }
        if (argv.push && !argv["dry-run"]) {
          const r = argv.git && (await commit(id + ".json"));
          const result = await push(id);
          console.log(
            color.green.bold("pushed", id),
            color.blue(result.name),
            "https://widget.proca.app/d/" + result.name + "/index.html"
          );
          if (r.summary) console.log(r.summary);
        }
        if (argv["dry-run"] || argv.verbose) {
          if (!widget) {
            widget = await read(id);
          }
          console.log(widget);
        }
      } catch (e) {
        console.error(e);
        // Deal with the fact the chain failed
      }
    }
  })();
} else {
  //export a bunch
  module.exports = { pull, addPage, getConfig };
}
