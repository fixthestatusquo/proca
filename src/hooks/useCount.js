import { useEffect, useState} from "react";

import {getCount,getCountByUrl} from "../lib/server.js";

export default function useCounter (actionPage,actionUrl) {
  const [count, setCount] = useState(null);


  useEffect(() => {
    let isCancelled = false;
    let count = null;
    (async function () {
      if (actionUrl) {
        count = await getCountByUrl(actionUrl);
      } else {
        if (!actionPage || isNaN(actionPage)) return;
        count = await getCount(actionPage);
      }
      if (!isCancelled) 
        setCount(count);
    })();

    return () => {
      isCancelled = true;
    };
  },[actionPage,actionUrl]);

  return count || null;
}
