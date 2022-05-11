const env = require("dotenv").config({
  path: process.env.PROCA_ENV ? ".env." + process.env.PROCA_ENV : ".env",
  debug: true,
});
module.exports = env;
