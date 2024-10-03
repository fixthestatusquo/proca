import { useCallback } from "react";

import { atom, useRecoilState } from "recoil";

let formData = null;

export const initDataState = (urlData, config) => {
  if (formData) return false;

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
        _set(current => {
          return { ...current, ...key };
        });
        return;
      }
      _set(current => {
        const d = { ...current };
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
