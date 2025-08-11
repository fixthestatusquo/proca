const isDirectCli = () => !require.main?.filename.endsWith ("proca-cli");

const env = isDirectCli () && require("dotenv").config({
  path: process.env.PROCA_ENV ? ".env." + process.env.PROCA_ENV : ".env",
  debug: false,
});

module.exports = {env, isDirectCli};
