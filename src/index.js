import React from "react";
import ReactDOM from "react-dom";
import "./lib/i18n";
import { isTest } from "./lib/urlparser";
import { setGlobalState, setConfig, goStep, hook } from "./hooks/useConfig";

import ProcaWidget from "./components/Widget.js";
import Portals from "./components/Portals.js";
import ProcaAlert from "./components/Alert.js";

import { config as Config } from "./actionPage";
import { initDataState } from "./hooks/useData";
//console.log(querystring);

let config = {
  selector: ".proca-widget, #signature-form, #proca-form", //+, "[href='#proca_widget']"
};

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
  if (args) config = { ...config, ...args };
  config = { ...config, ...Config };

  config.actionPage = config.actionPage || config.actionpage;
  config.journey.forEach((d, i) => {
    if (typeof d !== "string") return;
    config.journey[i] = d.replace("/", "_");
  });

  config.portal && initPortals(config.portal);

  if (!document.querySelector(config.selector)) {
    let elem = document.createElement("div");
    elem.id = "proca-widget";
    config.selector = "#" + elem.id;
    document.body.appendChild(elem);
  }
  if (isTest()) config.test = isTest();

  //<ProcaWidget config={config} {...config} />,
  ReactDOM.render(
    <ProcaWidget {...config}>
      {isTest() && <ProcaAlert text="TEST MODE" severity="warning" />}
      <Portals portals={config.portal} />
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
    if (!script) return;

    //todo: blacklist some param?

    initDataState(script.dataset);
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
export { Widget, Alert, set, go, hook, React, ReactDOM };

//      <SignatureForm margin= "dense" variant= "filled" />
