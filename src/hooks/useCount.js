import { useEffect} from "react";
import {getCount,getCountByUrl} from "../lib/server.js";
import { useCampaignConfig } from "../hooks/useConfig";

import {
  atom,useRecoilState
} from 'recoil';


const CountState = atom ({key:'actionCount',
  default : null,
});

export default function useCounter (actionPage,actionUrl) {
  const [count, setCount] = useRecoilState(CountState);
  const config = useCampaignConfig();
  useEffect(() => {
    let isCancelled = false;
    let c = null;
    (async function () {
      if (count !== null) return;
      if (actionUrl) {
        c = await getCountByUrl(actionUrl);
      } else {
        let options = {};
        if (!actionPage || isNaN(actionPage)) return {errors:[{message:"invalid actionPage:"+actionPage}]};
        if (config.component?.useCount?.apiUrl)
          options.apiUrl = config.component.useCount.apiUrl;
        c = await getCount(actionPage,options);
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
