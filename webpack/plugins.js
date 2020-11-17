const {BundleAnalyzerPlugin} = require("webpack-bundle-analyzer")

module.exports = webpack => {
  if (process.env.BUNDLE_VISUALIZE == 1) {
    webpack.plugins.push(new BundleAnalyzerPlugin({analyzerMode: "static"}))
      // analyzerMode: "static",
      // reportFilename: "report.html"
  }

  return webpack;
}
