import { useEffect } from "react";
import { useCampaignConfig } from "@hooks/useConfig";
import useData from "@hooks/useData";
import { get } from "lodash";

const LoaderAsync = () => {
  const config = useCampaignConfig();
  const loaders = config.component.loader;
  const lang = config.lang;
  const [, setData] = useData();
  useEffect(() => {
    let isCancelled = false;
    if (!loaders) return;
    if (loaders.json) {
      (async function () {
        let url =
          loaders.url || "https://" + config.campaign.name + ".proca.app/";
        if (loaders.url === false) return null;
        if (loaders.appendLocale === true) url += lang;

        let d = null;
        let json = null;
        try {
          d = await fetch(url).catch((e) => {
            setData("message", e.message); // we need to guess the field, message is the most common one
          });
        } catch (e) {
          console.log("no message in", lang);
        }
        if (!d) return;
        try {
          json = await d.json();
        } catch (e) {
          console.log("no message in", lang);
          return;
        }
        if (!isCancelled) {
          if (loaders.key) {
            setData(loaders.key, get(json, loaders.path));
            return;
          }
          setData(json);
          //            Object.entries(json).map(([k,v]) => {
          //              setData({k, v);
          //            });
        }
        return null;
      })();
    } else {
      Object.entries(loaders).map(([k, v]) => {
        (async function () {
          let url = v.url;
          if (!url) return null;
          if (v.appendLocale === true) url += lang;
          const d = await fetch(url).catch((e) => {
            setData(k, e.message);
          });
          const text = await d.text();
          if (!isCancelled) {
            setData(k, text);
          }
        })();
        return null;
      });
    }

    return () => {
      isCancelled = true;
    };
  }, [loaders, lang, setData, config.campaign.name]);

  return null;
};

export default LoaderAsync;
