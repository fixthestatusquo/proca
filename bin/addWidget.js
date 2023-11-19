#!/usr/bin/env node
require("./dotenv.js");

const { addPage, pull } = require("./widget");

(async () => {
  const argv = process.argv.slice(2);
  const campaign = argv[0];
  const locale = argv[1];
  let org = null;
  if (!argv[1]) {
    console.error("missing parameters, either:");
    console.error(
      "addPage {campaign.name} {locale} [ page/name/to/create ] or",
    );
    console.error("addPage {campaign.name} {locale} {organisation_name}");
    return;
  }
  let name = argv[2] ? argv[2] : argv[0] + "/" + argv[1];

  if (argv[2] && !argv[2].includes("/")) {
    org = argv[2];
    name = campaign + "/" + org + "/" + locale;
  }

  try {
    //const addPage = async (name, campaignName, locale, orgName) => {
    console.log("creating", name, campaign, locale, org);
    let d = await addPage(name, campaign, locale, org);
    console.log(d);
    d = await pull(d.id);
    console.log(d);
  } catch (e) {
    process.exit(1);
    //console.error(e);
    // Deal with the fact the chain failed
  }
})();
