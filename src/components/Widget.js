import React,{useState, useRef} from "react";
import ProcaStyle from "./ProcaStyle.js";
import useConfig from "../hooks/useConfig";
import {Slide} from '@material-ui/core';

/* warning, magic trick ahead: in the webpack config-overwrite, we set Conditional_XX either as the real component, or a dummy empty one if the step isn't part of the journey */

import Petition from "Conditional_Petition";
import Button from "Conditional_FAB";
import Share from "Conditional_Share";
import Twitter from "Conditional_Twitter";
import Dialog from "Conditional_Dialog";
import Clickify from "Conditional_Clickify";

// bespoke
import RegisterCH from "Conditional_bespoke/Register-CH";

const allSteps = {
  'petition': Petition,
  'button': Button,
  'share': Share,
  'twitter': Twitter,
  'clickify': Clickify,
  'dialog': Dialog,
  'register.CH': RegisterCH,
};

// handling case of components returning multiple Components/functions
if (!Dialog instanceof Function) {
  allSteps.dialog = Dialog.Open;
  allSteps.close = Dialog.Close;
}

let steps = {};

process.widget.journey.forEach( d => { 
  if (d instanceof Array) { // substep case
    d.forEach (e => steps[e] = allSteps [e])  
    return;
  }

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


const Widget = (props) => {
  const  [current,setCurrent] = useState(0);
  const journey=props.journey.flat();
  let depths = []; // one entry per action in the journey, 0 = top level, 1 = top level avec substeps, 2 = substeps
  let topMulti = useRef(); // latest Action level 0 rendered
  props.journey.forEach(d=> {
    if (d instanceof Array) {
      d.forEach( (e,i) => {depths.push(i > 0 ? 2:1)}); // the first of a multistep is on level 1 (eg dialog, sinon 2)
    } else depths.push(0);
  })

  if (props) config = { ...config, ...props };
  config.actionPage = parseInt(config.actionPage);

  const nextStep = () => {
    if (current < journey.length && depths[current+1] === 1) { // we jump 2 if start of a sub (dialog + 1st substep) {
      topMulti.current = journey[current+1];
      setCurrent(current+2);
      return;
    }
    if (current < journey.length) 
      setCurrent(current+1);
  }

  config.nextAction = nextStep;

//  console.log("render Widget ",journey[current]," at depth ",depths[current]);
//  console.log(Config);
  const d  = useConfig();

//const context = useContext(Config);
// todo: find a way to change the context
  if (depths[current] === 0) {
    let Action = steps[journey[current]];
    return (
      <ProcaStyle>

        <Action {...config} />
      </ProcaStyle>
    );
  }

  if (depths[current] > 0) {
    let SubAction = steps[journey[current]];
    let Action = steps[topMulti.current];

    return (
      <ProcaStyle>
        <Action {...config}><SubAction {...config} /></Action>
      </ProcaStyle>
    );
  } else {
    throw Error ("oops, it should be a sub step");
  }

}

Widget.getSteps = () => { 
  return allSteps;
}

Widget.jump = (step) => { // name of the step of true to skip to next action
}

export default Widget;
