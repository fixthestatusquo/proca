import { useCallback } from "react";

import { atom, useRecoilState } from "recoil";

let formData = null;

// read url parameters and set reasonable defaults for the donation form
const initDonationState = (formData, config) => {

  if (!config.component.donation) {
    return;
  }

  // make sure some kind of amounts are configured
  if (!config.component.donation?.amount) {
    config.component.donation.amount = {
      oneoff: [3, 5, 10, 50, 200],
      monthly: [3, 5, 10, 15, 20],
      default: 5
    };
  };

  // The amount in the URL will be a string, so convert to Number
  if (typeof formData.amount === "string") {
    try {
      formData.initialAmount =
        formData.amount =
        Number.parseFloat(
          Number.parseFloat(formData.amount).toFixed(2)
        );
    } catch (e) {
      console.debug("Unable to parse amount sent in URL (or somewhere)", formData.amount);
    }
  }

  // Make sure we'll have some amount selected on the form
  if (!formData.amount) {
    formData.amount =
      formData.initialAmount =
      config.component.donation.amount.default;
  }

  // for each configured frequency, if we don't have the initialAmount in the list of amounts, add it.
  const initial = Number.parseFloat(formData.initialAmount);
  const configuredAmounts = config.component.donation.amount;
  for (const frequency in configuredAmounts) {
    if (frequency === "default") {
      continue;
    }
    let amounts = configuredAmounts[frequency].map((v) => v);
    if (!isNaN(initial)) {
      if (!amounts.find((s) => s === initial)) {
        amounts.push(initial);
        amounts.sort((a, b) => a - b);
        configuredAmounts[frequency] = amounts;
      }
    }
  };

  formData.amount = Number.parseFloat(
    Number.parseFloat(formData.amount).toFixed(2)
  );

  // If frequency wasn't in the URL, check the config
  if (!formData.frequency && config.component.donation?.frequency?.default) {
    try {
      formData.frequency = config.component.donation?.frequency?.default;
    } catch (e) {
      // noop
      console.debug("Error reading frequency from config", e);
    }
  }
  if (!formData.frequency) {
    formData.frequency = 'oneoff';
  }

}

export const initDataState = (urlData, config) => {
  if (formData) return false;

  initDonationState(urlData, config);

  formData = atom({
    key: "data",
    default: {
      ...{ comment: config.param.locales?.comment },
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

export { useData, initDonationState };
export default useData;
