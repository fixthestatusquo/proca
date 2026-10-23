import { useCampaignConfig } from "@hooks/useConfig";
import useData from "@hooks/useData";
import get from "lodash/get";
import { useEffect } from "react";

const Snowflake = () => {
  const config = useCampaignConfig();
  const campaign = config.campaign.name;
  const { url: loaderUrl, key, path } = config.component.loader || {};
  const lang = config.locale;

  const [, setData] = useData();
  useEffect(() => {
    if (!campaign) return;

    const controller = new AbortController();
    const fetchUrl = async url => {
      const d = await fetch(url, { signal: controller.signal });
      if (!d.ok) throw new Error(`${d.status} ${d.statusText} ${url}`);
      return d;
    };

    // single json message, optionally stored under key
    const loadJson = async () => {
      if (loaderUrl === false) return;
      const url =
        loaderUrl || `https://snowflake.proca.app/${campaign}/${lang}`;
      const d = await fetchUrl(url);
      const json = await d.json();
      if (controller.signal.aborted) return;
      if (key) setData(key, get(json, path));
      else setData(json);
    };

    loadJson().catch(e => {
      // we need to guess the field to display the error message, message is the most common one
      if (!controller.signal.aborted) setData("message", e.message);
    });

    return () => controller.abort();
  }, [loaderUrl, key, path, lang, setData, campaign]);

  return null;
};

export default Snowflake;
