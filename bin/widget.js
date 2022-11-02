#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { link, admin, request, basicAuth } = require("@proca/api");
require("./dotenv.js");
const { api, read, file, apiLink, fileExists, save } = require("./config");
const { commit, add, onGit } = require("./git");
const { saveCampaign } = require("./campaign");
const getId = require("./id");
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
          "--dry-run (show the parsed widget but don't write)",
          "--pull (by default)",
          "--git (git update [add]+commit the local /config) || --no-git",
          "--push (update the server)",
          "widget {actionpage id}",
        ].join("\n")
      )
    );
    process.exit(0);
  }
};

const string2array = (s) => {
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

const array2string = (s) => {
  if (!s) return "";
  s.forEach((d, i) => {
    if (typeof s[i] === "string") return;
    s[i] = s[i].join("+");
  });
  return s;
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

  return {
    id: id,
    actionPage: {
      name: local.filename,
      locale: local.lang,
      config: JSON.stringify(config),
    },
  };
};

const fetch = async (actionPage, { anonymous, save }) => {
  let data = undefined;

  const query = `
query actionPage ($id:Int!) {
  actionPage (id:$id) {
    id, name, locale,
    thankYouTemplate,
    ... on PrivateActionPage { supporterConfirmTemplate },
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
    data = await api(query, { id: actionPage }, "actionPage", anonymous);
  } catch (err) {
    throw err;
  }
  if (!data.actionPage) throw new Error(data.toString());

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
    )
      consentEmail.confirmOptIn = true;
    if (Object.keys(consentEmail).length > 0)
      config.component.consent.email = consentEmail; // we always overwrite based on the templates
  }
  if (!config.journey) {
    delete config.journey;
  }
  if (save) {
    saveCampaign(data.actionPage.campaign, config.lang);
  }
  return config;
  //  const ap = argv.public ? data.actionPage : data.org.actionPage

  //  let t = null
  //  t = fmt.actionPage(ap, data.org)
  //  console.log(t)
};
const pull = async (actionPage, anonymous) => {
  //  console.log("file",file(actionPage));
  const local = read(actionPage);
  const config = await fetch(actionPage, { anonymous: anonymous, save: true });
  save(config);
  return config;
};

const push = async (id) => {
  const local = read(id);
  const c = apiLink();
  const actionPage = actionPageFromLocalConfig(id, local);
  const { data, errors } = await request(
    c,
    admin.UpdateActionPageDocument,
    actionPage
  );
  if (errors) {
    //    console.log(actionPage);
    throw errors;
  }
  return actionPage;
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
      const id = argv._[0];
      let widget = null;
      if (argv.pull || !argv.push) {
        const exists = fileExists(id);
        widget = await fetch(id, {
          anonymous: anonymous,
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
          const fileName = save(widget); // don't need to save twice, but easier to get the fileName
          let r = null;
          if (!exists && argv.git) {
            r = await add(id + ".json");
            console.log("adding", r);
          }
          console.log(
            color.green.bold("saved", fileName),
            color.blue(widget.filename)
          );
          r = argv.git && (await commit(id + ".json", msg));
          if (argv.git && !r) {
            // no idea,
            console.warn(
              console.red("something went wrong, trying to git add")
            );
            r = await add(id + ".json");
            console.log(r);
            r = await commit(id + ".json");
          }
          if (r.summary) console.log(r.summary);
        }
      }
      if (argv.push && !argv["dry-run"]) {
        const r = argv.git && (await commit(id + ".json"));
        const result = await push(id);

        console.log(
          color.green.bold("pushed", id),
          color.blue(result.actionPage && result.actionPage.name)
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
  })();
} else {
  //export a bunch
  module.exports = { pull };
}
