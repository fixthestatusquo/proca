const webpack = require('webpack');
const { paths } = require('react-app-rewired');
const { useBabelRc,override} = require('customize-cra')
const { addReactRefresh } = require('customize-cra-react-refresh')
const CompressionPlugin = require('compression-webpack-plugin')
const path = require('path');

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
//
const conditionalImport = (alias,journey) =>{
//  config.resolve.alias['Conditional_Share$']= path.resolve(__dirname, 'src/components/')+'/Disabled.js';

  let steps = {
    'petition': 'SignatureForm',
    'share': 'Share',
    'button': 'FAB',
    'twitter': 'Twitter',
    'dialog': 'Dialog',
  };

  for (let [k,v] of Object.entries(steps)) {
    const Component = journey.includes(k)? v : 'Disabled';
    alias['Conditional_'+v+'$']= path.resolve(__dirname, 'src/components/')+'/'+Component+'.js';
  }

}

  const stringified = (raw) => {
    const d ={
    'process.widget': Object.keys(raw).reduce((env, key) => {
      env[key] = JSON.stringify(raw[key]);
      return env;
    }, {})
    };
//    console.log(raw);process.exit(1);
    // not sure we need that anymore
    raw.journey.split(",").forEach(step => d['process.widget']["include_"+step]=1);
    return d;
  };

module.exports = function override (config, env) {
// todo: add babel +                  "i18next-extract",
  useBabelRc();

  if (!process.env.widget) 
    process.env.widget="_default";
  let widget= require('dotenv').config({ path: './config/'+process.env.widget+'.yaml' }).parsed;
  if (!widget.journey)
    widget.journey="petition,share";
  console.log(widget);
//  process.exit(1);
  // doesn't work addWebpackPlugin(new webpack.DefinePlugin(stringified(w.parsed)));
  config.plugins.unshift(new webpack.DefinePlugin(stringified(widget)));
  config.plugins.push(new CompressionPlugin());
  config = addReactRefresh({ disableRefreshCheck: true }) (config,env);
  config.optimization.runtimeChunk = false;
  config.optimization.splitChunks = {
    cacheGroups: {
      default: false
    }
  };
  conditionalImport(config.resolve.alias,widget.journey.split(','));

//  config.resolve.alias['locales']= path.resolve(__dirname, 'src/locales/');
  config.resolve.alias['locales']= path.resolve(__dirname, 'src/locales/'+widget.lang.toLowerCase());

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


