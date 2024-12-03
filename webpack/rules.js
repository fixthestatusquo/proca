var path = require("path");

module.exports = webpack => {
  webpack.module.rules.push({
    test: /\.mjs$/,
    include: /node_modules/,
    type: "javascript/auto",
  });
  webpack.module.rules.unshift({
    test: /actionPage\.js$/,
    use: [
      {
        loader: path.resolve("webpack/actionPage.js"),
        options: {},
      },
    ],
  });
  return webpack;
};
