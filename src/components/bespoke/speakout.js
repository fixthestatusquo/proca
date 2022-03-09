import {useEffect} from 'react';
import {useSetCampaignConfig} from '@hooks/useConfig';

const SpeakoutCheck = props => {
  //this is a bit of a special portal, it removes the consent if we know it's a member
  //only to be used as portal for speakout pages
  const setCampaign = useSetCampaignConfig ();

  useEffect ( () => {
    if (document.cookie.indexOf("member=") === -1)
      return;
    setCampaign((current) => {
      let r= JSON.parse(JSON.stringify(current)); // deep copy
      r.component.consent = Object.assign({}, current.component.consent, {implicit:true})
      return r;
    });

  },[setCampaign]);
  return null;
};

export default SpeakoutCheck;
