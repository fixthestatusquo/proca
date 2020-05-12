import React from "react";
import ReactDOM from "react-dom";
import "./lib/i18n";

import SignatureForm from "./SignatureForm";
import FABAction from "./FAB.js";
import ShareAction from "./Share.js";
import ProcaStyle from "./components/ProcaStyle.js";

//const querystring = require("querystring");

//console.log(querystring);

let config = {
  data: {},
  margin: "dense",
  variant: "filled",
  selector: "#signature-form"
};

const Share = args => {
  if (args) config = { ...config, ...args };
  if (!document.querySelector(config.selector)) {
    let elem = document.createElement("div");
    elem.id = "signature-form";
    config.selector = "#" + elem.id;
    document.body.appendChild(elem);
  }
  ReactDOM.render(
    <ProcaStyle>
      <ShareAction {...config} />
    </ProcaStyle>,
    document.querySelector(config.selector)
  );
};

const Button = args => {
  if (args) config = { ...config, ...args };
  if (!document.querySelector(config.selector)) {
    let elem = document.createElement("div");
    elem.id = "proca-button";
    config.selector = "#" + elem.id;
    document.body.appendChild(elem);
  }
  ReactDOM.render(
    <ProcaStyle>
      <FABAction {...config} />
    </ProcaStyle>,
    document.querySelector(config.selector)
  );
};

const Dialog = args => {
  //TODO: use and document
  if (args) config = { ...config, ...args };
  if (!document.querySelector(config.selector)) {
    let elem = document.createElement("div");
    elem.id = "signature-buttonaaa";
    config.selector = "#" + elem.id;
    document.body.appendChild(elem);
  }
  config.dialog = true;
  ReactDOM.render(
    <ProcaStyle>
      <FABAction {...config} />
    </ProcaStyle>,
    document.querySelector(config.selector)
  );
};

const Form = args => {
  if (args) config = { ...config, ...args };
  if (!document.querySelector(config.selector)) {
    let elem = document.createElement("div");
    elem.id = "proca-form";
    config.selector = "#" + elem.id;
    document.body.appendChild(elem);
  }

  config.nextAction = function() {

    ReactDOM.render(
      <ProcaStyle>
        <ShareAction {...config} />
      </ProcaStyle>,
      document.querySelector(config.selector)
    );
  };

  ReactDOM.render(
    <ProcaStyle>
      <SignatureForm {...config} />
    </ProcaStyle>,
    document.querySelector(config.selector)
  );
};

const render = () => {
  try {
    var script = document.getElementById("proca");
    if (!script) return;
    var mode = script.getAttribute("data-mode");
    var actionPage = script.getAttribute("data-page");
    if (mode === "form") {
      Form({actionPage:actionPage});
    } else {
      Button({actionPage:actionPage});
    }
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

export { config, Button, Form, Dialog, Share };

//      <SignatureForm margin= "dense" variant= "filled" />
