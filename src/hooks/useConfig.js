import React, { useEffect, useCallback } from "react";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import useData from "./useData";
import { init as initLayout, useSetLayout } from "./useLayout";
import i18next from "@lib/i18n";
import { merge, set } from "@lib/object";

export const configStore = create(set => ({
  campaignConfig: null,
  setActionType: (type, force) => {
    set(state => {
      if (!force && state.campaignConfig?.component?.register?.actionType)
        return state;
      return {
        campaignConfig: merge(state.campaignConfig, {
          component: {
            register: {
              actionType: type,
            },
          },
        }),
      };
    });
  },
  setCampaignConfig: update => {
    if (typeof update === "function") {
      return set(state => ({ campaignConfig: update(state.campaignConfig) }));
    } else {
      return set(state => {
        return {
          campaignConfig: merge(state.campaignConfig || {}, update),
        };
      });
    }
  },
}));

export const initConfigState = config => {
  // Early return if already initialized
  if (configStore.getState().campaignConfig) return false;

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
  if (!config.layout?.primaryColor && config.org.primaryColor) {
    config.layout.primaryColor = config.org.primaryColor;
  }
  initLayout(config.layout);
  delete config.locales;
  // TODO: check if we need to store config.layout in the campaign config
  configStore.getState().setCampaignConfig(config);
};

const id = "proca-listener";

export const setGlobalState = (part, key, value) => {
  const event = new CustomEvent("proca-set", {
    detail: { part, key, value },
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
  const setCampaignConfig = useSetCampaignConfig();
  const [, setData] = useData();
  const go = props.go;

  const setPartPath = (part, path, value) => {
    const _part = set({}, `${part}.${path}`, value);
    setCampaignConfig(_part);
    return;
  };

  const setPart = (part, toMerge) => {
    const update = {};
    update[part] = toMerge;
    setCampaignConfig(update);
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
        const { part, key, value } = e.detail;
        switch (part) {
          case "layout":
            setLayout(key, value);
            break;
          case "component":
            handlePart(part, key, value);
            break;
          case "data":
            setData(part, key, value);
            break;
          default:
            console.error("you need to specify a valid part");
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
  }, [go, setHook, setLayout, setData]);

  return (
    <>
      {props.children}
      <div id={id} />
    </>
  );
};

export const useCampaignConfig = () =>
  configStore(state => state.campaignConfig);

export const useComponentConfig = () => {
  //return configStore.(useShallow(state => state.campaignConfig?.component));
  if (!configStore) return undefined;
  return configStore(state => state.campaignConfig?.component);
};
export const useJourneyConfig = () =>
  configStore(state => state.campaignConfig.journey, shallow);

export const useConfig = () => configStore(state => state.campaignConfig);
export const useSetCampaignConfig = () =>
  configStore(state => state.setCampaignConfig);

export const useSetActionType = type => {
  const setActionType = configStore(state => state.setActionType);
  useEffect(() => {
    if (type) setActionType(type);
  }, []);
  return setActionType;
};

export { set as setConfig };
export { goStep };
export { setHook as hook };
