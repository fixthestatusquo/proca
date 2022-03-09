import {useEffect,useLayoutEffect, useState} from 'react';
import {useSetCampaignConfig} from '@hooks/useConfig';
import {useData} from '@hooks/useData';

const SpeakoutCheck = props => {
  //this is a bit of a special portal, it removes the consent if we know it's a member
  //only to be used as portal for speakout pages
  const setCampaign = useSetCampaignConfig ();
  const [,setData] = useData ();

  const [refreshed, setRefresh] = useState(true);

  useLayoutEffect ( () => {
    if (!refreshed)
      window.proca.go(1);
    setRefresh(true);
  }, [refreshed]);

  useEffect ( () => {
    const getCookie =  () => {
//      const r = "member=%7B%22firstname%22%3A%22ALson%22%2C%22lastname%22%3A%22sdf%22%2C%22email%22%3A%22pbt%40tttp.eu%22%2C%22postcode%22%3A%22123%22%2C%22country%22%3A%22de%22%2C%22phone%22%3Anull%2C%22cs%22%3A%222785%22%2C%22consents%22%3A%7B%7D%7D; lt-anonymous-id=\"0.161dfbed177b9729468\"; lt-session-data={\"id\":\"0.450cb21c1795b815ed4\",\"lastUpdatedDate\":\"2021-05-11T12:57:55Z\"}; lt-pageview-id=\"0.138ef0611795b815ed9\"".split(";")

       const r = document.cookie.split(";")
        .filter(d => d.startsWith("member="))
        .map (d => {
          try {
            return JSON.parse(decodeURIComponent(d.substring(7)))
          } catch (e) {
            return {};
          }
        });
      return r[0] || {};

    }
    const data = getCookie ();
//    if (!data.firstname) return;
    if (document.cookie.indexOf("member=") === -1)
      return;
    setData(data);
    setCampaign((current) => {
      let r= JSON.parse(JSON.stringify(current)); // deep copy
      r.component.consent = Object.assign({}, current.component.consent, {implicit:true})
      return r;
    });
    setRefresh(false);
  },[setCampaign, setData]);
  return null;
};

export default SpeakoutCheck;
