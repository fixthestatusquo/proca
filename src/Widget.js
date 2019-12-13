import React from "react";
import ReactDOM from 'react-dom';
import SignatureForm from "./SignatureForm";
import FABAction from "./FAB.js";
const querystring = require("querystring");

let  config= {
    margin: "dense",
    variant: "filled",
    selector:"#signature-form",
  };


const Button = (args) => {
  if (args)
    config = {...config, ...args};
        if (!document.querySelector(config.selector)) {
          let elem = document.createElement("div");
          elem.id="signature-button";
          config.selector="#"+elem.id;
          document.body.appendChild(elem);
        }
        ReactDOM.render(<FABAction />,document.querySelector(config.selector));
      }
;

const Form = (args) => {
  if (args)
    config = {...config, ...args};
        if (!document.querySelector(config.selector)) {
          let elem = document.createElement("div");
          elem.id="signature-form";
          config.selector="#"+elem.id;
          document.body.appendChild(elem);
        }
  ReactDOM.render(<SignatureForm margin={config.margin} variant ={config.variant} />,document.querySelector(config.selector));
};

export {config,Button,Form};

//      <SignatureForm margin= "dense" variant= "filled" />
