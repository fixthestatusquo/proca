import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useLayoutEffect,
} from "react";
import ProcaRoot from "@components/ProcaRoot";
//import merge from "lodash.merge";
import { merge } from "@lib/object";
import { initConfigState } from "@hooks/useConfig";
import Url, { step as paramStep } from "@lib/urlparser";
import { getCookie } from "@lib/cookie";
import { getItems } from "@lib/localStorage";
import { getAllData, getOverwriteLocales } from "@lib/domparser";

//import { useTheme } from "@material-ui/core/styles";
import { useIsMobile } from "@hooks/useLayout";
import dispatch from "@lib/event";
import { scrollTo as _scrollTo } from "@lib/scroll";

import { initDataState } from "@hooks/useData";

import Loader from "@components/Loader";
import { steps } from "../actionPage";
import Button from "@components/FAB";
import Alert from "@components/Alert";
import TwoColumns from "@components/TwoColumns";
let config = {
  data: Url.data(),
  utm: Url.utm(),
  hook: {},
  param: {},
  component: {},
  locale: {},
};
let init = false;

const Widget = props => {
  const [current, _setCurrent] = useState(null);
  //  const [breadCrumb, setReturnStep] = useState({});  creates extra render
  const intersectionRef = useRef();

  const setCurrent = i => {
    if (i >= 0 && journey[i])
      dispatch(
        `${journey[i].toLowerCase()}:init`,
        {
          test: !!config.test,
          step: journey[i],
          journey: journey,
        },
        null,
        config
      );
    setTimeout(() => {
      const otherSteps = journey
        .filter((_step, d) => d !== i)
        .map(d => `.proca-${d}`)
        .join(", ");
      let r = otherSteps ? document.querySelectorAll(otherSteps) : [];
      for (let j = 0; j < r.length; j++) {
        r[j].style.display = "none";
      }
      r = document.getElementsByClassName(`proca-${journey[i]}`);
      for (let j = 0; j < r.length; j++) {
        r[j].style.display = "block";
      }
    }, 100);
    _setCurrent(i);
  };
  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);

  //  const theme = useTheme();
  //  const isMobile = useMediaQuery(theme.breakpoints.down("sm"),{noSsr:true});
  const depths = []; // one entry per action in the journey, 0 = top level, 1 = top level avec substeps, 2 = substeps
  const topMulti = useRef(0); // latest Action level 0 rendered
  const propsJourney = Object.assign([], props.journey);
  const isMobile = useIsMobile(paramStep()); // paramStep contains the proca_go http param, if set, never mobile
  const fab = config.component.widget?.fab !== false;

  let data = Url.data();
  if (props) config = { ...config, ...props };

  let cookies = {};

  if (!config.component.widget?.cookie === false) {
    cookies = {
      uuid: getCookie("proca_uuid"),
      firstname: getCookie("proca_firstname"),
    };
  }
  const storage = getItems(config.component.storage); //to check: is this used anywhere?
  document.querySelectorAll(props.selector).forEach(dom => {
    data = { ...dom.dataset, ...cookies, ...storage, ...data };
  });

  config.param = getAllData(config.selector);
  //config.locales = Object.assign(config.locales, getOverwriteLocales());
  config.locales = merge(config.locales, getOverwriteLocales());
  config.actionPage = Number.parseInt(
    config.actionPage || config.actionpage,
    10
  );

  if (!config.actionPage) {
    console.assert("No actionPage defined. Can't continue.");
  }
  initConfigState(config);

  initDataState(data, config);

  const test = config.test;
  useEffect(() => {
    if (!test) return; // I'm not sure anymore why it's done that way instead of a normal classes useStyles... but there is a reason
    const styles = `
@keyframes procaBackgroundTest {
  0% {
    background-color: #fff4e5;
  }
  100% {
    background-color: auto;
  }
  }
    .proca-widget {
      animation: 5s ease-out 0s 1 procaBackgroundTest;
    };
`;

    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
  }, [test]);

  const scrollNeeded = useRef(false);
  useLayoutEffect(() => {
    if (scrollNeeded.current) {
      _scrollTo();
      scrollNeeded.current = false;
    }
  });

  const scrollTo = () => {
    scrollNeeded.current = true;
  };

  const journey = propsJourney.reduce((acc, val) => acc.concat(val), []); // fubar edge propsJourney.flat();
  if (current === false) {
    // obsolete?
    setCurrent(0);
    return;
  }
  if (!init) {
    dispatch(
      "proca:init",
      {
        config: config,
        data: data,
        isMobile: isMobile,
        step: journey[current ? current : 0],
      },
      config
    );
    init = true;
  }

  if (props.loader) {
    //obsolete, to be removed
    config.loader = props.loader;
    journey.unshift("loader");
    steps["loader"] = Loader;
    depths.push(0);
  }

  propsJourney.forEach(d => {
    if (d instanceof Array) {
      d.forEach((_e, i) => {
        depths.push(i > 0 ? 2 : 1);
      }); // the first of a multistep is on level 1 (eg dialog, sinon 2)
    } else depths.push(0);
  });

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
      i = journey.findIndex(d => d.toLowerCase() === action.toLowerCase());
    }
    if (i === -1) {
      console.error("can't find '", action, "'. options: ", journey);
      global.proca.Alert(`not possible to go to '${action}'`, "error");
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
  const nextStep = result => {
    // setReturnStep(result);
    // nextStep checks if there is a bespoke action to run after the current step (created by calling proca.after)
    //console.log(config.hook);
    scrollTo();
    //console.log(journey[current], steps[journey[current]]);
    if (
      steps[journey[current]] &&
      typeof steps[journey[current]].after === "function"
    ) {
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
      dispatch(
        "proca:complete",
        { elem: "journey", journey: journey },
        null,
        config
      );

      // TODO: what's a nicer thing to do at the end - jumping back is likely to
      // make users think their submission didn't work.
      // console.error("end of the journey, no more steps");

      // setCurrent(0);
    }
  };

  const CurrentAction = props => {
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
            <Action
              actionPage={config.actionPage}
              done={nextStep}
              go={go}
              journey={journey}
              current={current}
            />
            {props.children}
          </>
        ); //break;
      case 1:
      case 2: {
        const SubAction = steps[journey[current]];
        Action = steps[topMulti.current];
        if (!Action || !SubAction) {
          return (
            <Alert severity="error">
              can&apos;t find Action {topMulti.current} or SubAction{" "}
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
              go={go}
            >
              <SubAction
                actionPage={config.actionPage}
                done={nextStep}
                go={go}
              />
            </Action>
            {props.children}
          </>
        ); //break;
      }
      default:
        throw Error("Oops, it should be a sub step");
    }
  };

  if (current === null) {
    // first time we load
    if (config.component.widget?.autoStart !== false) {
      if (paramStep()) {
        go(paramStep());
        _scrollTo({ delay: 300 });
      } else {
        go(1);
      }
    }
  }
  if (current >= journey.length) {
    console.log("journey went off track, reset to the first step");
    setCurrent(0); // might happen if the journey is dynamically modified, eg FAB on isMobile-> return to wide screen
    return;
  }
  const onFabClick = () => {
    dispatch("fab_click", null, null, config);
    _scrollTo();
    const firstname = document.getElementsByName("firstname");
    if (firstname.length === 1) {
      setTimeout(() => {
        firstname[0].focus();
      }, 1000);
    }
  };

  return (
    <ProcaRoot go={go} actions={getActions} config={config}>
      <TwoColumns
        dom={props.container}
        hidden={current === null}
        width={config.component.widget?.forceWidth ? 0 : null}
      >
        {fab && <Button done={onFabClick} ref={intersectionRef} />}

        <div className="proca-set" ref={intersectionRef}>
          {Number.isInteger(current) && <CurrentAction />}
        </div>
      </TwoColumns>
      {props.children}
    </ProcaRoot>
  );
};

Widget.getSteps = () => {
  console.error("obsolete");
  //  return allSteps;
};

export default Widget;
