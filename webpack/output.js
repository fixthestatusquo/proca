const CompressionPlugin = require("compression-webpack-plugin");

module.exports = (webpack) => {
  if (process.env["BUILD_PACKAGE"] && process.env["NPM"]) {
    packageBuildConfig(webpack);
  } else {
    widgetBuildConfig(webpack, config);
  }
  webpack.output.libraryTarget = "umd";
  webpack.output.library = ["proca"];
  optimizationConfig(webpack);
  compressionConfig(webpack);

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

function widgetBuildConfig(webpack, config) {
  // with yarn build, put the output in dedicated widget directory
  if (webpack.mode === "production") {
    webpack.output.filename = "index.js";
    webpack.output.path = path.resolve(__dirname, OUTPUT_DIRECTORY);
    webpack.output.publicPath = "auto";
  }
}

function optimizationConfig(webpack) {
  webpack.optimization.runtimeChunk = false;
  webpack.optimization.splitChunks = {
    cacheGroups: {
      default: false,
    },
  };
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
