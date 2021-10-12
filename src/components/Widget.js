import React, { useState, useRef, useCallback, useEffect } from "react";
import ProcaRoot from "./ProcaRoot";
import merge from "lodash.merge";
import { initConfigState } from "../hooks/useConfig";
import Url, { step as paramStep } from "../lib/urlparser.js";
import { getAllData, getOverwriteLocales } from "../lib/domparser";

//import { useTheme } from "@material-ui/core/styles";
import { useIsMobile } from "../hooks/useLayout";
import dispatch from "../lib/event";

import { initDataState } from "../hooks/useData";

import Loader from "./Loader";
import { steps } from "../actionPage";
import Button from "./FAB";
import Dialog from "./Dialog";
import Alert from "./Alert";
import TwoColumns from "./TwoColumns";
import { OperationCanceledException } from "typescript";
console.log("steps: ");
console.log(steps);
let config = {
  data: Url.data(),
  utm: Url.utm(),
  hook: {},
  param: {},
  component: {},
  locale: {},
};

let init = false;

const Widget = (props) => {
  const [current, _setCurrent] = useState(null);
  const setCurrent = (i) => {
    if (i >= 0 && journey[i])
      dispatch(journey[i].toLowerCase() + ":init", {
        step: journey[i],
        journey: journey,
      });
    _setCurrent(i);
  };
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

  if (props) config = { ...config, ...props };

  config.param = getAllData(config.selector);
  // in tests locales is not defined
  //  if (config.locales === undefined) {
  //    config.locales = {};
  //  }
  config.locales = merge(config.locales, getOverwriteLocales());
  config.actionPage = parseInt(config.actionPage || config.actionpage, 10);

  if (!config.actionPage) {
    console.assert("No actionPage defined. Can't continue.");
  }

  initConfigState(config);
  initDataState(data, config);

  const test = config.test;
  useEffect(() => {
    if (!test) return;
    const styles = `
    .proca-widget { 
            background: repeating-linear-gradient(-45deg, #F4F980 2px, #F4F980 8px, rgba(255,255,255,0.6) 15px, rgba(255,255,255,0.6) 33px );
    };
`;

    let styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
  }, [test]);

  useEffect(() => {
    /*global procaReady*/
    /*eslint no-undef: "error"*/
    if (typeof procaReady === "function") {
      console.log(
        "obsolete, please use window.addEventListener('proca:init', function(){}); instead"
      );

      procaReady({}); // NOTE: should we pass config to procaReady?
    }
  }, [props]);

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
  if (!init) {
    dispatch("proca:init", {
      config: config,
      data: data,
      isMobile: isMobile,
      step: journey[current ? current : 0],
    });
    init = true;
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
      // we're done - check what to do next!
      dispatch("proca:complete", { elem: "journey", journey: journey });

      // TODO: what's a nicer thing to do at the end - jumping back is likely to
      // make users think their submission didn't work.
      console.error("end of the journey, no more steps");

      setCurrent(0);
    }
  };

  const CurrentAction = (props) => {
    let Action = null;
    console.log("depths: " + depths);
    switch (depths[current]) {
      case 0:
        Action = steps[journey[current]];
        if (!Action) {
          console.log(
            "No action defined! ",
            current,
            journey,
            steps,
            steps[journey[current]]
          );
          return (
            <>
              <Alert severity="error">Configuration problem</Alert>
              <div>FATAL Error, check the log</div>
            </>
          );
        }
        console.log(
          `Action is ${Action}`,
          current,
          journey,
          steps,
          steps[journey[current]]
        );

        return (
          <>
            <Action
              actionPage={config.actionPage}
              done={nextStep}
              journey={journey}
              current={current}
            />
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
              journey={journey}
              current={current}
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
        {console.log("current: " + current)}
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
