// babel.config.js

module.exports = function (api) {
  api.cache(true);

  const presets = [
    ["@babel/preset-env", { modules: false }],
    "@babel/preset-react",
  ];
  const plugins = [
    // "macros",
    // 'optimize-clsx',
    // ['@babel/plugin-proposal-class-properties', { loose: true }],
    // ['@babel/plugin-transform-runtime'],
    // for IE 11 support
    // '@babel/plugin-transform-object-assign',
    // '@babel/plugin-proposal-optional-chaining',
    // '@babel/plugin-proposal-nullish-coalescing-operator',
    [
      "module-resolver",
      {
        root: "src",
        alias: {
          locales: "./src/locales",
        },
      },
    ],
    //      "@babel/plugin-transform-react-jsx",
    //        "@babel/plugin-transform-modules-commonjs"

    //        "transform-object-rest-spread",
    //        "transform-react-jsx"
  ];

  return {
    presets,
    plugins,
  };
};
