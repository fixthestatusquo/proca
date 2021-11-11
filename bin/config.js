const fs = require("fs");
const path = require("path");
const { link, admin, widget, request, basicAuth } = require("@proca/api");
const crossFetch = require("cross-fetch");
require("cross-fetch/polyfill"); // for the push

const tmp = process.env.REACT_APP_CONFIG_FOLDER
  ? "../" + process.env.REACT_APP_CONFIG_FOLDER + "/"
  : "../config/";

const file = (id) => {
  return path.resolve(__dirname, tmp + id + ".json");
};

const read = (id) => {
  try {
    return JSON.parse(fs.readFileSync(file(id), "utf8"));
  } catch (e) {
    console.error("no local copy of the actionpage " + id, e.message);
    return null;
  }
};

const array2string = (s) => {
  if (!s) return "";
  s.forEach((d, i) => {
    if (typeof s[i] === "string") return;
    s[i] = s[i].join("+");
  });
  return s;
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
  console.log(file(id) + suffix);
  fs.writeFileSync(file(id) + suffix, JSON.stringify(config, null, 2));
};

const saveCampaign = (campaign, lang = "en") => {
  const defaultConfig = { actionPage: {}, locales: {} };
  defaultConfig.locales[lang] = {
    title: campaign.title,
    description: campaign.description || campaign.request,
  };
  console.log(file("campaign/" + campaign.name));
  fs.writeFileSync(
    file("campaign/" + campaign.name),
    JSON.stringify(campaign, null, 2)
  );
};

const api = async (query, variables, name = "query") => {
  let headers = basicAuth({
    username: process.env.AUTH_USER,
    password: process.env.AUTH_PASSWORD,
  });
  headers["Content-Type"] = "application/json";

  try {
    const res = await crossFetch(
      process.env.REACT_APP_API_URL || "https://api.proca.app/api",
      {
        method: "POST",
        body: JSON.stringify({
          query: query,
          operationName: name,
          variables: variables,
        }),
        headers: headers,
      }
    );

    if (res.status >= 400) {
      throw new Error("Bad response from server");
    }
    const resJson = await res.json();

    return resJson.data;
  } catch (err) {
    throw err;
  }
};

const getCampaign = async (name) => {
  const query = `
query getCampaign ($name:String!){
  campaigns (name:$name) {
    id, org {
      name
    }
  }
}`;

  const data = await api(query, { name: name }, "getCampaign");
  return data.campaigns[0];
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

const addPage = async (name, campaignName, locale) => {
  const query = `
mutation addPage($orgName: String!, $campaignName:String!, $name: String!, $locale: String!) {
  upsertCampaign(orgName: $orgName, input: {
    name: $campaignName, actionPages: [{name:$name,locale:$locale}]
  }) {
    id,
  }
}
`;

  const campaign = await getCampaign(campaignName);
  console.log(campaign);

  if (!campaign) {
    throw new Error("campaign not found: " + campaignName);
  }

  const r = await api(
    query,
    {
      name: name,
      locale: locale,
      campaignName: campaignName,
      orgName: campaign.org.name,
    },
    "addPage"
  );
  console.log({
    name: name,
    locale: locale,
    campaignName: campaignName,
    orgName: campaign.org.name,
  });

  const page = await getPage(name);
  if (!page) throw new Error("actionpage not found:" + name);
  await pull(page.id);
  console.log("action page " + name + " #" + page.id);
  return page;
};

const pullCampaign = async (name) => {};

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

  try {
    const res = await crossFetch(
      process.env.REACT_APP_API_URL || "https://api.proca.app/api",
      {
        method: "POST",
        body: JSON.stringify({
          query: query,
          variables: {
            orgName: campaign.org.name,
            name: campaign.name,
            config: JSON.stringify(campaign.config),
          },
          operationName: "updateCampaign",
        }),
        headers: headers,
      }
    );

    if (res.status >= 400) {
      throw new Error("Bad response from server");
    }
    const resJson = await res.json();

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

const fetch = async (actionPage) => {
  let data = undefined;

  const query = `
query actionPage ($id:Int!) {
  actionPage (id:$id) {
    id, name, locale,
    campaign {
      id,
      title,name,config,
      org {name,title}
    },
    org {
      title
    }
    , config
  }
}
`;

  try {
    const res = await crossFetch(
      process.env.REACT_APP_API_URL || "https://api.proca.app/api",
      {
        method: "POST",
        body: JSON.stringify({
          query: query,
          variables: { id: actionPage },
          operationName: "actionPage",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (res.status >= 400) {
      throw new Error("Bad response from server");
    }

    const resJson = await res.json();
    data = resJson.data;
  } catch (err) {
    throw err;
  }

  data.actionPage.config = JSON.parse(data.actionPage.config);
  data.actionPage.campaign.config = JSON.parse(data.actionPage.campaign.config);
  let config = {
    actionpage: data.actionPage.id,
    organisation: data.actionPage.org.title,
    lang: data.actionPage.locale.toLowerCase(),
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
  if (!config.journey) {
    delete config.journey;
  }
  save(config, ".remote");
  saveCampaign(data.actionPage.campaign, config.lang);
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
  let url = process.env.REACT_APP_API_URL || "https://api.proca.app/api";
  const c = link(url, a);
  return c;
};

const actionPageFromLocalConfig = (id, local) => {
  return {
    id: id,
    actionPage: {
      name: local.filename,
      locale: local.lang.toLowerCase(),
      config: JSON.stringify({
        journey: array2string(local.journey),
        layout: local.layout,
        component: local.component,
        locales: local.locales,
        portal: local.portal,
        template: local.template,
      }),
    },
  };
};

const push = async (id) => {
  const local = read(id);
  console.log(local);
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
  console.log(actionPage);
  return data;
};

const pull = async (actionPage) => {
  //  console.log("file",file(actionPage));
  const local = read(actionPage);
  const config = await fetch(actionPage);
  if (local && JSON.stringify(local) !== JSON.stringify(config)) {
    backup(actionPage);
  }
  save(config);
  return config;
};

module.exports = {
  pull,
  push,
  fetch,
  read,
  file,
  save,
  apiLink,
  actionPageFromLocalConfig,
  pushCampaign,
  addPage,
};
