import React, { useState, useRef, useCallback,useEffect } from "react";
import ProcaRoot from './ProcaRoot';
import { initConfigState} from "../hooks/useConfig";
import Url from "../lib/urlparser.js";
import { getAllData } from "../lib/domparser";

//import { useTheme } from "@material-ui/core/styles";
import { useMediaQuery } from "@material-ui/core";
import {initDataState} from '../hooks/useData';

/* warning, magic trick ahead: in the webpack config-overwrite, we set Conditional_XX either as the real component, or a dummy empty one if the step isn't part of the journey */

import Loader from "./Loader";
import Petition from "Conditional_Petition";
//import Button from "Conditional_FAB";
import Button from "./FAB";
import Share from "Conditional_Share";
import Twitter from "Conditional_Twitter";
import Ep from "Conditional_Ep";
//import Dialog from "Conditional_Dialog";
import Dialog from "./Dialog";
import Clickify from "Conditional_Clickify";
import Html from "Conditional_Html";
import DonateAmount from "Conditional_DonateAmount";
import DonateStripe from "Conditional_DonateStripe";

// bespoke
import RegisterCH from "Conditional_bespoke/Register-CH";
import Download from "Conditional_bespoke/Download";

// import Slide from '@material-ui/core/Slide'; do the sliding transition thing

const allSteps = {
  loader: Loader,
  petition: Petition,
  button: Button,
  share: Share,
  twitter: Twitter,
  Ep: Ep,
  clickify: Clickify,
  html: Html,
  dialog: Dialog,
  DonateAmount: DonateAmount,
  DonateStripe: DonateStripe,
  "register.CH": RegisterCH,
  download: Download
};

// handling case of components returning multiple Components/functions
if (!Dialog instanceof Function) {
  allSteps.dialog = Dialog.Open;
  allSteps.close = Dialog.Close;
}

let steps = {};

process.widget.journey.forEach(d => {
  if (d instanceof Array) {
    // substep case
    d.forEach(e => (steps[e] = allSteps[e]));
    return;
  }

  steps[d] = allSteps[d];
});

let config = {
  data: Url.data(),
  utm: Url.utm(),
  hook: {},
  param: {},
};

const Widget = props => {
  const [current, setCurrent] = useState(0);
  const [, updateState] = React.useState();
  const forceUpdate = useCallback(() => updateState({}), []);
  let Action = null;
  //  const theme = useTheme();
  //  const isMobile = useMediaQuery(theme.breakpoints.down("sm"),{noSsr:true});
  const isMobile = useMediaQuery("(max-width:768px)", { noSsr: true });
  let depths = []; // one entry per action in the journey, 0 = top level, 1 = top level avec substeps, 2 = substeps
  let topMulti = useRef(); // latest Action level 0 rendered
  let propsJourney = Object.assign([], props.journey);

  initDataState(Url.data());
  useEffect(()=>{
    /*global procaReady*/
    /*eslint no-undef: "error"*/
    if (typeof procaReady === "function") {
      procaReady({});
    }
  },[props]);

  if (isMobile && props.journey[0] !== "clickify") {
    let j = Object.assign([], props.journey);
    if (j[0] !== "dialog") j.unshift("dialog");
    propsJourney = ["button", j];
    steps["button"] = allSteps["button"];
    steps["dialog"] = allSteps["dialog"];
  }
  let journey = propsJourney.flat();
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

  propsJourney.forEach(d => {
    if (d instanceof Array) {
      d.forEach((e, i) => {
        depths.push(i > 0 ? 2 : 1);
      }); // the first of a multistep is on level 1 (eg dialog, sinon 2)
    } else depths.push(0);
  });

  initConfigState(props);
  if (props) config = { ...config, ...props };
  config.param = getAllData(config.selector);
  config.actionPage = parseInt(config.actionPage, 10);
  

  const getActions = () => {
    return steps;
  };

  const go = action => {
    let i = null;
    if (typeof action === "number" && action <= journey.length) {
      i = action - 1;
      if (i === current) return forceUpdate(); //trick to force refresh
    } else {
      if (!action) return nextStep();
      i = journey.indexOf(action);
    }
    if (i === -1) {
      console.error("can't find '", action, "'. options: ", journey);
      global.proca.Alert("not possible to go to '" + action + "'", "error");
      return;
    }

    if (depths[i] === 1) {
      // we jump 2 if start of a sub (dialog + 1st substep) {
      topMulti.current = journey[i];
      setCurrent(i + 1);
      return;
    }
    setCurrent(i);
  };

  const nextTopStep = () => {
    const next = depths.findIndex((d, i) => {
      return i > current && d === 0;
    });
    if (next === -1) return setCurrent(0);

    setCurrent(next);
  };

  // called once an action has finished to decide what to do next.
  // the result is whatever the action that has finished wants to share to the journey
  //
  const nextStep = result => {
    // nextStep checks if there is a bespoke action to run after the current step (created by calling proca.after)
    //console.log(config.hook);
    if (typeof steps[journey[current]].after === "function") {
      if (steps[journey[current]].after(result) === false) {
        console.log(
          "the custom 'after' returned false, we do not go to the next step"
        );
        return;
      }
    }

    if (current < journey.length && depths[current + 1] === 1) {
      // we jump 2 if start of a sub (dialog + 1st substep) {
      topMulti.current = journey[current + 1];
      setCurrent(current + 2);
      return;
    }
    if (current < journey.length - 1) {
      setCurrent(current + 1);
    } else {
      console.error("end of the journey, no more steps");
      setCurrent(0);
    }
  };

  if (current >= journey.length) {
    console.log("journey went off track, reset to the first step");
    setCurrent(0); // might happen if the journey is dynamically modified, eg FAB on isMobile-> return to wide screen
    return;
  }

  switch (depths[current]) {
    case 0:
      Action = steps[journey[current]];
      if (!Action) {
        console.log(current, journey, steps, steps[journey[current]]);
        return "FATAL Error, check the log";
      }
      return (
        <ProcaRoot go={go} actions={getActions} config={config}>
            <Action actionPage={config.actionPage} done={nextStep} />
        </ProcaRoot>
      );//break;
    case 1:
    case 2:
      let SubAction = steps[journey[current]];
      Action = steps[topMulti.current];
      return (
        <ProcaRoot go={go} actions={getActions} config={config}>
            <Action actionPage={config.actionPage} done={nextTopStep}>
              <SubAction actionPage={config.actionPage} done={nextStep} />
            </Action>
        </ProcaRoot>
      );//break;
    default:
      throw Error("Oops, it should be a sub step");
  }
};

Widget.getSteps = () => {
  return allSteps;
};

Widget.jump = step => {
  // name of the step of true to skip to next action
};

export default Widget;
