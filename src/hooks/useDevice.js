import React, {useEffect,useState} from "react";

const useIsMobile = () => { // there is another useIsMobile, based on the screen width at src/hooks/useLayout
  const [isMobile, setMobile] = useState(false);

  const UA = navigator.userAgent;
  useEffect (()=>{
    const im = /(iphone|ipod|ipad|android)/gi.test( UA ) || ( navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1 ); // iPadOS
    setMobile(im);
  },[UA]);

  return isMobile;
}

export {useIsMobile};
