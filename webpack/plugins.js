const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const ModuleScopePlugin = require("react-dev-utils/ModuleScopePlugin");
const _webpack = require("webpack");

module.exports = webpack => {
  webpack.plugins.push(
    new _webpack.BannerPlugin({
      banner: "hello world proca.app",
    })
  );
  if (process.env.BUNDLE_VISUALIZE == 1) {
    webpack.plugins.push(new BundleAnalyzerPlugin({ analyzerMode: "static" }));
    // analyzerMode: "static",
    // reportFilename: "report.html"
  }

  webpack.resolve.plugins = webpack.resolve.plugins.filter(
    plugin => !(plugin instanceof ModuleScopePlugin)
  );

  return webpack;
};
