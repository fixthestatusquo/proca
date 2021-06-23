import React from "react";
import ReactDOM from "react-dom";
import "./lib/i18n";
import { isTest } from "./lib/urlparser";
import { setGlobalState, setConfig, goStep, hook } from "./hooks/useConfig";

import ProcaWidget from "./components/Widget.js";
import Portals from "./components/Portals.js";
import ProcaAlert from "./components/Alert.js";

import { config as Config } from "./actionPage";
//console.log(querystring);

let config = {
  selector: ".proca-widget, #signature-form, #proca-form", //+, "[href='#proca_widget']"
};

let rendered = false;

const Alert = (text, severity) => {
  const selector = "proca_alert";
  if (!document.querySelector("#" + selector)) {
    let elem = document.createElement("div");
    elem.id = selector;
    document.body.appendChild(elem);
  }

  ReactDOM.render(
    <ProcaAlert text={text} severity={severity} />,
    document.querySelector("#" + selector)
  );
};

const initPortals = (portals) => {
  portals.forEach((d, i) => {
    if (typeof d === "string") {
      portals[i] = d.replace("/", "_");
      return;
    }
    portals[i].component = d.component.replace("/", "_");
  });
};

const Widget = (args) => {
  if (rendered) return;
  if (args) config = { ...config, ...args };
  config = { ...config, ...Config };
  config.actionPage = config.actionPage || config.actionpage;
  config.journey.forEach((d, i) => {
    if (typeof d !== "string") return;
    config.journey[i] = d.replace("/", "_");
  });

  config.portal && initPortals(config.portal);

  let dom = document.querySelector(config.selector);
  let frag = document.createDocumentFragment();
  if (!dom) {
    dom = document.createElement("div");
    dom.id = "proca-widget";
    config.selector = "#" + dom.id;
    document.body.appendChild(dom);
  } else {
    Array.from(dom.childNodes).forEach((d) => {
      frag.appendChild(d);
    });
  }
  if (isTest()) config.test = isTest();

  //<ProcaWidget config={config} {...config} />,
  rendered = true;
  ReactDOM.render(
    <ProcaWidget {...config} container={frag}>
      {isTest() && <ProcaAlert text="TEST MODE" severity="warning" />}
      <Portals portals={config.portal} dom={frag} />
    </ProcaWidget>,
    document.querySelector(config.selector)
  );
};

Widget.jump = (step) => {
  // if step is empty, jump to next
  ProcaWidget.action();
};

const go = (action) => {
  goStep(action);
};

const set = (atom, key, value) => {
  config[key] = value; // pointless?
  if ((atom && key && value) || (atom && typeof key === "object"))
    return setGlobalState(atom, key, value);
  setConfig(key, value);
};

const render = () => {
  try {
    var script = document.getElementById("proca");
    if (!script) {
      script = {};
    } //return; I have no clue why it happens

    //we take the data from the url
    // initDataState(data());
    Widget({ ...script.dataset });
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
      document.readyState === "loading"
      //!(document.readyState === "complete" || document.readyState === "loaded" || document.readyState === "interactive")
    ) {
      document.addEventListener("DOMContentLoaded", render);
    } else {
      render();
    }
  } catch (e) {
    console.log(e);
  }
};

autoRender();
export { Widget, Alert, set, go, hook, React, ReactDOM };

//      <SignatureForm margin= "dense" variant= "filled" />
