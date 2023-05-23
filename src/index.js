import React from "react";
import "./polyfill";
import ReactDOM from "react-dom";
import { goStep, hook, setConfig, setGlobalState } from "./hooks/useConfig";
import "./lib/i18n";
import { isTest } from "./lib/urlparser";
import { scrollTo } from "./lib/scroll";

import ProcaAlert from "./components/Alert.js";
import Portals from "./components/Portals.js";
import ProcaWidget from "./components/Widget.js";

import { config as Config } from "./actionPage";

let config = {
  selector: ".proca-widget, #proca-form", // +, "[href='#proca_widget']"
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
      portals[i] = d.replaceAll("/", "_");
      return;
    }
    portals[i].component = d.component.replaceAll("/", "_");
  });
};

const Widget = (args) => {
  if (rendered) return;
  if (args) config = { ...config, ...args };
  config = { ...config, ...Config };
  config.actionPage = config.actionPage || config.actionpage;
  config.journey.forEach((d, i) => {
    if (typeof d !== "string") return;
    config.journey[i] = d.replaceAll("/", "_");
  });

  config.portal && initPortals(config.portal);

  let dom = document.querySelector(config.selector);
  let frag = document.createDocumentFragment();
  if (!dom) {
    dom = document.createElement("div");
    dom.id = "proca-widget";
    dom.className = "proca-widget";
    const script = document.getElementById("proca");
    if (document.body.contains(script)) {
      // dom.insertAdjacentElement("beforeBegin",script);
      script.parentNode.insertBefore(dom, script);
    } else {
      //
      alert(
        "proca script isn't in the body, but no object with 'proca-widget' class"
      );
      // document.body.appendChild(dom);
    }
  } else {
    Array.from(dom.childNodes).forEach((d) => {
      frag.appendChild(d);
    });
  }
  if (isTest()) config.test = isTest();

  // <ProcaWidget config={config} {...config} />,
  rendered = true;
  ReactDOM.render(
    <ProcaWidget {...config} container={frag}>
      {config.test && (
        <ProcaAlert title="TEST MODE" severity="warning">
          Experiment freely, this action will not be counted
        </ProcaAlert>
      )}
      <Portals portals={config.portal} dom={frag} />
    </ProcaWidget>,
    dom
  );
};

Widget.jump = (step) => {
  // if step is empty, jump to next
  ProcaWidget.action(step);
};

const go = (action) => {
  goStep(action);
  scrollTo({ delay: 300 });
};

const set = (atom, key, value) => {
  config[key] = value; // pointless?
  if ((atom && key && value) || (atom && typeof key === "object")) {
    return setGlobalState(atom, key, value);
  }
  setConfig(key, value);
};

const render = (script) => {
  try {
    if (!script) {
      script = {};
    } // return; I have no clue why it happens

    Widget({ ...script.dataset });
  } catch (e) {
    console.log(e);
  }
};

const autoRender = () => {
  if (document.currentScript) document.currentScript.id = "proca";
  if (window.proca) {
    console.log("Powered by proca.app", Config.actionpage, Config.filename);
  } else {
    console.log("proca", Config.actionpage, Config.filename);
  }
  const currentScript = document.currentScript;
  try {
    if (
      document.readyState === "loading"
      // !(document.readyState === "complete" || document.readyState === "loaded" || document.readyState === "interactive")
    ) {
      if (Config.component?.widget?.delay) {
        const delay = Config.component.widget.delay;
        document.addEventListener("DOMContentLoaded", () => {
          setTimeout(render, delay, currentScript);
        });
      } else {
        document.addEventListener("DOMContentLoaded", () =>
          render(currentScript)
        );
      }
    } else {
      console.log("loaded", currentScript);
      if (Config.component?.widget?.delay) {
        const delay = Config.component.widget.delay;
        setTimeout(render, delay, currentScript);
        return;
      }
      render(currentScript);
    }
  } catch (e) {
    console.log(e);
  }
};

autoRender();

const addEventListener = (type, listener) => {
  let el = document.getElementById("proca");
  if (!el) el = window;
  el.addEventListener(type, listener);
};

export {
  addEventListener,
  Alert,
  go,
  scrollTo,
  hook,
  React,
  ReactDOM,
  set,
  Widget,
};

//      <SignatureForm margin= "dense" variant= "filled" />
