import React,{useState} from "react";
import ProcaStyle from "./ProcaStyle.js";

/* warning, magic trick ahead: in the webpack config-overwrite, we set Conditional_XX either as the real component, or a dummy empty one if the step isn't part of the journey */

import Petition from "Conditional_Petition";
import Button from "Conditional_FAB";
import Share from "Conditional_Share";
import Twitter from "Conditional_Twitter";
import Dialog from "Conditional_Dialog";

// bespoke
import RegisterCH from "Conditional_bespoke/Register-CH";

const allSteps = {
  'petition': Petition,
  'button': Button,
  'share': Share,
  'twitter': Twitter,
  'dialog': Dialog,
  'register.CH': RegisterCH,
};

// handling case of components returning multiple Components/functions
if (!Dialog instanceof Function) {
  allSteps.dialog = Dialog.Open;
  allSteps.close = Dialog.Close;
}

let steps = {};

console.log(process.widget.journey);
process.widget.journey.split(",").forEach( d => { 
  console.log("step:",d);
  steps[d] = allSteps[d];
});

/*
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

if (process.widget.include_twitter) {
  steps['twitter'] = Twitter;
}
*/

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
  config.actionPage = parseInt(config.actionPage);
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
