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
import _set from "lodash/set";

export let configState = null;

export const initConfigState = (config) => {
  if (config.locales) {
    let campaignTitle = false;
    Object.keys(config.locales).map((k) => {
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

export let Config = React.createContext();

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

const set = (key, value) => {
  // obsolete, will soon be removed
  console.log("obsolete, shouldn't be there");
  const event = new CustomEvent("proca-set", {
    detail: { key: key, value: value },
  });

  document.getElementById(id).dispatchEvent(event);
};

const goStep = (action) => {
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

export const ConfigProvider = (props) => {
  //  const [config, _setConfig] = useState(props.config);
  const setLayout = useSetLayout();
  const _setCampaignConfig = useSetRecoilState(configState);
  const [, setData] = useData();

  const go = props.go;

  const setCampaignConfig = useCallback(
    // trying to set paths one at a time with multiple proca.set() calls led to
    // read-only errors... so set the all at once.
    (to_update) => {
      _setCampaignConfig((current) => {
        for (const [path, value] of Object.entries(to_update)) {
          // mutates object in place
          _set(current, path, value);
        }
        return current;
      });
    },
    [_setCampaignConfig]
  );

  const setHook = useCallback(
    (object, action, hook) => {
      _setCampaignConfig((current) => {
        const next = { ...current };
        next.hook = { ...current.hook };
        next.hook[object + ":" + action] = hook;
        return next;
      });
    },
    [_setCampaignConfig]
  );

  useEffect(() => {
    const elem = document.getElementById(id);
    elem.addEventListener(
      "proca-set",
      (e) => {
        switch (e.detail.atom) {
          case "layout":
            setLayout(e.detail.key, e.detail.value);
            break;
          case "campaign":
            if (e.detail.value && !(e.detail.key instanceof Object)) {
              setCampaignConfig({ [e.detail.key]: e.detail.value });
            }
            setCampaignConfig(e.detail.key);
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
      (e) => {
        if (!typeof e.detail.hook === "function")
          return console.error("After must be a function");

        if (!typeof e.detail.action === "string")
          return console.error("action must me a string");

        if (!typeof e.detail.object === "string")
          return console.error("object must me a string");
        setHook(e.detail.object, e.detail.action, e.detail.hook);
      },
      false
    );

    elem.addEventListener(
      "proca-go",
      (e) => {
        if (typeof go === "function") {
          go(e.detail.action);
        } else {
          console.error("ain't no go fct");
        }
      },
      false
    );
  }, [go, setHook, setLayout, setCampaignConfig, setData]);

  //setCampaignConfig(config);
  //<Config.Provider value={{config, setConfig}}>
  return (
    <>
      {props.children}
      <div id={id}></div>
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
