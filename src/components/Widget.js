import React, { useState, useRef, useCallback, useEffect } from "react";
import ProcaRoot from "./ProcaRoot";
import { initConfigState } from "../hooks/useConfig";
import Url, { step as paramStep } from "../lib/urlparser.js";
import { getAllData, getOverwriteLocales } from "../lib/domparser";

//import { useTheme } from "@material-ui/core/styles";
import { useIsMobile } from "../hooks/useLayout";

import { initDataState } from "../hooks/useData";

import Loader from "./Loader";
// warning, magic trick ahead: in the webpack config-overwrite, we set ComponentLoader as src/tmp.config/{id}.load.js
import { steps } from "../actionPage";
import Button from "./FAB";
import Dialog from "./Dialog";
import Alert from "./Alert";
import TwoColumns from "./TwoColumns";

let config = {
  data: Url.data(),
  utm: Url.utm(),
  hook: {},
  param: {},
  component: {},
  locale: {},
};

const Widget = (props) => {
  const [current, setCurrent] = useState(null);
  const [, updateState] = React.useState();
  const forceUpdate = useCallback(() => updateState({}), []);

  //  const theme = useTheme();
  //  const isMobile = useMediaQuery(theme.breakpoints.down("sm"),{noSsr:true});
  let depths = []; // one entry per action in the journey, 0 = top level, 1 = top level avec substeps, 2 = substeps
  let topMulti = useRef(0); // latest Action level 0 rendered
  let propsJourney = Object.assign([], props.journey);
  let isMobile = useIsMobile();


  var data = Url.data();
  document.querySelectorAll(props.selector).forEach((dom) => {
    data = { ...dom.dataset, ...data };
  });
  initDataState(data);
  useEffect(() => {
    /*global procaReady*/
    /*eslint no-undef: "error"*/
    if (typeof procaReady === "function") {
      procaReady({}); // NOTE: should we pass config to procaReady?
    }
  }, [props]);

  if (props) config = { ...config, ...props };
  config.param = getAllData(config.selector);
  config.locales = Object.assign(config.locales, getOverwriteLocales());
  config.actionPage = parseInt(config.actionPage, 10);
  initConfigState(config);
  if (config.component.widget?.mobileVersion === false) isMobile = false;

  if (
    isMobile &&
    props.journey[0] !== "clickify" &&
    props.journey[0] !== "button"
  ) {
    let j = Object.assign([], props.journey);
    if (j[0] !== "dialog") j.unshift("dialog");
    propsJourney = ["button", j];
    steps["button"] = Button;
    steps["dialog"] = Dialog;
    topMulti = Dialog;
    //    steps["button"] = allSteps["button"];
    //    steps["dialog"] = allSteps["dialog"];
  }
  let journey = propsJourney.reduce((acc, val) => acc.concat(val), []); // fubar edge propsJourney.flat();
  if (current === false) {
    // obsolete?
    setCurrent(0);
    return;
  }

  if (props.loader) {
    //obsolete, to be removed
    config.loader = props.loader;
    journey.unshift("loader");
    steps["loader"] = Loader;
    depths.push(0);
  }

  propsJourney.forEach((d) => {
    if (d instanceof Array) {
      d.forEach((e, i) => {
        depths.push(i > 0 ? 2 : 1);
      }); // the first of a multistep is on level 1 (eg dialog, sinon 2)
    } else depths.push(0);
  });

  const getActions = () => {
    return steps;
  };

  const go = (action) => {
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

    if (next === -1) {
      if (config.component.widget?.autoStart === false) return setCurrent(null);

      return setCurrent(0);
    }

    setCurrent(next);
  };

  // called once an action has finished to decide what to do next.
  // the result is whatever the action that has finished wants to share to the journey
  //
  const nextStep = (result) => {
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
      /*global procaJourneyCompleted*/
      /*eslint no-undef: "error"*/
      if (typeof procaJourneyCompleted === "function") {
        procaJourneyCompleted({}); // NOTE: should we pass config to procaReady?
      }
      // TODO: what's a nicer thing to do at the end - jumping back is likely to
      // make users think their submission didn't work.
      console.error("end of the journey, no more steps");
      setCurrent(0);
    }
  };

  const CurrentAction = (props) => {
    let Action = null;

    switch (depths[current]) {
      case 0:
        Action = steps[journey[current]];
        if (!Action) {
          console.log(current, journey, steps, steps[journey[current]]);
          return (
            <>
              <Alert severity="error">Configuration problem</Alert>
              <div>FATAL Error, check the log</div>
            </>
          );
        }
        return (
          <>
            <Action actionPage={config.actionPage} done={nextStep} />
            {props.children}
          </>
        ); //break;
      case 1:
      case 2:
        let SubAction = steps[journey[current]];
        Action = steps[topMulti.current];
        if (!Action || !SubAction) {
          return (
            <Alert severity="error">
              can't find Action {topMulti.current} or SubAction{" "}
              {journey[current]}
            </Alert>
          );
        }
        return (
          <>
            <Action
              actionPage={config.actionPage}
              done={nextTopStep}
              dialog={true}
            >
              <SubAction actionPage={config.actionPage} done={nextStep} />
            </Action>
            {props.children}
          </>
        ); //break;
      default:
        throw Error("Oops, it should be a sub step");
    }
  };

  if (current === null) {
    // first time we load
    if (config.component.widget?.autoStart !== false) {
      if (isMobile || !paramStep()) go(1);
      else go(paramStep());

      //      return null;
    }
  }
  if (current >= journey.length) {
    console.log("journey went off track, reset to the first step");
    setCurrent(0); // might happen if the journey is dynamically modified, eg FAB on isMobile-> return to wide screen
    return;
  }
  return (
    <ProcaRoot go={go} actions={getActions} config={config}>
      <TwoColumns
        dom={props.container}
        hidden={current === null}
        width={isMobile || config.component.widget?.forceWidth ? 0 : null}
      >
        {Number.isInteger(current) && <CurrentAction />}
      </TwoColumns>
      {props.children}
    </ProcaRoot>
  );
};

Widget.getSteps = () => {
  console.error("obsolete");
  //  return allSteps;
};

Widget.jump = (step) => {
  // name of the step of true to skip to next action
};

export default Widget;
