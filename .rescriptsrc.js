require("dotenv").config({
  path: process.env.PROCA_ENV ? ".env." + process.env.PROCA_ENV : ".env",
  debug: false,
});

module.exports = [
  require.resolve("./webpack/rules"),
  require.resolve("./webpack/alias"),
  require.resolve("./webpack/output"),
  require.resolve("./webpack/plugins"),
  {
    devServer: (config) => {
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
      return config;
    },
  },

  //  require.resolve("./webpack/watchConfig"),
];
