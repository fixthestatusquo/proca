// if dealing with context directly gets tiring, possibly: diegohaz/constate or jamiebuilds/unstated
//
import React,{useContext,useState,useEffect, useCallback} from 'react';
export let Config=React.createContext();

const id='proca-listener';
const set = (key,value)=> {
  const event = new CustomEvent('proca-set', {detail: { key: key, value:value }});

  document
    .getElementById(id)
    .dispatchEvent(event);
};

export const ConfigProvider = props => {

  const [config, _setConfig] = useState(props.config);

  const setConfig = useCallback((k,v) => {
    let d = Object.create(config);
    d[k]=v;
    _setConfig(d);
  }, [config]);
  

  useEffect(() => {

    const elem = document.getElementById(id);
    elem.addEventListener('proca-set',  (e) => { 
      
      setConfig(e.detail.key,e.detail.value);
    }, false);

  },[setConfig]);


  return (
    <Config.Provider value={{config, setConfig}}>
      {props.children}
      <div id={id}></div>
    </Config.Provider>
  );
};

//export const useConfig = () => (useContext(Config));
export const useConfig = () => {
  return useContext(Config)
};

export {set as setConfig};
export default useConfig;

