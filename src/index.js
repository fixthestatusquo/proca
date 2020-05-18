import React from "react";
import ReactDOM from "react-dom";
import "./lib/i18n";

import ProcaWidget from "./components/Widget.js";

//const querystring = require("querystring");

//console.log(querystring);

let config = {
  data: {},
  margin: "dense",
  variant: "filled",
  selector: "#signature-form"
};

const Widget = args => {
  if (args) config = { ...config, ...args };
  //compile directives
  if (process.widget.journey)
    config.journey=process.widget.journey;
  if (process.widget.lang)
    config.lang=process.widget.lang;
  if (process.widget.organisation)
    config.lang=process.widget.organisation;
  if (process.widget.actionPage)
    config.lang=process.widget.actionPage;

  if (!document.querySelector(config.selector)) {
    let elem = document.createElement("div");
    elem.id = "proca-form";
    config.selector = "#" + elem.id;
    document.body.appendChild(elem);
  }
  
  ReactDOM.render(
    <ProcaWidget {...config} />,
    document.querySelector(config.selector)
  );
}

const render = () => {
  try {
    var script = document.getElementById("proca");
    if (!script) return;

    Widget();

//    var mode = script.getAttribute("data-mode");
//    var actionPage = script.getAttribute("data-page");
  } catch (e) {
    console.log(e);
  }
};

const autoRender = () => {
  if (window.proca) {
    console.log("trying to load proca multiple times");
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

export { Widget};

//      <SignatureForm margin= "dense" variant= "filled" />
