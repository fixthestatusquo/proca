#!/usr/bin/env babel-node
/*
 * Usage:

1) convert the xml file downloaded from the EC portal into a json

    cat config/REQ.ECI\(2021\)000001.xml | iconv -f utf16 -t utf8 | xq . > config/REQ.ECI\(2021\)000001.json
vim :%s%"@%"%g

    Decide that one AP is your "master copy" on which you work. It can be one of
    the ECI pages, eg. english one.
    yarn pull PAGEID to have its config in config/
    edit the config and dev it normally as you see fit.
    call ./bin/eci.js PAGEID
    this will:
        Read the config from config/PAGEID.json
        Read the ECI registeration number
        Read the json with name ${registration number}.json from confog/
        For each language: copy the master page config; put the locale and
        necessary ECI info
        upsert all these pages to the same campaign
*/
require("dotenv").config();

const fs = require("fs");
const lo = require("lodash");
const {
  read,
  file,
  apiLink,
  actionPageFromLocalConfig,
} = require("./config.js");
const api = require("@proca/api");

const readEci = (eci) => {
  try {
    return JSON.parse(fs.readFileSync(file(eci), "utf8")).initiative;
  } catch (e) {
    console.error("no local copy of the eci " + file(eci), e.message);
    return null;
  }
};

const getLocale = (code, languages) => {
  const locale = languages.find((d) => d.code === code);
  locale.name = locale.title;
  return locale;
};

const makeLocalAP = (mainAP, locale, eci) => {
  const page = lo.cloneDeep(mainAP);
  // modify locale:
  page.lang = locale;

  // modify page name:
  const filenameparts = page.filename.split(/\//);
  filenameparts.pop();
  filenameparts.push(locale);
  page.filename = filenameparts.join("/");

  page.locales["campaign:"] = getLocale(
    page.lang.toLowerCase(),
    eci.languages.language
  );

  console.log(page);
  return page;
};

(async () => {
  const argv = process.argv.slice(2);
  const id = parseInt(process.env.actionpage || argv[0]);
  if (!id) {
    throw "provide master page id as env var actionpage={id} or eci.js {id}";
  }

  const mainConfig = read(parseInt(id, 10));
  const eciid = mainConfig.component.eci.registrationNumber;
  const eci = readEci(eciid);
  console.log(eci);
  const pages = {};
  eci.languages.language.forEach((ll) => {
    pages[ll.code] = makeLocalAP(mainConfig, ll.code, eci);
  });

  const link = apiLink();
  try {
    const mainAP = await api.request(link, api.widget.GetActionPageDocument, {
      id: id,
    });
    if (mainAP.errors) {
      throw new Error(
        `I cannot fetch AP data from server ap=${id} errors=${mainAP.errors[0].message}`
      );
    }
    const campaignName = mainAP.data.actionPage.campaign.name;
    const orgName = mainAP.data.actionPage.org.name;

    const upsertEciVars = {
      org: orgName,
      campaign: {
        name: campaignName,
        actionPages: Object.values(pages).map(
          (p) => actionPageFromLocalConfig(null, p).actionPage
        ),
      },
    };
    // console.log(JSON.stringify(upsertEciVars, null, 2));
    console.log(
      `Will UPSERT these pages to campaign ${campaignName}: ${upsertEciVars.campaign.actionPages
        .map(({ name }) => name)
        .join(", ")}`
    );
    console.log(
      `The pages are not stored in ./config; you must yarn pull them if you need a local copy.`
    );

    const upsert = await api.request(
      link,
      api.admin.UpsertCampaignDocument,
      upsertEciVars
    );
    if (upsert.errors) throw upsert.errors;
    console.log(
      `ECI campaign id ${upsert.data.upsertCampaign.id} updated. To see pages for Your org run:`
    );
    console.log(`proca-cli -o ${orgName} pages`);
  } catch (e) {
    if (e.result && e.result.errors) {
      console.error(e.result.errors);
    } else if (e[0]) {
      console.error(e[0]);
    } else {
      console.error(e);
    }
    return;
  }
})();
