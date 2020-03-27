import { useEffect, useState} from "react";

import {getCount} from "../lib/server.js";

export default function useCounter (actionPage) {
  const [count, setCount] = useState(null);
  useEffect(() => {
    (async function () {
      const count = await getCount(actionPage);
      setCount(count);
    })();
  },[actionPage]);

  return count || null;
}
