import React, {useEffect} from 'react';
import { useComponentConfig, useSetCampaignConfig } from "@hooks/useConfig";

const setVariant= value => 
    const url = new URL(window.location.href);
    url.searchParams.set('utm_content', value);
    window.history.replaceState(null, '', url);
}


const ABTest  = () => {
  const component = useComponentConfig ();
  setConfig = useSetCampaignConfig();
  console.log(component.test);
  useEffect (() => {
    const variant = Math.random() < 0.5;
    setVariant (variant ? 'A': 'B'); 
    setConfig(current => {
      if ( variant ) {
        return current;
      };

      const next = { ...current };
//      next.component.register.field.phone = true;
      return next;
  });
  },[]);

  return null;
};

export default ABTest;
