import { useEffect, useState} from "react";

import {getCount} from "../lib/server.js";

export default function useCounter (actionPage) {
  const [count, setCount] = useState(null);

  useEffect(() => {
    let isCancelled = false;
    (async function () {
      const count = await getCount(actionPage);
      if (!isCancelled) 
        setCount(count);
    })();

    return () => {
      isCancelled = true;
    };
  },[actionPage]);

  return count || null;
}
