import { useEffect } from "react";
import { useCampaignConfig } from "../hooks/useConfig";
import useData from "../hooks/useData";

const LoaderAsync = (props) => {
  const config = useCampaignConfig();
  const loaders = config.component.loader;
  const [, setData] = useData();
  useEffect(() => {
    let isCancelled = false;
    if (!loaders) return;
    Object.entries(loaders).map(([k, v]) => {
      (async function () {
        const d = await fetch(v.url).catch((e) => {
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
  }, [loaders, setData]);

  return null;
};

export default LoaderAsync;
