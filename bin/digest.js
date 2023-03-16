#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
require("./dotenv.js");
const argv = require("minimist")(process.argv.slice(2), {
  boolean: ["help", "dry-run", "extract", "verbose", "push"],
  alias: { v: "verbose" },
  default: { mjml: "default/thankyou" },
});
const mjmlEngine = require("mjml");
const htmlparser2 = require("htmlparser2");
const render = require("dom-serializer").default;
const tmp = require("./template").tmp;
// const pushTemplate = require('./template.js').pushTemplate;

console.log("argv", argv);
const help = () => {
  console.log(
    [
      "options",
      "--help (this command)",
      "--digest (to create digest template for each language in campaign config and save to email/digest/campaignName/templateName.lang.html)",
      "--dry-run (show the result but don't write)",
      "campaign name",
      "--mjml {template to use in config/mjml/campaigName)",

    ].join("\n")
  );
  process.exit(0);
};

if (!argv._.length || argv.help) {
  return help();
}

const translateTpl = (tpl, lang, digest) =>
  new Promise((resolve, reject) => {
    const keys = {};
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
        const text = util.getChildren(d)[0];
        if (text.type !== "text") {
          console.log("wrong children", d);
          reject({ error: "wrong child, was expecting text", elem: d });
        }
        util.getChildren(d)[0].data = eval(d.attribs.i18n);
      });
     resolve(render(dom));
    });
    const parser = new htmlparser2.Parser(handler);
    dom = parser.write(tpl);
    parser.end();
  });

const mjml2html = (name, campaignName, tpl, lang) => {
  const render = mjmlEngine(tpl, {});

  const fileName =
  path.resolve(
    __dirname,
    tmp + "email/digest/" + campaignName + '/' + name + '.' + lang + ".html"
  )

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

const saveConfig = (templateName, campaignName, lang, subject ) => {
  const jsonFile =
  path.resolve(
    __dirname,
    tmp + "email/digest/" + campaignName + '/' + templateName + '.' + lang + ".json"
  )
  const type = "digest";
  const json = {
    meta: {
      subject: subject,
      type: type,
    },
  };
  fs.writeFileSync(jsonFile, JSON.stringify(json, null, 2));
  console.log("saved in", jsonFile);
  return json;
};

(async () => {
  const tplName = argv.mjml;
  const campaignName = argv._[0];
  let render = null;

  const p = path.resolve(
    __dirname, tmp + "campaign/" + campaignName + '.json');

  const campaign = JSON.parse(fs.readFileSync(p));

  const locales = campaign.config?.locales;

  for (const lang in locales) {
if (locales[lang]["server:"] && locales[lang]["server:"].digest) {
    const { digest } = locales[lang]["server:"]

  let org = campaign.org.name;
  let orgConfig = {};
  try {
    console.log("campaign.config.org.name", org)
    try {
      orgConfig = org.readOrg(org);
      console.log("orgConfig", orgConfig)
    } catch (e) {
      try {
        orgConfig = await org.getOrg(org);
        console.log("orgConfig jeijeeej", orgConfig)
      } catch (e) {
        console.log(
          "warning: not enough permissions to fetch the org config, you will not be able to use logo or other org info",
          org
        );
      }
    }
  } catch (e) {
    console.log(
      "warning: not enough permissions to fetch the org config, you will not be able to use logo or other org info",
      campaign.config.org.name
    );
    process.exit(1);
  }
    saveConfig(tplName, campaignName, lang, digest.initial.subject);

  try {
    const fileName = path.resolve(
      __dirname,
      tmp + "email/mjml/" + campaignName + '/' + tplName + ".mjml"
    );

    let tpl = fs.readFileSync(fileName, "utf8");
    const newTpl = await translateTpl(tpl, lang, digest);

    render = mjml2html(tplName, campaignName, newTpl, lang);
    } catch (e) {
    console.log(e);
  }
  if (argv.push && !argv["dry-run"]) {
    // const r = await pushTemplate(config, render.html);
  }
  }
  }
}

  ) ();