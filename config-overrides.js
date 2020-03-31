const { paths } = require('react-app-rewired');
const { override } = require('customize-cra')
const { addReactRefresh } = require('customize-cra-react-refresh')

const appPackageJson = require(paths.appPackageJson);
const minorVersion = appPackageJson.version.split(".").slice(0,2).join("-");

//paths.appIndexJs = paths.appIndexJs.replace('index.js','Widget.js'); // NOT WORKING, modified index.js
// potential workaround : https://gist.github.com/benedictjohannes/33f93ccd2a66b9c150460c525937a8d3

module.exports = function override (config, env) {
// todo: add babel +                  "i18next-extract",
  config = addReactRefresh({ disableRefreshCheck: true }) (config,env);
  config.optimization.runtimeChunk = false;
  config.optimization.splitChunks = {
    cacheGroups: {
      default: false
    }
  };
  if (config.mode === 'production') {
    config.output.filename= 'static/js/[name].'+minorVersion+'.js'
  }
/* to prevent loading react
  config.externals = {
    react: 'React',
    'react-dom': 'ReactDOM'
  }
 *
 *
 *
 */
  /*
     filename: isEnvProduction
        : isEnvDevelopment && 'static/js/bundle.js',
*/
  config.output.libraryTarget= 'umd';
  config.output.library = ["proca"];

//  console.log(config);
  return config
}


