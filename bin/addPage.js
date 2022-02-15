require("./dotenv.js");

const { addPage } = require("./config");

(async () => {
  const argv = process.argv.slice(2);
  const campaign = argv[0];
  const locale = argv[1];
  let org = null;
  if (!argv[1]) {
    console.error("need addPage {campaign.name} {locale} [ page/name/to/create ] or");
    console.error("need addPage {campaign.name} {locale} [ organisation_name]");
    throw "missing params";
  }
  let name = argv[2] ? argv[2] : argv[0] + "/" + argv[1];

  if (argv[2] && !argv[2].includes("/")) {
    org = argv[2];
    name = campaign + "/" + org + "/" + locale;
  }

  try {
   //const addPage = async (name, campaignName, locale, orgName) => {
    console.log("creating",name, campaign, locale, org);
    const d = await addPage(name, campaign, locale, org);
    console.log(d);
  } catch (e) {
    console.error(e);
    // Deal with the fact the chain failed
  }
})();
