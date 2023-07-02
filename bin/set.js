#!/usr/bin/env node
require("./dotenv.js");
const { read, save } = require("./config");
const { push, pull } = require("./widget");
const argv = require("minimist")(process.argv.slice(2), {
  boolean: [
    "pull",
    "push",
    "test",
    "mobile",
    "autostart",
    "confirmoptin",
    "implicit",
    "orgdata",
    "poscodeshow",
    "countryshow",
    "commentshow",
    "phoneshown",
  ],
});
const merge = require("lodash.merge");

const locales = [
  "ar",
  "bg",
  "ca",
  "ce",
  "cs",
  "da",
  "de",
  "el",
  "en",
  "en_GB",
  "es",
  "et",
  "eu",
  "fi",
  "fr",
  "fr_CA",
  "fr@informal",
  "ga",
  "ha",
  "he",
  "hi",
  "hr",
  "hu",
  "it",
  "lt",
  "lv",
  "me",
  "mt",
  "nl",
  "pl",
  "pt",
  "ro",
  "rom",
  "ru",
  "sk",
  "sl",
  "sr",
  "sv",
  "uk",
  "yo",
];

const help = () => {
  console.log(
    [
      "options",
      "--help (this command)",
      "--push (push the modified config to the server)",
      "--pull (pull the config from the server before doing the modification)",
      "--color=#cafebebe",
      "--url=http://example.com",
      "--lang=en (set the language)",
      //      "--theme=dark/light",
      "--variant=standard/filled/outlined",
      "--goal=666 or '100,200,500', overwrites the goal",
      "--country=GB or bool, set component.country",
      "--mobile=true",
      "--autostart=true",
      //      "--forcewidth=54 (force the width)",
      //      "--orgdata=true (do we collect the organisation details)*",
      "--required=lastname (postcode, country, comment...)* set the field(s) required. If more than one, type fieldnames with commas, no spaces, eg: --required=lastname,country",
      "--notrequired=lastname (postcode, country, comment...)* changes required field(s) to unrequired. Type fieldnames with commas, no spaces",
      "--show=lastname (postcode, country, comment...)* show optional field(s). If more than one, type fieldnames with commas, no spaces, eg: --hide=lastname,country",
      "--hide=lastname (postcode, country, comment...)* hide optional field(s). Type fieldnames with commas, no spaces",
      "--implicit=true (set the implicit consent)*",
      "--confirmoptin=true*",
      "--test=true*",
      "--locales.component.consent=whatever (set the locales, carefully - no validation)",
      // "--journey=[] (set the journey)",
      " {id} (actionpage id)",
      "input id, ids or range of ids",
      "don't use -required/notrequired and -show/hide for the same fields in the same command",
      //      "boolean inputs, no validatiton, everything but 'false' will be set to 'true'"
    ].join("\n")
  );
  process.exit(0);
};

if (argv.help) {
  help();
}

function update(id, d) {
  let current = read(id);
  const next = merge(current, d);
  save(next);
}

const isRequired = (id, arg, bool) => {
  const changes = arg.split(",");
  changes.map((change) => {
    const field = {};
    field[change] = { required: bool };
    update(id, { component: { register: { field: field } } });
  });
};

const showHide = (id, arg, bool) => {
  const changes = arg.split(",");
  changes.map((change) => {
    const field = {};
    field[change] = bool;
    update(id, { component: { register: { field: field } } });
  });
};

const args = argv._;

let ids = [];

args.map((arg) => {
  if (typeof arg !== "number" && arg.match(/^[0-9]+[-][0-9]+$/)) {
    const range = arg.split("-");
    let i = parseInt(range[0]);
    while (i <= parseInt(range[1])) {
      ids.push(parseInt(i));
      i++;
    }
  } else {
    ids.push(arg);
  }
});

if (ids.length === 0) {
  console.error("actionpage id(s) missing");
  help();
  process.exit(1);
}

ids.map((id) => {
  (async () => {
    if (argv.pull) {
      try {
        await pull(id);
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
      update(id, { component: { widget: { mobileVersion: argv.mobile } } });
    }

    if (argv.autostart) {
      update(id, { component: { widget: { autoStart: argv.autostart } } });
    }

    if (argv.forcewidth) {
      if (!(typeof argv.forcewidth === "number")) {
        console.error("forcewidth must be true or number");
        process.exit(0);
      }
      update(id, { component: { widget: { forceWidth: argv.forcewidth } } });
    }

    // COMPONENT.REGISTER (FIELD) SETTINGS

    if (argv.show) {
      showHide(id, argv.show, true);
    }

    if (argv.hide) {
      showHide(id, argv.hide, false);
    }

    if (argv.required) {
      isRequired(id, argv.required, true);
    }

    if (argv.notrequired) {
      isRequired(id, argv.notrequired, false);
    }

    if (argv.orgdata) {
      update(id, {
        component: { register: { field: { organisation: argv.orgdata } } },
      });
    }

    // COMPONENT.COUNTER SETTINGS

    if (argv.goal) {
      let steps = [];
      if (typeof argv.goal === "string" && argv.goal.indexOf(",") > -1) {
        steps = argv.goal.split(",").map((g) => parseInt(g));
      } else if (typeof argv.goal === "number") {
        steps.push(argv.goal);
      } else {
        console.error(
          "goal must be a number or numbers separated by commas (no spaces)"
        );
        process.exit(0);
      }
      update(id, { component: { counter: { steps: steps } } });
    }

    // COMPONENT.COUNTRY SETTINGS

    if (argv.country) {
      if (!(typeof argv.country === "string") || argv.country.length > 5) {
        console.error("country must be a two char string or boolean");
        process.exit(0);
      }
      let country = argv.country;
      if (country === "true") {
        country = true;
      } else if (country === "false") {
        country = false;
      } else {
        if (country.length > 2) {
          console.error("Invalig country code");
          process.exit(0);
        }
      }
      update(id, { component: { country: country } });
    }

    // COMPONENT.CONSENT SETTINGS

    if (argv.implicit) {
      update(id, { component: { consent: { implicit: argv.implicit } } });
    }

    // CONFIRM OPT-IN

    if (argv.confirmoptin) {
      update(id, {
        component: { consent: { email: { confirmOptIn: argv.confirmoptin } } },
      });
    }

    // TEST MODE

    if (argv.test) {
      update(id, { test: argv.test });
    }

    // CHANGE LOCALES
    // DANGER: no validation!!

    if (argv.locales) {
      update(id, argv.locales);
    }

    if (argv.push) {
      // must be the last one
      try {
        await push(id);
      } catch (errors) {
        Array.isArray(errors) &&
          errors.map((e) => {
            console.error("\x1b[31m", e.message);
          });
      }
    }
  })();
});
