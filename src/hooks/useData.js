import { useCallback } from "react";

import { atom, useRecoilState } from "recoil";

let dataState = null;

export const initDataState = (data) => {
  if (dataState) return false;

  if (typeof data.amount === "string") {
    try {
      // NOTE: Why does toFixed return a *string* ?!
      data.amount = Number.parseFloat(
        Number.parseFloat(data.amount).toFixed(2)
      );
      data.initialAmount = data.amount;
    } catch (e) {
      // noop
      console.debug("Unable to parse as an int or float", data.amount);
    }
  }
  dataState = atom({
    key: "data",
    default: {
      currency: { symbol: "€", code: "EUR" },
      frequency: "oneoff",
      ...data,
    },
  });
  return true;
};

const useData = () => {
  const [data, _set] = useRecoilState(dataState);

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

  return [data, setData];
};

export { useData };
export default useData;
