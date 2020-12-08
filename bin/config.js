const fs = require("fs");
const path = require("path");
const { link, admin, widget, request, basicAuth } = require("@proca/api");
require("cross-fetch/polyfill");

const tmp = "../config/";

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
  s.forEach((d, i) => {
    if (typeof s[i] === "string") return;
    s[i] = s[i].join("+");
  });
  return s;
};

const string2array = (s) => {
  s.forEach((d, i) => {
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
  fs.writeFileSync(file(id) + suffix, JSON.stringify(config, null, 2));
};

const fetch = async (actionPage) => {
  const c = link(process.env.REACT_APP_API_URL || "https://api.proca.app/api");

  const query = widget.GetActionPageDocument;
  let vars = {};

  const { data, errors } = await request(c, widget.GetActionPageDocument, {
    id: actionPage,
  });
  if (errors) throw errors;
  if (data.actionPage.journey.length === 0) {
    data.actionPage.journey = ["Petition", "Share"];
  }

  data.actionPage.config = JSON.parse(data.actionPage.config);
  const config = {
    actionpage: data.actionPage.id,
    organisation: data.actionPage.org.title,
    lang: data.actionPage.locale.toLowerCase(),
    filename: data.actionPage.name,
    lead: data.actionPage.campaign.org,
    campaign: { title: data.actionPage.campaign.title },
    journey: string2array(data.actionPage.journey),
    layout: data.actionPage.config.layout || {},
    component: data.actionPage.config.component || {},
    portal: data.actionPage.config.portal || [],
    locales: data.actionPage.config.locales || {},
    template: data.actionPage.config.template || false,
  };
  save(config, ".remote");
  return config;
  //  const ap = argv.public ? data.actionPage : data.org.actionPage

  //  let t = null
  //  t = fmt.actionPage(ap, data.org)
  //  console.log(t)
};

const push = async (id) => {
  const local = read(id);
  console.log(local);
  const a = basicAuth({
    username: process.env.AUTH_USER,
    password: process.env.AUTH_PASSWORD,
  });
  if (!process.env.AUTH_USER || !process.env.AUTH_PASSWORD) {
    console.error("need .env with AUTH_USER + AUTH_PASSWORD");
  }

  let url = process.env.REACT_APP_API_URL || "https://api.proca.app/api"
  if (url.endsWith("/api")) url = url.substring(0, url.length - 4)

  const c = link(url, a);
  const actionPage = {
    id: id,
    actionPage: {
      name: local.filename,
      locale: local.lang.toLowerCase(),
      journey: array2string(local.journey),
      config: JSON.stringify({
        layout: local.layout,
        component: local.component,
        locales: local.locales,
        portal: local.portal,
        template: local.template
      })
    }
  };

  const { data, errors } = await request(
    c,
    admin.UpdateActionPageDocument,
    actionPage
  );
  if (errors) {
    console.log(actionPage);
    throw errors;
  }
  console.log(local);
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

module.exports = { pull, push, fetch, read, file, save };
