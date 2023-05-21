#!/usr/bin/env node
const env = require("./dotenv.js");
const path = require("path");
const cp = require("child_process");
const fs = require("fs");
const zlib = require("node:zlib");
const { pipeline } = require("node:stream/promises");
const color = require("cli-color");
const browserslist = require("browserslist");

const { getConfigOverride } = require("../webpack/config");
const actionPage = require("../webpack/actionPage");

const { esbuildPluginBrowserslist } = require("esbuild-plugin-browserslist");
const { build, context } = require("esbuild");
const { copy } = require("esbuild-plugin-copy");

const help = (exit = 0) => {
  console.log(
    color.yellow(
      [
        "options",
        "--help (this command)",
        "--serve for development http server",
        "--verbose",
        "{actionpage id}",
      ].join("\n")
    )
  );
  process.exit(exit);
};
const argv = require("minimist")(process.argv.slice(2), {
  boolean: ["help", "verbose", "serve"],
  unknown: (d) => {
    const allowed = []; //merge with boolean and string?
    if (d[0] !== "-" || require.main !== module) return true;
    if (allowed.includes(d.split("=")[0].slice(2))) return true;
    console.log(color.red("unknown param", d));
    help(1);
  },
});
if (argv._.length === 0 || argv.help) {
  console.error(color.red("missing param widget id"));
  help(argv._.length === 0 ? 1 : 0);
}

const id = argv._[0];
const [filename, config, campaign] = getConfigOverride(id);

const define = (env) => {
  const defined = {
    global: "window",
    "process.env.NODE_ENV":
      '"' + (argv.serve ? "development" : "production") + '"',
  };
  Object.keys(env)
    .filter((d) => d.startsWith("REACT_APP_"))
    .forEach((d) => (defined["process.env." + d] = '"' + env[d] + '"'));
  return defined;
};

const save = () => {
  const hash = cp.execSync("git rev-parse HEAD").toString().trim();
  fs.writeFileSync(
    path.resolve(
      __dirname,
      "../d/" + config.filename + "/config-" + hash + ".json"
    ),
    JSON.stringify(config, null, 2)
  );
  if (argv.verbose) {
    console.log(JSON.stringify(config, null, 2));
  } else {
    console.log("config", "d/" + config.filename + "/config-" + hash + ".json");
  }
};

/*
  webpack.resolve.alias["@config"] = path.resolve(__dirname, configFolder());
*/

const resolveCountryList = () => {
  const lang = config.lang;
  let countryList = "i18n-iso-countries/langs/" + lang + ".json";
  let r = {};
  if (!fs.existsSync("node_modules/" + countryList)) {
    console.log("can't find", lang, "default to en");
    countryList = "i18n-iso-countries/langs/en.json";
    r.warnings = ["built using lang" + lang];
  }
  return {
    path: path.resolve(__dirname, "../node_modules/" + countryList),
    sideEffects: false,
  };
};

let procaPlugin = {
  name: "proca",
  setup(build) {
    build.onResolve(
      { filter: /^@(components|lib|hooks|images|data)/ },
      (args) => {
        const r = path.resolve(__dirname, args.path.replace("@", "../src/"));
        return { path: r.includes(".") ? r : r + ".js", sideEffects: false };
      }
    );
    build.onResolve(
      { filter: /@i18n-iso-countries\/lang/ },
      resolveCountryList
    );
    build.onResolve({ filter: /locales\/common\.js/ }, (args) => {
      return {
        path: path.resolve(
          __dirname,
          "../src/locales/" + config.lang + "/common.json"
        ),
        sideEffects: false,
      };
    });
    //build.onLoad({ filter: /locales\/common\.js/ }, (args) => {});
    build.onEnd(async (result) => {
      //      console.log(`build ended with ${result.errors.length} errors`);
      //outdir: "d/" + config.filename,
      //        from: ["./public/index.html", "./public/embed.html"],
      const html = fs.readFileSync("./public/index.html", "utf8");
      fs.writeFileSync(
        "d/" + config.filename + "/index.html",
        html
          .replace("<body>", "<body><script src='./index.js'></script>")
          .replaceAll("%PUBLIC_URL%", "/")
          .replaceAll("<%= lang %>", config.lang)
          .replaceAll("<%= campaign %>", config.campaign.title)
          .replaceAll("<%= organisation %>", config.org.name)
      );

      if (!argv.serve) {
        const index = "d/" + config.filename + "/index.js";
        await pipeline(
          fs.createReadStream(index),
          zlib.createGzip(),
          fs.createWriteStream(index + ".gz")
        );
        const stats = fs.statSync(index + ".gz");
        console.log(
          color.bold(index + ".gz"),
          color.cyan(Math.round(stats.size / 1024) + "kb")
        );
      }
      save();
      //     console.log(result);
    });
    build.onLoad({ filter: /.*src\/actionPage\.js$/ }, (args) => {
      console.log(color.blue("load", config.filename));
      return {
        watchFiles: [
          "config/" + filename,
          "config/campaign/" + config.campaign.name + ".json",
        ],
        contents: actionPage(id),
      };
    });
  },
};

const buildConfig = {
  globalName: "proca",
  format: "iife",
  logLevel: "info",
  entryPoints: ["src/index.js"],
  define: define(env.parsed),
  bundle: true,
  plugins: [
    procaPlugin,
    copy({
      watch: true,
      assets: {
        from: ["./public/embed.html"],
        to: ["./"],
      },
    }),
    esbuildPluginBrowserslist(browserslist("defaults"), {
      printUnknownTargets: false,
    }),
  ],
  loader: { ".js": "jsx" },
  outdir: "d/" + config.filename,
};

if (argv.serve) {
  (async () => {
    buildConfig.banner = {
      js: ' (() => new EventSource("/esbuild").onmessage = () => location.reload())();',
    };
    const c = await context(buildConfig);
    await c.watch();
    await c.serve({ servedir: buildConfig.outdir });
  })();
} else {
  buildConfig.minify = true;
  //  buildConfig.analyze = true;
  build(buildConfig).catch(() => process.exit(1));
}
