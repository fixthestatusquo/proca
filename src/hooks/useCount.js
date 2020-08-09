import { useEffect} from "react";
import {getCount,getCountByUrl} from "../lib/server.js";

import {
  atom,useRecoilState
} from 'recoil';


const CountState = atom ({key:'actionCount',
  default : null,
});

export default function useCounter (actionPage,actionUrl) {
  const [count, setCount] = useRecoilState(CountState);

  useEffect(() => {
    let isCancelled = false;
    let c = null;
    (async function () {
      if (count !== null) return;
      if (actionUrl) {
        c = await getCountByUrl(actionUrl);
      } else {
        if (!actionPage || isNaN(actionPage)) return {errors:[{messsage:"invalid actionPage:"+actionPage}]};
        c = await getCount(actionPage);
      }
      if (!isCancelled) 
        setCount(c);
    })();

    return () => {
      isCancelled = true;
    };
  },[actionPage,actionUrl,count,setCount]);

  return count || null;
}
