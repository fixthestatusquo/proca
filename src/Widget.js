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


const Button = (arg) => {
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
        ReactDOM.render(<SignatureForm margin="dense" variant ="filled" />);
};

export {config,Button,Form};

//      <SignatureForm margin= "dense" variant= "filled" />
