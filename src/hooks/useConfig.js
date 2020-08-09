// we have migrated from a single Config context to recoil and multiple atoms.
// technically, we are migrating, but more or less done

import React,{useContext,useState,useEffect, useCallback} from 'react';
import {
  atom,
  useSetRecoilState,
  useRecoilValue
} from 'recoil';

export const layoutState = atom({
  key: 'layout', // unique ID (with respect to other atoms/selectors)
  default: {
    variant:"filled", // options filled, outlined, standard
    margin:"dense",
    primaryColor: '#1976d2',
    secondaryColor: '#dc004e',
    paletteType:'light',
    backgroundColor:'tranparent',
  } // default value (aka initial value)
});

export let configState = null;
/*
export const configState = atom({
  key:'campaign',
  default:{
    actionPage:null,
    name:null,
    organisation:null,
    lang:null,
    journey: [],
  } // check the json config attribute in the actionpage for example of more advanced format
});
*/

export const initConfigState = (config) => {
  if (configState) return false;
  configState = atom({
    key:'campaign',
    default: config
  });
  return true;
}

export let Config=React.createContext();

const id='proca-listener';

export const setGlobalState = (atom, key,value)=> {
  const event = new CustomEvent('proca-set', {detail: { atom: atom, key: key, value:value }});

  document
    .getElementById(id)
    .dispatchEvent(event);
};

const set = (key,value)=> { // obsolete, will soon be removed
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
  const _setLayout = useSetRecoilState(layoutState);
  const _setCampaignConfig = useSetRecoilState(configState);
  

  const go = props.go;

  const setConfig = useCallback((k,v) => {
    let d = {...config}
    let keys=k.split(".");
    switch (keys.length) {
      case 1: d[k]=v;break;
      case 2: d[keys[0]] ? d[keys[0]][keys[1]]=v: console.log("invalid key",k);break;
      case 3: d[keys[0]] ? d[keys[0]][[keys[1][keys[1]]]]=v: console.log("invalid key",k);break;
      default:
        console.log("invalid key",k);
    };
    _setConfig(d);
  }, [config]);
  
  const setHook = useCallback ((object,action,hook) => {
    let hooks = config.hook;
    hooks[object+":"+action] = hook;
    console.log(hooks,object,action);
    setConfig("hook",hooks);
    console.log(config);
  },[config,setConfig]);

  const setLayout = useCallback((key, value) => {
     _setLayout((oldLayout)=>{
       let d = {...oldLayout};
       console.log(d);
       d[key]=value;
       return d;
     });
  },[_setLayout]);

  const setCampaignConfig = useCallback((key, value) => {

    if (typeof key === 'object') {
      _setCampaignConfig(current => {
        console.log(current);
        return {...current, ...key}
      });
      return;
    }
     _setCampaignConfig(current =>{
       let d = {...current};
       d[key]=value;
       return d;
     });
  },[_setCampaignConfig]);


  useEffect(() => {
    const elem = document.getElementById(id);
    elem.addEventListener('proca-set',  (e) => {
      switch (e.detail.atom) {
        case "layout": setLayout(e.detail.key,e.detail.value); break;
        case "campaign": setCampaignConfig(e.detail.key,e.detail.value); break;
        default:
          setConfig(e.detail.key,e.detail.value);
      }
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

  },[setConfig,go,setHook,setLayout,setCampaignConfig]);


  //setCampaignConfig(config); 
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

export const useLayout = () => useRecoilValue(layoutState);
export const useCampaignConfig = () => useRecoilValue(configState);
export const useSetCampaignConfig = () => useSetRecoilState(configState);  
export {set as setConfig};
export {goStep};
export {setHook as hook};
export default useConfig;

