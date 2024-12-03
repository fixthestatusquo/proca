import { create } from "zustand";

let formData = null;

export const initDataState = (urlData, config) => {
  if (formData) return false;

  formData = create((set) => ({
    data: {
      ...{ comment: config.param.locales?.comment || "" },
      ...urlData,
    },
    setData: (key, value) => set((state) => {
      if (typeof key === "object") {
        return { data: { ...state.data, ...key } };
      }
      return { data: { ...state.data, [key]: value } };
    }),
  }));

  return true;
};

const useData = () => {
  const store = formData();
  const { data: formValues, setData } = store;

  return [formValues, setData];
};

export { useData };
export default useData;

