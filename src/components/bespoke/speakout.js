import { useEffect, useLayoutEffect, useState } from "react";
import { useSetCampaignConfig } from "@hooks/useConfig";
import { useData } from "@hooks/useData";

const SpeakoutCheck = () => {
  //this is a bit of a special portal, it removes the consent if we know it's a member
  //only to be used as portal for speakout pages
  const setCampaign = useSetCampaignConfig();
  const [, setData] = useData();

  const [refreshed, setRefresh] = useState(true);

  useLayoutEffect(() => {
    if (!refreshed) window.proca.go(1);
    setRefresh(true);
  }, [refreshed]);

  useEffect(() => {
    const getCookie = () => {
      //      const r = '_pk_id.2.a608=857d7b7cb8c1535c.1646841743.; _pk_ses.2.a608=1; member=%7B%22firstname%22%3A%22ALonso%22%2C%22lastname%22%3A%22Bistro%22%2C%22email%22%3A%22testp%40tet.com%22%2C%22postcode%22%3A%221234%22%2C%22country%22%3A%22pl%22%2C%22phone%22%3Anull%2C%22cs%22%3A%222982%22%2C%22consents%22%3A%7B%222.1.0-pl%22%3A%7B%22consent_level%22%3A%22none_given%22%2C%22consent_created_at%22%3A%222022-03-09T17%3A19%3A51.851Z%22%7D%7D%7D'.split("; ")

      const r = document.cookie
        .split("; ")
        .filter(d => d.startsWith("member="))
        .map(d => {
          try {
            return JSON.parse(decodeURIComponent(d.substring(7)));
          } catch {
            return {};
          }
        });
      return r[0] || {};
    };
    const data = getCookie();
    if (data.country) data.country = data.country.toUpperCase();
    if (data.firstname) {
      setData(data);
      setRefresh(false);
    }
    if (document.cookie.indexOf("member=") === -1) return;
    setCampaign(current => {
      const r = JSON.parse(JSON.stringify(current)); // deep copy
      r.component.consent = Object.assign({}, current.component.consent, {
        implicit: true,
      });
      return r;
    });
  }, [setCampaign, setData]);
  return null;
};

export default SpeakoutCheck;
