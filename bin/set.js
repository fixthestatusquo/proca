const fs = require("fs");
require("./dotenv.js");
const { read, file, save } = require("./config");
const argv = require("minimist")(process.argv.slice(2));
const merge = require("lodash.merge");

console.log(1, argv);

if (argv.help) {
  console.log (["options"
    ,"--help (this command"
    ,"--color=#cafebebe (set the primary color)"
    ,"--bla"
    ," {id} (actionpage id)"
  ].join ("\n"));
  process.exit (0);
}

function update (id, d) {
  let current = read (id);
  const next = merge (current, d);
  save (next);
}

const ids = argv._;

ids.map(id => {
  if (!id) {
    console.error("actionpage id missing");
    process.exit(1);
  }

  const keyword = Object.keys(argv)[1];

  switch (keyword) {
    case 'color':
      // todo, add some QA if the color is an hex
      update(id, { layout: { primaryColor: argv.color } });
      break;
    case 'privacyPolicy':
      update(id, { org: { privacyPolicy: argv.privacyPolicy } });
      break;
    case 'url':
      update(id, { org: { url: argv.url } });
      break;
      case 'lang':
        update(id, { org: { lang: argv.lang } });
      break;
      case 'lang':
        update(id, { org: { lang: argv.lang } });
        break;
    default:
      console.log("default case");
  }

});

