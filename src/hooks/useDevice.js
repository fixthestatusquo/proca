import { useEffect, useState } from "react";

export const mobileOS = userAgent => {
  userAgent = (userAgent || navigator.userAgent).toLowerCase();

  const devices = ["android", "iphone", "ipad", "ipod"];

  for (const device of devices) {
    if (userAgent.includes(device)) {
      return device;
    }
  }
  return "phone";

};

const useMobileOS = () => {
  const [type, setType] = useState(false);
  const UA = navigator.userAgent;

  useEffect(() => {
    setType(mobileOS(UA));
  }, [UA]);

  return type;
};

const useIsMobile = () => {
  // there is another useIsMobile, based on the screen width at src/hooks/useLayout
  const [isMobile, setMobile] = useState(false);

  const UA = navigator.userAgent;

  useEffect(() => {
    //TO_TEST const im=window?.matchMedia('(any-pointer:coarse)').matches;
    const im =
      /(iphone|ipod|ipad|android)/gi.test(UA) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1); // iPadOS
    setMobile(im);
  }, [UA]);

  return isMobile;
};

const useIsWindows = () => {
  const [isWin, setWin] = useState(false);
  useEffect(() => {
    if (navigator.userAgent.indexOf("Win") > -1) setWin(true);
  }, []);
  return isWin;
};

export { useIsMobile, useIsWindows, useMobileOS };
