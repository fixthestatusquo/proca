import { useCallback } from "react";

import { atom, useRecoilState } from "recoil";

let formData = null;

const currencySymbols = { EUR: "€", PLN: "zł", GBP: "£" };

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
      if (config?.component.donation.amount.default) {
        urlData.amount = urlData.initialAmount =
          config.component.donation.amount.default;
      }
    } catch (e) {
      // noop
      console.debug("Error reading default amount from config", e);
    }
  }

  // If we got a currency code in the URL, convert the code to { code: ..., symbol: ... }

  if (typeof urlData.currency === "string") {
    try {
      // Look up symbol for the currency
      urlData.currency = {
        symbol: currencySymbols[urlData.currency],
        code: urlData.currency,
      };
    } catch (e) {
      console.debug(
        "Oops, we don't know about that currency: ",
        urlData.currency
      );
    }
  }

  if (!urlData.currency) {
    try {
      urlData.currency = config.component.donation.currency;
    } catch (e) {
      // noop
      console.debug("Error reading currency from config", e);
    }
  }

  if (!urlData.currency) {
    urlData.currency = { code: "EUR", symbol: "€" };
  }

  // If frequency wasn't in the URL, check the config

  if (!urlData.frequency) {
    try {
      urlData.frequency = config.component.donation.frequency.default;
    } catch (e) {
      // noop
      console.debug("Error reading frequency from config", e);
    }
  }

  formData = atom({
    key: "data",
    default: {
      // we need a default here, because nothing in the interface
      // calls setData for currency
      currency: { symbol: "€", code: "EUR" },
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
