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

const goStep = (action)=> {
  const event = new CustomEvent('proca-go', {detail: { action: action }});
  document.getElementById(id).dispatchEvent(event);
};

const setAfter = (action,after)=> {
  const event = new CustomEvent('proca-after', {detail: { action: action, after: after }});
  document.getElementById(id).dispatchEvent(event);
};

export const ConfigProvider = props => {

  const [config, _setConfig] = useState(props.config);
  const go = props.go;
  const setAfter = props.setAfter;

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

    elem.addEventListener('proca-after',  (e) => {
      console.log(e.detail);
      if (!typeof e.detail.after === 'function') 
        return console.error("After must be a function");

      if (!typeof e.detail.action === 'string') 
        return console.error("action must me a string");
    
      setAfter(e.detail.action,e.detail.after);

    }, false);

    elem.addEventListener('proca-go',  (e) => {
      if (typeof go === 'function') {
        go(e.detail.action);
      } else { 
        console.error("ain't no go fct");
      }
    }, false);

  },[setConfig,go,setAfter]);


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
export {goStep};
export {setAfter as after};
export default useConfig;

