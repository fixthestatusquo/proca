import { create } from "zustand";
import { useEffect, useState } from "react";
import { getCount, getCountByName } from "@lib/server.js";
import { useCampaignConfig } from "@hooks/useConfig";
import dispatch from "@lib/event.js";

let effectRan = false;

const useCounterStore = create((set) => ({
  actionCount: null,
  setCount: (count) => set({ actionCount: count }),
}));

const useInitFromUrl = (actionUrl) => {
  const { actionCount, setCount } = useCounterStore();
  const [id, setId] = useState(null);

  useEffect(() => {
    let isCancelled = false;

    (async () => {
      if (actionCount !== null) return;
      const c = await getCountByName(actionUrl);
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
  }, [actionUrl, actionCount, setCount]);

  return [actionCount, id];
};

export { useInitFromUrl };

export default function useCounter(actionPage) {
  const { actionCount, setCount } = useCounterStore();
  const config = useCampaignConfig();
  const apiUrl = config.component.counter?.apiUrl || null;

  if (!actionPage && actionPage !== false && !config.template)
    actionPage = config.actionPage;

  if (config.component.counter === false) actionPage = null; //disable the counter

  useEffect(() => {
    if (effectRan) return; //we only fetch the counter once for all components
    effectRan = true;
    let isCancelled = false;

    (async () => {
      if (actionCount !== null) return;
      if (!actionPage || config.component.counter?.disabled) return; // disabling the fetch

      const c = await getCount(actionPage, { apiUrl });
      if (!isCancelled) setCount(c);
      dispatch("count", c);
    })();

    return () => {
      isCancelled = true;
    };
  }, [actionPage, actionCount, apiUrl, setCount, config.component.counter]);

  return actionCount || null;
}

