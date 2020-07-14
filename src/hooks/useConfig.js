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

const setHook = (object, action, hook)=> {
  const event = new CustomEvent('proca-hook', {detail: { object:object, action: action, hook: hook }});
  document.getElementById(id).dispatchEvent(event);
};

export const ConfigProvider = props => {

  const [config, _setConfig] = useState(props.config);
  const go = props.go;

  const setConfig = useCallback((k,v) => {
    let d = {...config}
    d[k]=v;
    _setConfig(d);
  }, [config]);
  
  const setHook = useCallback ((object,action,hook) => {
    let hooks = config.hook;
    hooks[object+":"+action] = hook;
    console.log(hooks,object,action);
    setConfig("hook",hooks);
    console.log(config);
  },[config,setConfig]);


  useEffect(() => {
    const elem = document.getElementById(id);

    elem.addEventListener('proca-set',  (e) => { 
      setConfig(e.detail.key,e.detail.value);
    }, false);

    elem.addEventListener('proca-hook',  (e) => {
      if (!typeof e.detail.hook === 'function') 
        return console.error("After must be a function");

      if (!typeof e.detail.action === 'string') 
        return console.error("action must me a string");
    
      if (!typeof e.detail.object === 'string') 
        return console.error("object must me a string");
   
      setHook(e.detail.object,e.detail.action,e.detail.hook);

    }, false);

    elem.addEventListener('proca-go',  (e) => {
      if (typeof go === 'function') {
        go(e.detail.action);
      } else { 
        console.error("ain't no go fct");
      }
    }, false);

  },[setConfig,go,setHook]);


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
export {setHook as hook};
export default useConfig;

