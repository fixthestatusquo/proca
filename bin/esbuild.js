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

const { build: esbuild, context, analyzeMetafileSync } = require("esbuild");
const { esbuildPluginBrowserslist } = require("esbuild-plugin-browserslist");
const { copy } = require("esbuild-plugin-copy");
let runs = 0;

const help = (exit = 0) => {
  console.log(
    color.yellow(
      [
        "options",
        "--help (this command)",
        "--serve for development http server",
        "--verbose",
        "--analyze",
        "{actionpage id}",
      ].join("\n")
    )
  );
  process.exit(exit);
};
const argv = require("minimist")(process.argv.slice(2), {
  boolean: ["help", "verbose", "serve", "analyze"],
  unknown: (d) => {
    const allowed = []; //merge with boolean and string?
    if (d[0] !== "-" || require.main !== module) return true;
    if (allowed.includes(d.split("=")[0].slice(2))) return true;
    console.log(color.red("unknown param", d));
    help(1);
  },
});

const define = (env) => {
  const defined = {
    global: "window",
    "process.env.REACT_APP_API_URL": '"https://api.proca.app/api"',
    "process.env.NODE_ENV":
      '"' + (argv.serve ? "development" : "production") + '"',
  };
  Object.keys(env)
    .filter((d) => d.startsWith("REACT_APP_"))
    .forEach((d) => (defined["process.env." + d] = '"' + env[d] + '"'));
  return defined;
};

const save = (config) => {
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
    runs === 0 &&
      console.log(
        "config",
        "d/" + config.filename + "/config-" + hash + ".json"
      );
  }
};

/*
  webpack.resolve.alias["@config"] = path.resolve(__dirname, configFolder());
*/

const resolveCountryList = (config) => {
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

let procaPlugin = ({ id, config }) => ({
  name: "proca",
  setup(build) {
    build.onResolve(
      { filter: /^@(components|lib|hooks|images|data)/ },
      (args) => {
        const r = path.resolve(__dirname, args.path.replace("@", "../src/"));
        return { path: r.includes(".") ? r : r + ".js", sideEffects: false };
      }
    );
    build.onResolve({ filter: /@i18n-iso-countries\/lang/ }, () =>
      resolveCountryList(config)
    );
    build.onResolve({ filter: /locales\/common\.js/ }, () => {
      return {
        path: path.resolve(
          __dirname,
          "../src/locales/" + config.lang + "/common.json"
        ),
        sideEffects: false,
      };
    });
    build.onEnd(async () => {
      let file = "./public/index.html";
      if (
        config.layout &&
        (config.layout.HtmlTemplate || config.layout.template)
      ) {
        file =
          "./public/" + (config.layout.HtmlTemplate || config.layout.template);
      }
      const html = fs.readFileSync(file, "utf8");
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
          zlib.createGzip({}),
          fs.createWriteStream(index + ".gz")
        );
        const stats = fs.statSync(index + ".gz");
        console.log(
          color.bold(index + ".gz"),
          color.cyan(Math.round(stats.size / 1024) + "kb")
        );
      }
      save(config);
      runs++;
      //     console.log(result);
    });
    build.onLoad({ filter: /.*src\/actionPage\.js$/ }, () => {
      if (argv.serve) {
        runs === 0
          ? console.log(color.blue("load", config.filename))
          : console.log("reload");
      }
      return {
        watchFiles: [
          "config/" + config.filename,
          "config/campaign/" + config.campaign.name + ".json",
        ],
        contents: actionPage(id),
      };
    });
  },
});

const getConfig = (id) => {
  const [, config] = getConfigOverride(id);

  return {
    globalName: "proca",
    format: "iife",
    logLevel: "info",
    entryPoints: ["src/index.js"],
    define: define(env.parsed),
    bundle: true,
    plugins: [
      procaPlugin({ id: id, config: config }),
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
};

const serve = async (id) => {
  const buildConfig = getConfig(id);
  buildConfig.sourcemap = "inline";
  //  buildConfig.plugins.push (eslint);
  buildConfig.banner = {
    //  js: ' (() => new EventSource("/esbuild").onmessage = () => location.reload())();'
    js: '(() => new EventSource("/esbuild").addEventListener("change", () => {console.log("reload");location.reload()}))()',
  };
  const c = await context(buildConfig);
  await c.watch();
  const r = await c.serve({ servedir: buildConfig.outdir });
  const open = await import("open");
  open.default("http://" + r.host + ":" + r.port);
};

const build = async (id) => {
  const buildConfig = getConfig(id);
  buildConfig.minify = true;
  if (argv.analyze) buildConfig.metafile = true;
  const result = await esbuild(buildConfig);
  if (result.metafile) {
    fs.writeFileSync("build/metafile.json", JSON.stringify(result.metafile));
    const r = analyzeMetafileSync(result.metafile);
    console.log(r, "build/metafile.json");
  }
};

if (require.main === module) {
  if (argv._.length === 0 || argv.help) {
    console.error(color.red("missing param widget id"));
    help(argv._.length === 0 ? 1 : 0);
  }

  const id = argv._[0];
  if (argv.serve) {
    (async () => {
      await serve(id);
    })();
  } else {
    (async () => {
      await build(id);
    })();
  }
} else {
  //export a bunch
  module.exports = { build, serve };
}
