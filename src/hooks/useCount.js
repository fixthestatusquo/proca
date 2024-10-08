import { useEffect, useState } from "react";
import { getCount, getCountByName } from "@lib/server.js";
import { useCampaignConfig } from "@hooks/useConfig";

import { atom, useRecoilState } from "recoil";
import dispatch from "@lib/event.js";

let effectRan = false;

const CountState = atom({ key: "actionCount", default: null });
const useInitFromUrl = actionUrl => {
  const [count, setCount] = useRecoilState(CountState);
  const [id, setId] = useState(null);

  useEffect(() => {
    let isCancelled = false;
    let c = null;
    (async () => {
      if (count !== null) return;
      c = await getCountByName(actionUrl);
      console.log("counter", c);
      if (c.errors) {
        alert(`404 fatal error: campaign ${actionUrl} not found`);
        setId(0);
        setCount(404);
        return;
      }
      if (!isCancelled) {
        setId(c.actionPage);
        setCount(c.total);
      }
      dispatch("count", c.total);
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
  const apiUrl = config.component.counter?.apiUrl || null;

  if (!actionPage && actionPage !== false && !config.template)
    actionPage = config.actionPage;

  if (config.component.counter === false) actionPage = null; //disable the counter

  useEffect(() => {
    if (effectRan) return; //we only fetch the counter once for all components
    effectRan = true;
    let isCancelled = false;
    let c = null;
    if (!actionPage || config.component.counter?.disabled) return; // disabling the fetch
    (async () => {
      if (count !== null) return;
      const options = {};
      if (!actionPage || isNaN(actionPage))
        return { errors: [{ message: `invalid actionPage:${actionPage}` }] };
      if (apiUrl) options.apiUrl = apiUrl;
      c = await getCount(actionPage, options);
      if (!isCancelled) setCount(c);
      dispatch("count", c);
    })();

    return () => {
      isCancelled = true;
    };
  }, [actionPage, count, apiUrl, setCount, config.component.counter]);

  return count || null;
}
