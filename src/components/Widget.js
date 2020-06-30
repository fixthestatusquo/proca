import React,{useState, useRef} from "react";
import ProcaStyle from "./ProcaStyle.js";
import {ConfigProvider} from  "../hooks/useConfig";
import Url from "../lib/urlparser.js";

/* warning, magic trick ahead: in the webpack config-overwrite, we set Conditional_XX either as the real component, or a dummy empty one if the step isn't part of the journey */

import Petition from "Conditional_Petition";
import Button from "Conditional_FAB";
import Share from "Conditional_Share";
import Twitter from "Conditional_Twitter";
import Dialog from "Conditional_Dialog";
import Clickify from "Conditional_Clickify";
import Html from "Conditional_Html";

// bespoke
import RegisterCH from "Conditional_bespoke/Register-CH";

// import Slide from '@material-ui/core/Slide'; do the sliding transition thing

const allSteps = {
  'petition': Petition,
  'button': Button,
  'share': Share,
  'twitter': Twitter,
  'clickify': Clickify,
  'html': Html,
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
    d.forEach ( e => steps[e] = allSteps[e])  
    return;
  }

  steps[d] = allSteps[d];
});

const setAfter = (action, after) => {
  if (!typeof(after) === 'function') {
    return console.error("after must me a function");
  }
  steps[action].after=after;
}

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
  data: Url.data(),
  utm: Url.utm(),
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

  const getActions =() => {
    return steps;
  }

  const go = (action) => {
    if (!action) return nextStep();
    const i = journey.indexOf(action);
    if (i === -1) {
      console.error("can't find '",action, "'. options: ",journey);
      global.proca.Alert("not possible to go to '"+action+"'","error");
      return;
    }
    setCurrent(i);

  };

  // called once an action has finished to decide what to do next. 
  // the result is whatever the action that has finished wants to share to the journey
  //
  const nextStep = (result) => {
    // nextStep checks if there is a bespoke action to run after the current step (created by calling proca.after)
    if (typeof steps[journey[current]].after ==="function") {
      if (steps[journey[current]].after(result) === false){
        console.log("the custom 'after' returned false, we do not go to the next step");
        return;
      }
    }

    if (current < journey.length && depths[current+1] === 1) { // we jump 2 if start of a sub (dialog + 1st substep) {
      topMulti.current = journey[current+1];
      setCurrent(current+2);
      return;
    }
    if (current < (journey.length -1) ) {
      setCurrent(current+1);
    } else {
      console.error("end of the journey, no more steps");
      setCurrent(0);
    }
  }

  if (depths[current] === 0) {
    let Action = steps[journey[current]];
    return (
      <ConfigProvider go={go} setAfter={setAfter} actions={getActions} config={config}>
      <ProcaStyle>
        <Action {...config} done={nextStep}/>
      </ProcaStyle>
      </ConfigProvider>
    );
  }

  if (depths[current] > 0) {
    let SubAction = steps[journey[current]];
    let Action = steps[topMulti.current];

    return (
      <ConfigProvider go={go} actions={getActions} config={config}>
      <ProcaStyle>
      <Action {...config} done={nextStep}><SubAction {...config} done={nextStep}/></Action>
      </ProcaStyle>
      </ConfigProvider>
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
