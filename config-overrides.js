const webpack = require('webpack');
const { paths } = require('react-app-rewired');
const { useBabelRc,override} = require('customize-cra')
const { addReactRefresh } = require('customize-cra-react-refresh')
const CompressionPlugin = require('compression-webpack-plugin')
/* for brotli (future version) 
  const zlib = require('zlib');
  config.plugins.push(new CompressionPlugin({
      filename: '[path].br[query]',
      algorithm: 'brotliCompress',
      test: /\.(js|css|html|svg)$/,
      compressionOptions: {
        level: 11,
      },
      threshold: 10240,
      minRatio: 0.8,
      deleteOriginalAssets: false
    }));

*/

const appPackageJson = require(paths.appPackageJson);
const minorVersion = appPackageJson.version.split(".").slice(0,2).join("-");

//paths.appIndexJs = paths.appIndexJs.replace('index.js','Widget.js'); // NOT WORKING, modified index.js
// potential workaround : https://gist.github.com/benedictjohannes/33f93ccd2a66b9c150460c525937a8d3

  const stringified = (raw) => {
    console.log(raw);
    const d ={
    'process.widget': Object.keys(raw).reduce((env, key) => {
      env[key] = JSON.stringify(raw[key]);
      return env;
    }, {})
    };
    return d;
  };

module.exports = function override (config, env) {
// todo: add babel +                  "i18next-extract",
  useBabelRc();

  if (!process.env.widget) 
    process.env.widget="_default";
  const widget= require('dotenv').config({ path: './config/'+process.env.widget+'.yaml' }).parsed;
  // doesn't work addWebpackPlugin(new webpack.DefinePlugin(stringified(w.parsed)));
  config.plugins.unshift(new webpack.DefinePlugin(stringified(widget)));
  config.plugins.push(new CompressionPlugin());
//  process.exit(1);
  config = addReactRefresh({ disableRefreshCheck: true }) (config,env);
  config.optimization.runtimeChunk = false;
  config.optimization.splitChunks = {
    cacheGroups: {
      default: false
    }
  };
  if (config.mode === 'production') {
    //config.output.filename= 'static/js/[name].'+minorVersion+'.js'
    config.output.filename= 'd/'+widget.filename+'/index.js'
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


