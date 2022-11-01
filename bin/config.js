const fs = require("fs");
const path = require("path");
const { link, admin, request, basicAuth } = require("@proca/api");
const crossFetch = require("cross-fetch");
require("cross-fetch/polyfill"); // for the push

const tmp = process.env.REACT_APP_CONFIG_FOLDER
  ? "../" + process.env.REACT_APP_CONFIG_FOLDER + "/"
  : "../config/";

const API_URL =
  process.env.API_URL ||
  process.env.REACT_APP_API_URL ||
  "https://api.proca.app/api";

const pathConfig = () => path.resolve(__dirname, tmp);

const checked = (fileName, type) => {
  if (fileName.toString().includes("..")) {
    console.error("the filename is invalid ", fileName);
    throw new Error("invalid filename ", fileName);
  }
  return fileName;
};
// mkdir -p
const mkdirp = (pathToFile) =>
  pathToFile.split("/").reduce((prev, curr, i) => {
    if (prev && fs.existsSync(prev) === false) {
      fs.mkdirSync(prev);
    }
    return prev + "/" + curr;
  });

const file = (id) => {
  return path.resolve(__dirname, tmp + checked(id) + ".json");
};

const fileExists = (id) => {
  return fs.existsSync(file(id));
};

const read = (id) => {
  try {
    return JSON.parse(fs.readFileSync(file(id), "utf8"));
  } catch (e) {
    console.error("no local copy of " + id, e.message);
    return null;
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

const backup = (actionPage) => {
  const fileName = file(actionPage);
  if (!fs.existsSync(fileName)) return;
  fs.renameSync(fileName, fileName + ".bck");
};

const save = (config, suffix = "") => {
  const id = config.actionpage;
  //  console.log(file(id) + suffix);
  fs.writeFileSync(file(id) + suffix, JSON.stringify(config, null, 2));
  return file(id) + suffix;
};

const saveCampaign = (campaign, lang = "en") => {
  // XXX so much repetition!
  console.log(file("campaign/" + campaign.name));
  fs.writeFileSync(
    file("campaign/" + campaign.name),
    JSON.stringify(campaign, null, 2)
  );
  return "campaign/" + checked(campaign.name) + ".json";
};

const api = async (query, variables, name = "query", anonymous = false) => {
  let headers = {};
  if (!anonymous && process.env.AUTH_USER) {
    headers = basicAuth({
      username: process.env.AUTH_USER,
      password: process.env.AUTH_PASSWORD,
    });
  }
  headers["Content-Type"] = "application/json";

  try {
    const res = await crossFetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        query: query,
        operationName: name,
        variables: variables,
      }),
      headers: headers,
    });

    if (res.status === 401) {
      console.error("permission error");
      console.log(
        "check that your .env has the correct AUTH_USER and AUTH_PASSWORD"
      );
      throw new Error(res.statusText);
    }

    if (res.status === 404) {
      console.error("invalid api url");
      console.log("check that your .env has the correct REACT_APP_API_URL");
      throw new Error(res.statusText);
    }

    if (res.status >= 400) {
      console.log(res);
      throw new Error("Bad response from server");
    }
    const resJson = await res.json();

    if (resJson.errors) {
      resJson.errors.forEach((e) =>
        console.error(
          `${e.message}: ${e.path && e.path.join("->")} ${
            e.extensions ? JSON.stringify(e.extensions) : ""
          }`
        )
      );
      return resJson;
    }

    return resJson.data;
  } catch (err) {
    throw err;
  }
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
    campaign = await getCampaign(campaignName);
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
    console.log(
      "check that your .env has the correct AUTH_USER and AUTH_PASSWORD"
    );
    throw new Error(r.errors[0].message);
  }
  console.log({
    name: name,
    locale: locale,
    campaignName: campaignName,
    orgName: campaign.org.name,
  });

  const page = await getPage(name);
  //  if (!page) throw new Error("actionpage not found:" + name);
  //  await pull(page.id);
  console.log("action page " + name + " #" + page.id);
  return page;
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
    save(config, ".remote");
    saveCampaign(data.actionPage.campaign, config.lang);
  }
  return config;
  //  const ap = argv.public ? data.actionPage : data.org.actionPage

  //  let t = null
  //  t = fmt.actionPage(ap, data.org)
  //  console.log(t)
};

const apiLink = () => {
  const a = basicAuth({
    username: process.env.AUTH_USER,
    password: process.env.AUTH_PASSWORD,
  });
  if (!process.env.AUTH_USER || !process.env.AUTH_PASSWORD) {
    console.error("need .env with AUTH_USER + AUTH_PASSWORD");
  }
  const c = link(API_URL, a);
  return c;
};

const obsolete = () => {
  console.log("import from bin/widget");
  process.exit(1);
};

const push = obsolete;
const pull = obsolete;
//const fetch = obsolete;

module.exports = {
  pathConfig,
  api,
  pull,
  push,
  fetch,
  read,
  file,
  fileExists,
  save,
  apiLink,
  //  actionPageFromLocalConfig,
  pushCampaign,
  pullCampaign,
  saveCampaign,
  addPage,
};
