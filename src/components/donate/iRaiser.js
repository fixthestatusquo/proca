import React, { useLayoutEffect } from "react";
import { useComponentConfig } from "@hooks/useConfig";
//import useData from "@hooks/useData";


const iRaiserFrame = () => {
  const component = useComponentConfig();

  useLayoutEffect(() => {
    if (!component?.donation?.iraiser?.url) return;
    const scriptUrl = `${component.donation.iraiser.url}/libs.iraiser.eu/libs/payment/frame/1.6/IRaiserFrame.js`;

    // Check if script already exists
    if (document.querySelector(`script[src="${scriptUrl}"]`)) {
      return;
    }

    const script = document.createElement('script');
    script.src = scriptUrl;
    script.async = true;

    script.onload = () => {
      console.log('iRaiser loaded');
      window.IRaiserFrame.init();
    };

    document.body.appendChild(script);

  }, [component]);

  if (!component?.donation?.iraiser) return "ERROR: you need to add component.donation.iraiser {url, cid}";
  const href = `${component.donation.iraiser.url}/b?cid=${component.donation.iraiser.cid}#iraiser_native`;

  return <>
    <a id="iraiser_frame" href={href}>donate</a>
  </>;
}

export default iRaiserFrame;
