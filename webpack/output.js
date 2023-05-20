const { getConfigOverride } = require("./config");
const path = require("path");
const cp = require("child_process");
const fs = require("graceful-fs");
const CompressionPlugin = require("compression-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const GenerateJsonPlugin = require("generate-json-webpack-plugin");

module.exports = (webpack) => {
  if (process.env["BUILD_PACKAGE"] && process.env["NPM"]) {
    packageBuildConfig(webpack);
  } else {
    const [configFile, config] = getConfigOverride();
    widgetBuildConfig(webpack, config);
  }

  webpack.output.libraryTarget = "umd";
  webpack.output.library = ["proca"];

  optimizationConfig(webpack);
  compressionConfig(webpack);
  iframeConfig(webpack);
  oembedConfig(webpack);
  console.log(
    `building https://widget.proca.app${webpack.output.publicPath}index.html`
  );
  return webpack;
};

function packageBuildConfig(webpack) {
  webpack.entry = "./src/module.js";
  webpack.output = {
    path: path.resolve("../lib"),
    filename: "index.js",
    libraryTarget: "commonjs2",
  };
  // XXX why do we want to disable this?
  // webpack.plugins[1].options.minify.collapseWhitespace = false;
  // webpack.plugins[1].options.minify.minifyCSS = false;
  // webpack.plugins[1].options.minify.minifyJS = false;
}

function saveVersion(config) {
  const hash = cp.execSync("git rev-parse HEAD").toString().trim();
  console.log(hash);
  fs.writeFileSync(
    path.resolve(
      __dirname,
      "../d/" + config.filename + "/config-" + hash + ".json"
    ),
    JSON.stringify(config, null, 2)
  );
}

function cleanUp(config) {
  fs.unlinkSync(
    path.resolve(__dirname, "../d/" + config.filename + "/index.js.map")
  );
  // needed (only for the message at the end of the build)          fs.unlinkSync(path.resolve(__dirname,'../d/'+config.filename+'/index.js'));
}

function widgetBuildConfig(webpack, config) {
  // with yarn build, put the output in dedicated widget directory
  console.log("building");
  if (webpack.mode === "production") {
    webpack.output.filename = "index.js";
    webpack.output.path = path.resolve(__dirname, "../d/" + config.filename);
    webpack.output.publicPath = "/d/" + config.filename + "/";

    webpack.plugins.push({
      apply: (compiler) => {
        compiler.hooks.afterEmit.tap("AfterEmitPlugin", (compilation) => {
          try {
            fs.symlinkSync(
              path.resolve(__dirname, "../d/" + config.filename + "/index.js"),
              path.resolve(__dirname, "../build/index.js")
            );
            fs.symlinkSync(
              path.resolve(__dirname, "../d/" + config.filename + "/static/js"),
              path.resolve(__dirname, "../build/satic/js")
            );
            console.log("trying to fix the error on file size");
          } catch (e) {
            console.log("already building the widget");
          }
          saveVersion(config);
          cleanUp(config);
        });
      },
    });
  }

  // override index.html template with layout.HtmlTemplate in config
  // doc: https://github.com/jantimon/html-webpack-plugin#options
  for (const plug of webpack.plugins) {
    if (plug instanceof HtmlWebpackPlugin) {
      plug.options.templateParameters = {
        campaign: config.campaign.title,
        organisation: config.organisation,
        lang: config.lang,
        filename: config.filename,
      };
    }
  }
  if (config.layout && (config.layout.HtmlTemplate || config.layout.template)) {
    const template = config.layout.HtmlTemplate || config.layout.template;
    for (const plug of webpack.plugins) {
      if (plug instanceof HtmlWebpackPlugin) {
        const publicDir = path.resolve(__dirname, "../public");
        if (plug.options.filename === "index.html") {
          plug.options.template = `${publicDir}/${template}`;
        }
        plug.options.title = `${config.organisation} - ${config.campaign.title}`;
        plug.options.config = config;
      }
    }
  }
  /* So this is maybe for this error to disappear?
   * Webpack is doing something really silly here:
   * File sizes after gzip:
   *
   * ENOENT: no such file or directory, open '/home/marcin/Projects/widget/build/index.js'
   */
}

// XXX - add doc what does it do

function optimizationConfig(webpack) {
  webpack.optimization.runtimeChunk = false;
  webpack.optimization.splitChunks = {
    cacheGroups: {
      default: false,
    },
  };
}

function iframeConfig(webpack) {
  let config = {};
  const publicDir = path.resolve(__dirname, "../public");
  for (const plug of webpack.plugins) {
    if (plug instanceof HtmlWebpackPlugin) {
      config = plug.options.templateParameters;

      // if (plug.options.filename === "index.html")
    }
  }
  console.log(publicDir, config);

  webpack.plugins.push(
    new HtmlWebpackPlugin({
      filename: "iframe.html",
      template: `${publicDir}/iframe.html`,
      title: config.filename, // this is a hackish workaround
      proca: config, // this is a hackish workaround
    })
  );
}

function oembedConfig(webpack) {
  const publicDir = webpack.output.path;
  webpack.plugins.push(
    new GenerateJsonPlugin("oembed.json", {
      version: "1.0",
      type: "rich",

      provider_name: "Fix the Status Quo",
      provider_url: "https://www.fixthestatusquo.org",

      html: `<iframe src="https://widget.proca.app${webpack.output.publicPath}iframe.html" width=\"700\" height=\"825\" scrolling=\"yes\" frameborder=\"0\" allowfullscreen></iframe>`,
      width: 700,
      height: 825,
      cache_age: 3600,
    })
  );
}
function compressionConfig(webpack) {
  webpack.plugins.push(
    new CompressionPlugin({
      exclude: /.map$/,
      threshold: 8192,
      test: "index.js",
      include: "index.js",
    })
  );
}
