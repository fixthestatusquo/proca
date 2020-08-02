import React,{useState, useRef, useCallback} from "react";
import ProcaStyle from "./ProcaStyle.js";
import {ConfigProvider} from  "../hooks/useConfig";
import Url from "../lib/urlparser.js";
import {getAllData} from "../lib/domparser";

/* warning, magic trick ahead: in the webpack config-overwrite, we set Conditional_XX either as the real component, or a dummy empty one if the step isn't part of the journey */

import Loader from "./Loader";
import Petition from "Conditional_Petition";
import Button from "Conditional_FAB";
import Share from "Conditional_Share";
import Twitter from "Conditional_Twitter";
import Dialog from "Conditional_Dialog";
import Clickify from "Conditional_Clickify";
import Html from "Conditional_Html";

// bespoke
import RegisterCH from "Conditional_bespoke/Register-CH";
import Download from "Conditional_bespoke/Download";


// import Slide from '@material-ui/core/Slide'; do the sliding transition thing

const allSteps = {
  'loader': Loader,
  'petition': Petition,
  'button': Button,
  'share': Share,
  'twitter': Twitter,
  'clickify': Clickify,
  'html': Html,
  'dialog': Dialog,
  'register.CH': RegisterCH,
  'download': Download,
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

let config = {
  data: Url.data(),
  utm: Url.utm(),
  hook: {},
  param: {},
  margin: "dense",
  variant: "filled",
  selector: "#signature-form"
};

const Widget = (props) => {
  const  [current,setCurrent] = useState(0);
  const [, updateState] = React.useState();
  const forceUpdate = useCallback(() => updateState({}), []);
  let depths = []; // one entry per action in the journey, 0 = top level, 1 = top level avec substeps, 2 = substeps
  let topMulti = useRef(); // latest Action level 0 rendered
  const journey=props.journey.flat();

  if (current === false) { 
    setCurrent(0);
    return;
  }

  if (props.loader) {
    config.loader = props.loader;
    journey.unshift("loader");
    steps["loader"] = Loader;
    depths.push(0);
  }


  props.journey.forEach(d=> {
    if (d instanceof Array) {
      d.forEach( (e,i) => {depths.push(i > 0 ? 2:1)}); // the first of a multistep is on level 1 (eg dialog, sinon 2)
    } else depths.push(0);
  })
  if (props) config = { ...config, ...props };
  config.param = getAllData(config.selector);
  config.actionPage = parseInt(config.actionPage,10);

  const getActions =() => {
    return steps;
  }

  const go = (action) => {
    let i=null;
    if ((typeof action === "number") && (action <= journey.length)) {
      i = action -1;
      if (i === current) return forceUpdate(); //trick to force refresh
    } else {
      if (!action) return nextStep();
      i = journey.indexOf(action);
    }
    if (i === -1) {
      console.error("can't find '",action, "'. options: ",journey);
      global.proca.Alert("not possible to go to '"+action+"'","error");
      return;
    }

    if (depths[i] === 1) { // we jump 2 if start of a sub (dialog + 1st substep) {
      topMulti.current = journey[i];
      setCurrent(i+1);
      return;
    }
    setCurrent(i);

  };

  // called once an action has finished to decide what to do next. 
  // the result is whatever the action that has finished wants to share to the journey
  //
  const nextStep = (result) => {
    // nextStep checks if there is a bespoke action to run after the current step (created by calling proca.after)
    //console.log(config.hook);
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
    if (!Action) {
      console.log(current,journey,steps,steps[journey[current]]);
      return "FATAL Error, check the log";
    }
    return (
      <ConfigProvider go={go} actions={getActions} config={config}>
      <ProcaStyle>
        <Action actionPage={config.actionPage} done={nextStep}/>
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
