import React from "react";
import ReactDOM from "react-dom";
import "./lib/i18n";

import ProcaWidget from "./components/Widget.js";
import ProcaAlert from "./components/Alert.js";

//const querystring = require("querystring");

//console.log(querystring);

let config = {
  data: {},
  margin: "dense",
  variant: "filled",
  selector: "#signature-form"
};

let context= null;

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

const Widget = args => {
  if (args) config = { ...config, ...args };
  //compile directives, you can't use process.widget[step]
  if (process.widget.journey)
    config.journey=process.widget.journey;
  if (process.widget.lang)
    config.lang=process.widget.lang;
  config.organisation=process.widget.organisation || "missing organisation name";
  if (process.widget.twitter_targets)
    config.targets={twitter_url:process.widget.twitter_targets};
  if (process.widget.actionpage)
    config.actionPage=process.widget.actionpage;

  context=React.createContext(config);
  if (!document.querySelector(config.selector)) {
    let elem = document.createElement("div");
    elem.id = "proca-form";
    config.selector = "#" + elem.id;
    document.body.appendChild(elem);
  }
 
  ReactDOM.render(
    <ProcaWidget {...config} context={context} />,
    document.querySelector(config.selector)
  );
}

Widget.jump = (step) => { // if step is empty, jump to next
  console.log(config.selector);
  ProcaWidget.action();
}

const render = () => {
  try {
    var script = document.getElementById("proca");
    if (!script) return;

//todo: blacklist some param?
    Widget({...script.dataset});

//    var mode = script.getAttribute("data-mode");
//    var actionPage = script.getAttribute("data-page");
  } catch (e) {
    console.log(e);
  }
};

const autoRender = () => {
  if (window.proca) {
    console.log("rendering proca");
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

export { Widget, Alert, context, React, ReactDOM};

//      <SignatureForm margin= "dense" variant= "filled" />
