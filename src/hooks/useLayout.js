import { useMediaQuery } from "@material-ui/core";
import { create } from "zustand";

let layoutStore = null;

const init = data => {
  if (layoutStore) return false;

  const defaultLayout = {
    variant: "filled", // options filled, outlined, standard
    button: { variant: "contained" },
    margin: "dense",
    primaryColor: "#1976d2",
    secondaryColor: "#dc004e",
    paletteType: "light",
    backgroundColor: "transparent",
    ...data,
  };

  layoutStore = create(set => ({
    layout: defaultLayout,
    setLayout: (key, value) =>
      set(state => {
        if (typeof key === "object") {
          return { layout: { ...state.layout, ...key } };
        }
        return { layout: { ...state.layout, [key]: value } };
      }),
  }));

  return true;
};

const useLayout = () => {
  const { layout } = layoutStore();
  return layout;
};

const useSetLayout = () => {
  const { setLayout } = layoutStore();
  return setLayout;
};

const useIsMobile = (never = null) => {
  const mobile = useMediaQuery("(max-width:768px)", { noSsr: true });
  return never === null && mobile;
};

const useIsVeryNarrow = () => {
  return useMediaQuery("(max-width:480px)", { noSsr: true });
};

export { useSetLayout, useLayout, init, useIsMobile, useIsVeryNarrow };
export default useLayout;
