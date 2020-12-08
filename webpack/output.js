const { getConfigOverride } = require("./config");
const path = require("path");
const cp = require("child_process");
const fs = require("graceful-fs");
const CompressionPlugin = require("compression-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = (webpack) => {
  if (process.env["BUILD_PACKAGE"] && process.env["NPM"]) {
    packageBuildConfig(webpack);
  } else {
    const config = getConfigOverride({ filename: "_example" });
    widgetBuildConfig(webpack, config);
  }

  webpack.output.libraryTarget = "umd";
  webpack.output.library = ["proca"];

  optimizationConfig(webpack);
  compressionConfig(webpack);
  iframeConfig(webpack);

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
  //needed (only for the message at the end of the build)          fs.unlinkSync(path.resolve(__dirname,'../d/'+config.filename+'/index.js'));
}

function widgetBuildConfig(webpack, config) {
  // with yarn build, put the output in dedicated widget directory
  if (webpack.mode === "production") {
    webpack.output.filename = "index.js";
    webpack.output.path = path.resolve(__dirname, "../d/" + config.filename);
    webpack.output.publicPath = "/d/" + config.filename + "/";

    webpack.plugins.push({
      apply: (compiler) => {
        compiler.hooks.afterEmit.tap("AfterEmitPlugin", (compilation) => {
          fs.symlinkSync(
            path.resolve(__dirname, "../d/" + config.filename + "/index.js"),
            path.resolve(__dirname, "../build/index.js")
          );
          saveVersion(config);
          cleanUp(config);
        });
      },
    });
  }

  // override index.html template with layout.HtmlTemplate in config
  if (config.layout && config.layout.HtmlTemplate) {
    for (const plug of webpack.plugins) {
      if (plug instanceof HtmlWebpackPlugin) {
        const publicDir = path.resolve(__dirname, "../public");
        console.log(plug.options);
        if (plug.filename === "index.html")
          plug.options.template = `${publicDir}/${config.layout.HtmlTemplate}`;
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
  const publicDir = path.resolve(__dirname, "../public");
  webpack.plugins.push(
    new HtmlWebpackPlugin({
      filename: "iframe.html",
      template: `${publicDir}/iframe.html`,
    })
  );
}

function compressionConfig(webpack) {
  webpack.plugins.push(
    new CompressionPlugin({
      exclude: /\*.map$/,
      test: "index.js",
      include: "index.js",
    })
  );
}
