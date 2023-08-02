#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const http = require("http");

require("./dotenv.js");
const _set = require("lodash/set");
const _merge = require("lodash/merge");
const argv = require("minimist")(process.argv.slice(2), {
  boolean: [
    "help",
    "dry-run",
    "extract",
    "verbose",
    "build",
    "push",
    "serve",
    "markdown",
    "campaign",
  ],
  alias: { v: "verbose" },
  default: { mjml: "default/thankyou", markdown: true, build: true },
});
const { read, api } = require("./config");
const mjmlEngine = require("mjml");
const htmlparser2 = require("htmlparser2");
const render = require("dom-serializer").default;
const i18nInit = require("./lang").i18nInit;
const i18n = require("./lang").i18next;
const configOverride = require("./lang").configOverride;
const getConfigOverride = require("../webpack/config.js").getConfigOverride;
const org = require("./org");
const { saveCampaign } = require("./campaign");
const _snarkdown = require("snarkdown");

const tmp = process.env.REACT_APP_CONFIG_FOLDER
  ? "../" + process.env.REACT_APP_CONFIG_FOLDER + "/"
  : "../config/";

const keys = {};
const needle = "[{|}]";
let locales = {}; // to use to update the campaign.config from the template keys

const help = () => {
  console.log(
    [
      "options",
      "--help (this command)",
      "--lang=fr (optional, to overwrite the language in the actionpage)",
      "--dry-run (don't write)",
      "--verbose (show the result)",
      "--serve (show template in your browser for dev)",
      "--markdown (handle i18n as markdown)",
      "--campaign|no-campaign (add the variables from the template into the campaign)",
      "--extract (extract into src/locales/en/server.js)",
      "--push (push the template to proca server)",
      "--mjml {template to use in config/mjml, default default/thankyou)",
      "actionpage_id",
      //      "boolean inputs, no validatiton, everything but 'false' will be set to 'true'"
    ].join("\n")
  );
  process.exit(0);
};

const snarkdown = (markdown) => {
  const md = markdown.replaceAll("proca_", "proca-").replaceAll("utm_", "utm-"); //snarkdown messes up
  const para = md.split(/(?:\r?\n){2,}/);
  if (para.length === 1) {
    // don't add the paragraph
    return _snarkdown(markdown);
  }
  const htmls = para.map((l) =>
    [" ", "\t", "#", "-", "*"].some((ch) => l.startsWith(ch))
      ? _snarkdown(l)
      : `<p>${_snarkdown(l)}</p>`
  );
  return htmls
    .join("\n\n")
    .replaceAll("proca-", "proca_")
    .replaceAll("utm-", "utm_");
};

const pushTemplate = async (config, html) => {
  const query = `mutation upsertTemplate ($name: String!, $orgName: String!, $html: String!, $locale: String!, $subject: String!,$id: Int!) {
    template: upsertTemplate (orgName:$orgName, input: {
      html: $html,
      subject: $subject,
      locale: $locale,
      name: $name,
    })
    actionPage: updateActionPage (id: $id, input: {
      thankYouTemplate: $name
    }) {
    name,
    thankYouTemplate
    }
  }`;
  /*  const query2 = `mutation updateActionPage ($id: Int!, $template: String!) {
    actionPage: updateActionPage (id: $id, input: {
      thankYouTemplate: $template
    }) {
    thankYouTemplate
    }
  }`; */
  if (!config.filename) {
    console.log("config json invalid, check it first");
    process.exit(1);
  }
  const variables = {
    name: config.filename.replaceAll("/", "_"),
    orgName: config.org.name || config.lead.name,
    locale: config.lang,
    html: html,
    subject: i18n.t("email." + config.type + ".subject"),
    id: config.actionpage,
  };
  console.log("upload template", variables.name);
  const data = await api(query, variables, "upsertTemplate");
  console.log(
    data,
    "pushing ",
    variables.name,
    variables.orgName,
    variables.locale,
    variables.subject
  );
  if (argv.verbose) console.log("data", data);
  return data;
};

const updateTranslation = (namespace, parsed) => {
  console.log("parsed", parsed);
  const file = path.resolve(__dirname, "../src/locales/en/server.json");
  const initial = JSON.parse(fs.readFileSync(file, "utf8"));
  const updated = _merge({}, parsed[namespace], initial);
  if (argv["dry-run"]) {
    console.log(JSON.stringify(updated, null, 2));
    return;
  }
  fs.writeFileSync(file, JSON.stringify(updated, null, 2));
};

const updateCampaign = (campaign, lang, tplLocales) => {
  console.log(tplLocales.server);
  const locales = {};
  locales[lang] = { "server:": tplLocales.server };
  const updated = _merge({}, { config: { locales: locales } }, campaign);

  console.log(updated);
  saveCampaign(updated, {});
  console.log(JSON.stringify(updated.config.locales, null, 2));
};

const deepify = (keys) => {
  // convert an array of keys for the t function to the translation json
  let trans = {};
  for (let nskey in keys) {
    let key = "";
    if (nskey.includes(":")) key = nskey.replace(":", ".");
    else key = "server." + nskey;
    _set(trans, key, keys[nskey]);
  }
  return trans;
};

const translateTpl = (tpl, lang, markdown) =>
  new Promise((resolve, reject) => {
    const util = htmlparser2.DomUtils;
    const handler = new htmlparser2.DomHandler((error, dom) => {
      if (error) {
        console.log(error);
        reject(error);
      }
      const i18node = util.find(
        (e) => util.getAttributeValue(e, "i18n"),
        dom,
        true,
        999
      );
      i18node.forEach((d) => {
        const text = util.getChildren(d)[0] || {
          type: "text",
          data: d.attribs.i18n,
        };
        if (text.type !== "text") {
          console.log("wrong children", d);
          reject({ error: "wrong child, was expecting text", elem: d });
        }
        keys[d.attribs.i18n] = text.data;
        text.data = markdown ? needle + d.attribs.i18n : i18n.t(d.attribs.i18n); // translation to the new language
      });
      const r = render(dom);
      locales = deepify(keys);
      if (argv.extract) {
        if (argv["dry-run"]) {
          console.log("i18n keys", keys, JSON.stringify(locales, null, 2));
        } else updateTranslation("server", locales);
      }
      resolve(r);
    });
    const parser = new htmlparser2.Parser(handler);
    parser.write(tpl);
    parser.end();
  });

const saveTemplate = (render, id) => {
  const fileName = path.resolve(
    __dirname,
    tmp + "email/actionpage/" + id + ".html"
  );
  if (argv.verbose) {
    console.log(JSON.stringify(render.errors, null, 2));
  }
  if (argv["dry-run"]) {
    console.log("would write in ", fileName, render.html);
    return;
  }
  console.log("saved in", fileName);
  fs.writeFileSync(fileName, render.html);

  return render;
};

const saveConfig = (config) => {
  const jsonFile = path.resolve(
    __dirname,
    tmp + "email/actionpage/" + config.actionpage + ".json"
  );

  const json = {
    meta: {
      subject: i18n.t("email." + config.type + ".subject"),
      type: config.type,
    },
  };

  fs.writeFileSync(jsonFile, JSON.stringify(json, null, 2));
  console.log("saved in", jsonFile);

  return json;
};

const i18nRender = async (tplName, lang, markdown) => {
  const fileName = path.resolve(
    __dirname,
    tmp + "email/mjml/" + tplName + ".mjml"
  );
  let tpl = fs.readFileSync(fileName, "utf8");
  if (lang) {
    //only switch if different than current?
    await i18n.changeLanguage(lang);
    //    configOverride(config); what does it do?
  }
  const newTpl = await translateTpl(tpl, lang, markdown);
  const render = mjmlEngine(newTpl, {});
  if (markdown) {
    for (const key in keys) {
      render.html = render.html.replace(
        needle + key,
        snarkdown(i18n.t(key, ""))
      );
      console.log(key, lang);
    }
  }
  return render;
};

const i18nTplInit = async (campaign, lang = "en") => {
  await i18nInit;
  await i18n.setDefaultNamespace("server");
  if (lang !== "en") {
    const server = campaign.config.locales.en["server:"]; // only campaign and common namespaces are handled by default
    console.log(server);
    await i18n.addResourceBundle("en", "server", server);
  }
  const server =
    campaign.config.locales &&
    campaign.config.locales[lang] &&
    campaign.config.locales[lang]["server:"]; // only campaign and common namespaces are handled by default
  return server;
};

if (require.main === module) {
  if (!argv._.length || argv.help) {
    console.error("missing actionpage id");
    help();
  }

  const getType = (tplName) => {
    const segments = tplName.split("/");
    return segments.slice(-1);
  };
  (async () => {
    const id = argv._[0];
    const tplName = argv.mjml;
    let lang = null;
    let render = null;
    //const display = argv.display || false;
    const [, config, campaign] = getConfigOverride(id);
    const server = await i18nTplInit(campaign, config.lang);
    if (server) config.locales["server:"] = server;
    config.type = getType(tplName) || "thankyou";
    try {
      try {
        org.readOrg(config.org.name);
      } catch (e) {
        try {
          await org.getOrg(config.org.name);
        } catch (e) {
          console.log(
            "warning: not enough permissions to fetch the org config, you will not be able to use logo or other org info",
            config.org.name
          );
        }
      }
    } catch (e) {
      console.log(
        "warning: not enough permissions to fetch the org config, you will not be able to use logo or other org info",
        config.org.name
      );
      process.exit(1);
    }
    let mailConfig = read("email/actionpage/" + id);
    console.log("widget ", config.filename, argv.mjml);
    lang = config.lang;
    if (argv.lang) {
      if (argv.lang.length !== 2) {
        console.error("invalid language", argv.lang);
        process.exit(1);
      }
      lang = argv.lang;
      console.warn("overriding language with ", lang);
    }

    await i18n.changeLanguage(lang);
    configOverride(config);

    if (!mailConfig) {
      mailConfig = saveConfig(config);
      console.log("config", mailConfig);
    }
    config.locales["server:"] = _merge(config.locales["server:"], mailConfig);

    try {
      if (argv.build) {
        render = await i18nRender(tplName, null, argv.markdown);
        saveTemplate(render, id);
        mailConfig = saveConfig(config);
        console.log("config", mailConfig);
      }
      if (argv.campaign) {
        if (argv["dry-run"]) {
          console.log(
            "i18n keys",
            keys,
            JSON.stringify(render.locales, null, 2)
          );
        } else updateCampaign(campaign, lang, locales);
      }
    } catch (e) {
      console.log(e);
    }
    if (argv.push && !argv["dry-run"]) {
      await pushTemplate(config, render.html);
    }
    if (argv.serve) {
      const port = 8025;
      http
        .createServer(function (req, res) {
          res.setHeader("Content-type", "text/html");
          res.end(render.html);
          process.exit(0);
        })
        .listen(port);
      console.log("creating server http://localhost:" + port);
      const open = await import("open");
      open.default("http://localhost:" + port);
    }
  })();
} else {
  //export a bunch
  module.exports = { i18nRender, i18nTplInit };
}
