require("./dotenv.js");

const { addPage } = require("./config");

(async () => {
  const argv = process.argv.slice(2);
  if (!argv[1]) {
    throw "need addPage {campaign.name} {locale} [ page/name/to/create ]";
  }
  const name = argv[2] ? argv[2] : argv[0] + "/" + argv[1];

  try {
    const d = await addPage(name, argv[0], argv[1]);
    console.log(d);
  } catch (e) {
    console.error(e);
    // Deal with the fact the chain failed
  }
})();
