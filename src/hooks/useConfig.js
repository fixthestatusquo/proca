import React, { useEffect, useCallback } from "react";
import { create } from "zustand";
import { useShallow } from 'zustand/react/shallow'
import useData from "./useData";
import { init as initLayout, useSetLayout } from "./useLayout";
import i18next from "@lib/i18n";
import { merge, set } from "@lib/object";

export let configStore = null;

export const initConfigState = config => {
  if (config.locales) {
    let campaignTitle = false;
    Object.keys(config.locales).forEach(k => {
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

  if (configStore) return false;

  configStore = create(set => ({
    campaignConfig: config,
    setActionType: (type, force) => {
       set(state => {
         if (!force && state.campaignConfig?.component?.register?.actionType) return state; //do not update the type if set in the config, unless forced
         if (!state.campaignConfig.component.register) state.campaignConfig.component.register = {};
         state.campaignConfig.component.register.actionType = type;
         return state;
       })
    },
    setCampaignConfig: update =>
      set(state => ({
        campaignConfig: {
          ...state.campaignConfig,
          ...update(state.campaignConfig),
        },
      })),
  }));

  return true;
};

export const Config = React.createContext();

const id = "proca-listener";

export const setGlobalState = (key, value) => {
  const event = new CustomEvent("proca-set", {
    detail: { key, value },
  });

  const el = document.getElementById(id);
  if (el) {
    el.dispatchEvent(event);
  } else {
    setTimeout(setGlobalState, 1, key, value);
  }
};

const goStep = action => {
  const event = new CustomEvent("proca-go", { detail: { action } });
  if (document.getElementById(id)) {
    document.getElementById(id).dispatchEvent(event);
  } else {
    setTimeout(goStep, 20000, action);
  }
};

const setHook = (object, action, hook) => {
  const event = new CustomEvent("proca-hook", {
    detail: { object, action, hook },
  });
  if (document.getElementById(id)) {
    document.getElementById(id).dispatchEvent(event);
  } else {
    setTimeout(setHook, 1, object, action, hook);
  }
};

export const ConfigProvider = props => {
  const setLayout = useSetLayout();
  const { setCampaignConfig } = configStore();
  const [, setData] = useData();
  const go = props.go;

  const setPartPath = (part, path, value) => {
    setCampaignConfig(config => {
      const updatedConfig = JSON.parse(JSON.stringify(config));
      return set(updatedConfig, `${part}.${path}`, value);
    });
  };

  const setPart = (part, toMerge) => {
    setCampaignConfig(config => {
      const update = {};
      update[part] = toMerge;
      return merge(config, update);
    });
  };

  const handlePart = (part, key, value) => {
    if (typeof key === "string") {
      setPartPath(part, key, value);
    } else {
      setPart(part, key);
    }
  };

  const setHook = useCallback(
    (object, action, hook) => {
      setCampaignConfig(current => {
        const next = { ...current };
        next.hook = { ...current.hook };
        next.hook[`${object}:${action}`] = hook;
        return next;
      });
    },
    [setCampaignConfig]
  );

  useEffect(() => {
    const elem = document.getElementById(id);

    elem.addEventListener(
      "proca-set",
      e => {
        switch (e.detail.key) {
          case "layout":
            setLayout(e.detail.value);
            break;
          case "component":
            handlePart(e.detail.key, e.detail.value);
            break;
          case "data":
            setData(e.detail.key, e.detail.value);
            break;
          default:
            console.error("you need to specify a valid key");
        }
      },
      false
    );

    elem.addEventListener(
      "proca-hook",
      e => {
        if (typeof e.detail.hook !== "function")
          return console.error("Hook must be a function");
        if (typeof e.detail.action !== "string")
          return console.error("Action must be a string");
        if (typeof e.detail.object !== "string")
          return console.error("Object must be a string");
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
          console.error("No go function available");
        }
      },
      false
    );
  }, [go, setHook, setLayout, handlePart, setData]);

  return (
    <>
      {props.children}
      <div id={id} />
    </>
  );
};

export const useCampaignConfig = () =>
  configStore(state => state.campaignConfig);

export const useComponentConfig = () =>
  configStore(useShallow(state => state.campaignConfig?.component));

export const useJourneyConfig = () =>
  configStore(
    (state) => state.campaignConfig.journey,
    shallow
  );


export const useConfig = () => configStore(state => state.campaignConfig);
export const useSetCampaignConfig = () =>
  configStore(state => state.setCampaignConfig);
export const useSetActionType = (type) => {
  const setActionType = configStore(state => state.setActionType);
  useEffect ( () => {
    if (type)
      setActionType(type);
  },[]); 
  return setActionType;
}

export { set as setConfig };
export { goStep };
export { setHook as hook };
