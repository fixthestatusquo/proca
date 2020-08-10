import React from "react";
import ReactDOM from "react-dom";
import "./lib/i18n";
import {setGlobalState, setConfig,goStep,hook} from "./hooks/useConfig";

import ProcaWidget from "./components/Widget.js";
import ProcaAlert from "./components/Alert.js";

import Config from "Config"; // src/tmp.config/{actionpage}.json
import {initDataState} from './hooks/useData';
//console.log(querystring);

let config = {
  selector: "#signature-form"
};

const Alert = (text,severity) => {
  const selector = "proca_alert";
  if (!document.querySelector('#'+selector)) {
    let elem = document.createElement("div");
    elem.id = selector;
    document.body.appendChild(elem);
  }

  ReactDOM.render(
    <ProcaAlert text={text} severity={severity}/>,
    document.querySelector('#'+selector)
  );
}

const getYAMLConfig = () => { // legacy mode, taking the config from config/{widget}.yaml
  if (process.widget.journey)
    config.journey=process.widget.journey;
  if (process.widget.lang)
    config.lang=process.widget.lang;
  config.organisation=process.widget.organisation || "missing organisation name";
  if (process.widget.twitter_targets)
    config.targets={twitter_url:process.widget.twitter_targets};
  if (process.widget.actionpage)
    config.actionPage=process.widget.actionpage;
  if (process.widget.actionurl)
    config.actionUrl=process.widget.actionurl;
  if (process.widget.privacy_url)
    config.privacyUrl=process.widget.privacy_url;
}

const Widget = args => {
  if (args) config = { ...config, ...args };
  //compile directives, you can't use process.widget[step]
  if (!Config) // no config in src/config/{actionID}
    getYAMLConfig();
  else 
    config = { ...config, ...Config};

  document.querySelectorAll('.proca').forEach( (dom)=> dom.style.display="none");

  if (!document.querySelector(config.selector)) {
    let elem = document.createElement("div");
    elem.id = "proca-widget";
    config.selector = "#" + elem.id;
    document.body.appendChild(elem);
  }

    //<ProcaWidget config={config} {...config} />,
  ReactDOM.render(
    <ProcaWidget {...config} />,
    document.querySelector(config.selector)
  );
}

Widget.jump = (step) => { // if step is empty, jump to next
  ProcaWidget.action();
}

const go = (action) => {
  goStep(action);
};

const set = (atom, key, value) => {
  config[key] = value; // pointless?
  if ((atom && key && value) || ( atom && typeof key ==='object'))
    return setGlobalState (atom,key,value);
  setConfig (key,value);
};

const render = () => {
  try {
    var script = document.getElementById("proca");
    if (!script) return;

//todo: blacklist some param?
    initDataState(script.dataset);
    Widget({...script.dataset});

  } catch (e) {
    console.log(e);
  }
};

const autoRender = () => {
  if (window.proca) {
    console.log("Powered by proca.foundation");
  }
  try {
    if (
      !(document.readyState === "complete" || document.readyState === "loaded")
    )
      document.addEventListener("DOMContentLoaded", render);
    else {
      render();
    }
  } catch (e) {
    console.log(e);
  }
};

autoRender();
export { Widget, Alert, set, go, hook, React, ReactDOM};

//      <SignatureForm margin= "dense" variant= "filled" />
