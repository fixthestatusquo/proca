import { useCallback } from "react";

import { atom, useRecoilState } from "recoil";

let dataState = null;

export const initDataState = (data) => {
  if (dataState) return false;
  dataState = atom({
    key: "data",
    default: data || {},
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
