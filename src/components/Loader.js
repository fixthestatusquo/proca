// obsolete
import { useEffect } from "react";

const Component = props => {
  useEffect(() => {
    if (typeof window[props.loader] === "function") {
      setTimeout(window[props.loader], 1);
    } else {
      console.log("missing function ", props.loader);
    }
  }, [props.loader]);

  return null;
};

export default Component;
