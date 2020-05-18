import React,{useState} from "react";
import ProcaStyle from "./ProcaStyle.js";
//import ReactDOM from "react-dom";
//import "./lib/i18n";
import Petition from "Conditional_SignatureForm";
import Button from "Conditional_FAB";
import Share from "Conditional_Share";

let steps = {};

// these are compile time directives
if (process.widget.include_petition) {
  steps['petition'] = Petition;
}
if (process.widget.include_button) {
  steps['button'] = Button;
}
if (process.widget.include_share) {
  steps['share'] = Share;
}


let config = {
  data: {},
  margin: "dense",
  variant: "filled",
  selector: "#signature-form"
};

export default function Render (props) {
  let journey=props.journey.split(",");
  const  [current,setCurrent] = useState(journey.shift());
  if (props) config = { ...config, ...props };
/*  if (!document.querySelector(config.selector)) {
    let elem = document.createElement("div");
    elem.id = "proca-form";
    config.selector = "#" + elem.id;
    document.body.appendChild(elem);
  }
*/
  
  config.nextAction = function() {
    if (journey.length === 0) {
      console.log ("a journey always has a last step");
      return;
    }
    setCurrent(journey.shift());
  };

  let Action = steps[current];
  return (
      <ProcaStyle>
        <Action {...config} />
      </ProcaStyle>
  );
}
