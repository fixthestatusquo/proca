import { useCallback } from "react";
import create from "zustand";

let formData = null;

export const initDataState = (urlData, config) => {
  if (formData) return false;
  formData = {
    comment: config.param.locales?.comment || "",
    ...urlData,
  };

  console.log("initDataState", formData);
  return true;
};

const useStore = create((set) => ({
  formValues: formData,
  setData: (key, value) =>
    set((state) => {
      if (typeof key === "object") {
        return { formValues: { ...state.formValues, ...key } };
      }
      return { formValues: { ...state.formValues, [key]: value } };
    }),
}));

const useData = () => {
  const formValues = useStore((state) => state.formValues);
  const setData = useStore((state) => state.setData);

  const setFormData = useCallback(
    (key, value) => {
      setData(key, value);
    },
    [setData],
  );

  console.log(formValues, setFormData);
  return [formValues, setFormData];
};

export { useData };
export default useData;
