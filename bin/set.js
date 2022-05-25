#!/usr/bin/env node
const fs = require("fs");
require("./dotenv.js");
const { read, file, save, push, pull } = require("./config");
const argv = require("minimist")(process.argv.slice(2), {boolean:["pull","push","test","mobile","autoStart"]});
const merge = require("lodash.merge");

console.log(argv);

const locales = ["ar", "bg", "ca", "ce", "cs", "da", "de", "el", "en", "en_GB", "es", "et", "eu",
                  "fi", "fr", "fr_CA", "fr@informal", "ga", "ha", "he", "hi", "hr", "hu", "it", "lt",
                  "lv", "me", "mt", "nl", "pl", "pt", "ro", "rom", "ru", "sk", "sl", "sr", "sv", "uk", "yo"];

const help = () => {
  console.log(
    [
      "options",
      "--help (this command)",
      "--push (push the modified config to the server)",
      "--pull (pull the config from the server before doing the modification)",
      "--color=#cafebebe (set the primary color)",
      "--url=http://example.com (set the url)",
      "--lang=en (set the language)",
      "--theme=dark (set the theme)",
      "--variant=light (set the variant)",
      "--mobile=true (set the mobile version)",
      "--autostart=true (set the autostart)",
      "--forcewidth=54 (force the width)",
//      "--lastnameRequired=true (is lastname field required?)",
//      "--orgdata=true (do we collect the organisation details)",
//      "--lastnamerequired=true (is lastname field required?)",
//      "--postcodeshown=true (is postcode field shown?)",
//      "--postcoderequired=true (is postcode field required?)",
//      "--countryshow=true (is country field shown?)",
//      "--countryrequired=true (is country field required?)",
//      "--commentshow=true (is comment field shown?)",
//      "--commentrequired=true (is comment field required?)",
//      "--phoneshown=true (is phone field shown?)",
      "--goal=666 (set the goal)",
      "--country=GB or bool, set component.country",
      "--implicit=true (set the implicit consent)",
      "--confirmoptin=true (set the confirm optin)",
      '--show={field} // lastname,postalcode,comment,phone,country',
      '--hide={field} // lastname,postalcode,comment,phone,country',
      "--test=true (set the test mode)",
      "--locales.component.consent=whatever (set the locales, carefully - no validation)",
     // "--journey=[] (set the journey)",
      " {id} (actionpage id)",
      "input id, ids or range of ids"
    ].join("\n")
  );
  process.exit(0);
};

if (argv.help) {
  help();
}

function update (id, d) {
  let current = read (id);
  const next = merge (current, d);
  save (next);
}
const isBoolean = (arg, flag) => {
  if (!["true", "false"].includes(arg)) {
    console.error(`${flag} must be true or false`);
    process.exit(0);
  }
 return arg === "true" ? true : false;
};

const args = argv._;
let ids = [];

if (argv[0] && typeof args[0] !== 'number' && args[0].match(/^[0-9]+[-][0-9]+$/)) {
  const range = args[0].split('-');
  let i = parseInt(range[0]);
  while (i <= parseInt(range[1])) {
    ids.push(i);
    i++;
  }
} else {
    ids = args;
  }

if (ids.length === 0) {
  console.error("actionpage id(s) missing");
  help();
  process.exit(1);
}

ids.map(id => {
  (async () => {
    if (argv.pull) {
      try {
        const d = await pull(id);
      } catch (errors) {
        Array.isArray(errors) &&
          errors.map((e) => {
            console.error("\x1b[31m", e.message);
          });
      }
    }

    if (argv.url) {

      //TO DO: validate url

      update(id, { org: { url: argv.url } });
    }

    if (argv.lang) {
      if (!locales.includes(argv.lang)) {
        console.error(`${argv.lang} is not a valid language code`);
        process.exit(0);
      }
      update(id, { lang: argv.lang });
    }

    // LAYOUT SETTINGS

    if (argv.color) {
      if (!argv.color.match(/^#([0-9a-f]{6})$/i)) {
        console.log("color must be a hex code");
        process.exit(0);
      }
      update(id, { layout: { primaryColor: argv.color } });
    }

    if (argv.theme) {
      if (!["dark", "light"].includes(argv.theme)) {
        console.error("theme must be either dark or light");
        process.exit(1);
      }
      update(id, { layout: { theme: argv.theme } });
    }

    if (argv.variant) {
      if (!["standard", "filled", "outlined"].includes(argv.variant)) {
        console.error("variant must be standard, filled or outlined");
        process.exit(0);
      }
      update(id, { layout: { variant: argv.variant } });
    }

    // COMPONENT.WIDGET SETTINGS

    if (argv.mobile) {
      const mobile = isBoolean(argv.mobile, 'mobile');
      update(id, { component: { widget: { mobileVersion: mobile } } });
    }

    if (argv.autostart) {
       const autostart = isBoolean(argv.autostart, 'autostart');
      update(id, { component: { widget: { autoStart: autostart } } });
    }

    if (argv.forcewidth) {
      if(!(typeof argv.forcewidth === 'number')) {
        console.error("forcewidth must be true or number");
        process.exit(0);
      }
      update(id, { component: { widget: { forceWidth: argv.forcewidth } } });
    }

    // COMPONENT.REGISTER (FIELD) SETTINGS

    if (argv.show) {
      let field = {};
      field[argv.show] = true;
      update(id, { component: { field: field } });
    }

    if (argv.hide) {
      let field = {};
      field[argv.show] = hide;
      update(id, { component: { field: field } });
    }

    if (argv.orgdata) {
      const isRequired = isBoolean(argv.orgdata, 'orgdata');
      update(id, { component: { field: { organisation: isRequired } } });
    }

    if (argv.lastnamerequired) {
      const isRequired = isBoolean(argv.lastnamerequired, 'lastnameRequired');
      update(id, { component: { field: { lastname: { required: isRequired } } } });
    }

    if (argv.postcodeshown) {
      const show = isBoolean(argv.poscodeshow, 'poscodeshown');
      update(id, { component: { field: { poscode: show } } });
    }

    if (argv.poscoderequired) {
      const isRequired = isBoolean(argv.poscoderequired, 'poscoderequired');
      update(id, { component: { field: { poscode: { required: isRequired } } } });
    }

    if (argv.countryshow) {
      const show = isBoolean(argv.countryshow, 'countryshow');
      update(id, { component: { field: { country: show } } });
    }

    if (argv.countryrequired) {
      const isRequired = isBoolean(argv.countryrequired, 'countryrequired');
      update(id, { component: { field: { country: { required: isRequired } } } });
    }

    if (argv.commentshow) {
      const show = isBoolean(argv.commentshow, 'commentshow');
      update(id, { component: { field: { comment: show } } });
    }

    if (argv.commentrequired) {
      const isRequired = isBoolean(argv.commentrequired, 'commentrequired');
      update(id, { component: { field: { comment: { required: isRequired } } } });
    }

    if (argv.phoneshow) {
      const show = isBoolean(argv.phoneshow, 'phoneshow');
      update(id, { component: { field: { phone: show } } });
    }


    // COMPONENT.COUNTER SETTINGS

    if (argv.goal) {
      if (!(typeof argv.goal === 'number')) {
        console.error("goal must be a number");
        process.exit(0);
      }
      update(id, { component: { counter: { steps: [`${argv.goal}`] } } });
    }

    // COMPONENT.COUNTRY SETTINGS

    if (argv.country) {
      if (!(typeof argv.country === 'string') || argv.country.length > 5) {
        console.error("country must be a string or boolean");
        process.exit(0);
      }
      const country = argv.country;
      if (country === "true" || country === "false") {
        country = isBoolean(country, 'country');
      }
      update(id, { component: { country: country } });
    }

    // COMPONENT.CONSENT SETTINGS

    if (argv.implicit) {
      const bool = isBoolean(argv.implicit, 'implicit');
      update(id, { component: { consent: { implicit: bool } } });
    }

    // CONFIRM OPT-IN

    if (argv.confirmoptin) {
      const bool = isBoolean(argv.confirmoptin, 'confirmoptin');
      update(id, { component: { consent: { email: { confirmOptIn: bool } } } });
    }

    // TEST MODE

    if (argv.test) {
      const bool = isBoolean(argv.test, 'test');
      update(id, { test: bool });
    }

    // CHANGE LOCALES
    // DANGER: no validation!!

    if (argv.locales) {
      update(id, argv.locales);
    }

    if (argv.push) {
      // must be the last one
      try {
        const d = await push(id);
      } catch (errors) {
        Array.isArray(errors) &&
          errors.map((e) => {
            console.error("\x1b[31m", e.message);
          });
      }
    }

  })();
});
