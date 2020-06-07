import React,{useContext,useState} from 'react';
export let Config=null;

const set = (key,value)=> {
  console.log(key,value);

};

const init = (config) => {
  config.set = set;
  Config = React.createContext(config);
};

export const ConfigProvider = props => {

  const [config, _setConfig] = useState(props.config);

  const setConfig = (k,v) => {
  let d = config;
    d[k]=v;
    _setConfig(d);
  }

  return (
    <Config.Provider value={[config, setConfig]}>
      {props.children}
    </Config.Provider>
  );
};

//export const useConfig = () => (useContext(Config));
export const useConfig = () => {
  return useContext(Config)
};

export {init as initConfig, set as setConfig};
export default useConfig;

