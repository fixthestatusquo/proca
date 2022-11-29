require("dotenv").config({
  path: process.env.PROCA_ENV ? ".env." + process.env.PROCA_ENV : ".env",
  debug: false,
});

const rulesjs = require.resolve("./webpack/rules");
const config = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      console.log("bbb");
      process.exit(1);
      const rules = rulesjs(webpackConfig);
      console.log("rules", rules);
      process.exit(1);
      return webpackConfig;
    },
    rule: require.resolve("./webpack/rules"),
    alias: require("./webpack/alias"),
    output: require.resolve("./webpack/output"),
    plugin: require.resolve("./webpack/plugins"),
  },
  devServer: (config, { env, paths }) => {
    console.log("aaa");
    process.exit(1);
    const { getConfigOverride } = require("./webpack/config");
    const oldBefore = config.before;
    config.before = (app, server) => {
      // it does reload when either the ap or the campaign config files are updated... but @marcin, I do not know how to force reload the cconfig
      const [file, ap] = getConfigOverride();
      oldBefore(app, server);
      const chokidar = require("chokidar");
      console.log(
        "./config/" + file,
        "./config/campaign/" + ap.campaign.name + ".json"
      );
      chokidar.watch("./config/" + file).on("all", function (event, path) {
        server.sockWrite(server.sockets, "content-changed");
      });
      chokidar
        .watch("./config/campaign/" + ap.campaign.name + ".json")
        .on("all", function (event, path) {
          server.sockWrite(server.sockets, "content-changed");
        });
    };
    console.log(config);
    return config;
  },
};

module.export = config;
//  require.resolve("./webpack/watchConfig"),
//module.exports = [];
