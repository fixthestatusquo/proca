import { useEffect } from "react";
import { useCampaignConfig } from "@hooks/useConfig";
import useData from "@hooks/useData";

const LoaderAsync = (props) => {
  const config = useCampaignConfig();
  const loaders = config.component.loader;
  const lang = config.lang;
  const [, setData] = useData();
  useEffect(() => {
    let isCancelled = false;
    if (!loaders) return;
    Object.entries(loaders).map(([k, v]) => {
      (async function () {
        let url = v.url;
        if (!url) return null;
        if (v.appendLocale === true) url += lang;
        console.log(url);
        const d = await fetch(url).catch((e) => {
          console.log(e);
          setData(k, e.message);
        });
        const text = await d.text();
        if (!isCancelled) {
          setData(k, text);
        }
      })();

      return null;
    });

    return () => {
      isCancelled = true;
    };
  }, [loaders, lang, setData]);

  return null;
};

export default LoaderAsync;
