import { useCallback } from "react";

import { atom, useRecoilState } from "recoil";

let formData = null;

export const initDataState = (urlData, config) => {
  if (formData) return false;

  // If we got the amount in the URL, convert the string to Number

  if (typeof urlData.amount === "string") {
    try {
      // NOTE: Why does toFixed return a *string* ?!
      urlData.amount = Number.parseFloat(
        Number.parseFloat(urlData.amount).toFixed(2)
      );
      urlData.initialAmount = urlData.amount;
    } catch (e) {
      // noop
      console.debug("Unable to parse as an int or float", urlData.amount);
    }
  }

  if (!urlData.amount) {
    try {
      if (config.component.donation?.amount.default) {
        urlData.amount = urlData.initialAmount =
          config.component.donation?.amount.default;
      }
    } catch (e) {
      // noop
      console.debug("Error reading default amount from config", e);
    }
  }

  // If frequency wasn't in the URL, check the config
  if (!urlData.frequency && config.component.donation?.frequency?.default) {
    try {
      urlData.frequency = config.component.donation?.frequency?.default;
    } catch (e) {
      // noop
      //console.debug("Error reading frequency from config", e);
    }
  }

  formData = atom({
    key: "data",
    default: {
      ...{ comment: config.param.locales?.comment || "" },
      ...urlData,
    },
  });
  return true;
};

const useData = () => {
  const [formValues, _set] = useRecoilState(formData);
  const setData = useCallback(
    (key, value) => {
      if (typeof key === "object") {
        _set((current) => {
          return { ...current, ...key };
        });
        return;
      }
      _set((current) => {
        let d = { ...current };
        d[key] = value;
        return d;
      });
    },
    [_set]
  );

  return [formValues, setData];
};

export { useData };
export default useData;
