import { useEffect } from "react";

let hasRun = false;

export const getHash = prefix => {
  if (!prefix) {
    prefix = "proca_";
  }

  const urlHash = window.location.hash.substring(1);
  if (urlHash.startsWith(prefix)) {
    return urlHash.replace(prefix, "");
  }
};

const useHash = ({ prefix, onChange }) => {
  useEffect(() => {
    if (hasRun) return;
    hasRun = true;

    window.addEventListener("hashchange", () => {
      const step = getHash(prefix);
      if (step) onChange(step);
    });
  }, []);
};

export default useHash;
