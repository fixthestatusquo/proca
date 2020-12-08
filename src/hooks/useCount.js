import { useEffect, useState } from "react";
import { getCount, getCountByUrl } from "../lib/server.js";
import { useCampaignConfig } from "../hooks/useConfig";

import { atom, useRecoilState } from "recoil";

const CountState = atom({ key: "actionCount", default: null });

const useInitFromUrl = (actionUrl) => {
  const [count, setCount] = useRecoilState(CountState);
  const [id, setId] = useState(null);

  useEffect(() => {
    let isCancelled = false;
    let c = null;
    (async function () {
      if (count !== null) return;
      c = await getCountByUrl(actionUrl);
      if (!isCancelled) {
        setId(c.actionPage);
        setCount(c.total);
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [actionUrl, count, setCount]);

  return [count, id];
};

export { useInitFromUrl };

export default function useCounter(actionPage) {
  const [count, setCount] = useRecoilState(CountState);
  const config = useCampaignConfig();
  const apiUrl = config.component?.useCount?.apiUrl || null;

  if (!actionPage && actionPage !== false && !config.template)
    actionPage = config.actionPage;

  useEffect(() => {
    let isCancelled = false;
    let c = null;
    if (!actionPage || config.template) return; // disabling the fetch
    (async function () {
      if (count !== null) return;
      let options = {};
      if (!actionPage || isNaN(actionPage))
        return { errors: [{ message: "invalid actionPage:" + actionPage }] };
      if (apiUrl) options.apiUrl = apiUrl;
      console.log(actionPage, options);
      c = await getCount(actionPage, options);
      if (!isCancelled) setCount(c);
    })();

    return () => {
      isCancelled = true;
    };
  }, [actionPage, count, apiUrl, setCount, config.template]);

  return count || null;
}
