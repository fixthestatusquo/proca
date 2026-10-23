import { useCampaignConfig } from "@hooks/useConfig";
import useData from "@hooks/useData";
import get from "lodash/get";
import { useEffect } from "react";

const Snowflake = () => {
  const config = useCampaignConfig();
  const campaign = config.campaign.name;
  const loaders = config.component.loader || {};
  const lang = config.locale;

  const [, setData] = useData();
  useEffect(() => {
    if (loaders === false || !campaign) return;

    const controller = new AbortController();
    const fetchUrl = async url => {
      const d = await fetch(url, { signal: controller.signal });
      if (!d.ok) throw new Error(`${d.status} ${d.statusText} ${url}`);
      return d;
    };

    // single json message, optionally stored under loaders.key
    const loadJson = async () => {
      if (loaders.url === false) return;
      const url =
        loaders.url || `https://snowflake.proca.app/${campaign}/${lang}`;
      const d = await fetchUrl(url);
      const json = await d.json();
      if (controller.signal.aborted) return;
      if (loaders.key) setData(loaders.key, get(json, loaders.path));
      else setData(json);
    };

    loadJson().catch(e => {
      // we need to guess the field to display the error message, message is the most common one
      if (!controller.signal.aborted) setData("message", e.message);
    });

    return () => controller.abort();
  }, [loaders, lang, setData, campaign]);

  return null;
};

export default Snowflake;
