// we have migrated from a single Config context to recoil and multiple atoms.
// technically, we are migrating, but more or less done

import React, { useEffect, useCallback } from "react";

import {
  atom,
  useSetRecoilState,
  useRecoilValue,
  useRecoilState,
} from "recoil";

import useData from "./useData";
import { init as initLayout, useSetLayout } from "./useLayout";
import i18next from "@lib/i18n";
import { merge, set } from "@lib/object";

export let configState = null;

export const initConfigState = config => {
  if (config.locales) {
    let campaignTitle = false;
    Object.keys(config.locales).map(k => {
      if (k.charAt(k.length - 1) === ":") {
        const ns = k.slice(0, -1);
        if (ns === "campaign") {
          config.locales[k].title =
            config.locales[k].title || config.campaign.title;
          campaignTitle = true;
        }
        i18next.addResourceBundle(
          config.lang,
          ns,
          config.locales[k],
          true,
          true
        );
        delete config.locales[k];
      }
      return true;
    });
    if (!campaignTitle) {
      i18next.addResourceBundle(
        config.lang,
        "campaign",
        config.campaign,
        true,
        true
      );
    }
    i18next.addResourceBundle(
      config.lang,
      "common",
      config.locales,
      true,
      true
    );
  }
  initLayout(config.layout);
  delete config.locales;
  if (configState) return false;
  configState = atom({
    key: "campaign",
    default: config,
  });
  return true;
};

export const Config = React.createContext();

const id = "proca-listener";

export const setGlobalState = (atom, key, value) => {
  const event = new CustomEvent("proca-set", {
    detail: { atom: atom, key: key, value: value },
  });

  const el = document.getElementById(id);
  if (el) {
    el.dispatchEvent(event);
  } else {
    // delay until the display is finished
    setTimeout(setGlobalState, 1, atom, key, value);
  }
};

const goStep = action => {
  const event = new CustomEvent("proca-go", { detail: { action: action } });
  if (document.getElementById(id))
    document.getElementById(id).dispatchEvent(event);
  else {
    console.log("timeout", action);
    setTimeout(goStep, 20000, action);
  }
};

const setHook = (object, action, hook) => {
  const event = new CustomEvent("proca-hook", {
    detail: { object: object, action: action, hook: hook },
  });
  if (document.getElementById(id)) {
    document.getElementById(id).dispatchEvent(event);
  } else {
    // wait until the rendering is done
    setTimeout(setHook, 1, object, action, hook);
  }
};

export const ConfigProvider = props => {
  //  const [config, _setConfig] = useState(props.config);
  const setLayout = useSetLayout();
  const _setCampaignConfig = useSetRecoilState(configState);
  const [, setData] = useData();

  const go = props.go;

  const setPartPath = (part, path, value) => {
    _setCampaignConfig(config => {
      const d = JSON.parse(JSON.stringify(config));
      return set(d, `${part}.${path}`, value);
    });
  };

  const setPart = (part, toMerge) => {
    _setCampaignConfig(config => {
      const d = {};
      d[part] = toMerge;
      return merge(config, d);
    });
  };
  // either set a single key or merge
  const handlePart = (part, key, value) => {
    if (typeof key === "string") {
      setPartPath(part, key, value);
    } else {
      setPart(part, key);
    }
  };

  const setHook = useCallback(
    (object, action, hook) => {
      _setCampaignConfig(current => {
        const next = { ...current };
        next.hook = { ...current.hook };
        next.hook[`${object}:${action}`] = hook;
        return next;
      });
    },
    [_setCampaignConfig]
  );

  useEffect(() => {
    const elem = document.getElementById(id);

    elem.addEventListener(
      "proca-set",
      e => {
        switch (e.detail.atom) {
          case "layout":
            setLayout(e.detail.key, e.detail.value);
            break;
          case "component":
            handlePart("component", e.detail.key, e.detail.value);
            break;
          /*          case "data":
            handlePart("data", e.detail.key, e.detail.value);
            handlePart("param", e.detail.key, e.detail.value);
            break;
          case "locale":
            handlePart("locale", e.detail.key, e.detail.value);
            break;
*/
          case "campaign":
            alert("disabled, use set component or locale");
            break;
          case "data":
            setData(e.detail.key, e.detail.value);
            break;
          default:
            console.error("you need to specify an atom/namespace"); //setConfig(e.detail.key,e.detail.value);
        }
      },
      false
    );

    elem.addEventListener(
      "proca-hook",
      e => {
        if (typeof e.detail.hook !== "function")
          return console.error("After must be a function");

        if (typeof e.detail.action !== "string")
          return console.error("action must me a string");

        if (typeof e.detail.object !== "string")
          return console.error("object must me a string");
        setHook(e.detail.object, e.detail.action, e.detail.hook);
      },
      false
    );

    elem.addEventListener(
      "proca-go",
      e => {
        if (typeof go === "function") {
          go(e.detail.action);
        } else {
          console.error("ain't no go fct");
        }
      },
      false
    );
  }, [go, setHook, setLayout, handlePart, setData]);

  //setCampaignConfig(config);
  //<Config.Provider value={{config, setConfig}}>
  return (
    <>
      {props.children}
      <div id={id} />
    </>
  );
};

//export const useConfig = () => (useContext(Config));
//useConfig should be replaced by useCampaignConfig, useData, useLayout
export const useCampaignConfig = () => useRecoilValue(configState);
export const useConfig = () => useRecoilState(configState);
export const useSetCampaignConfig = () => useSetRecoilState(configState);
export { set as setConfig };
export { goStep };
export { setHook as hook };
