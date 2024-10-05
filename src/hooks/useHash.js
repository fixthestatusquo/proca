import { useEffect } from 'react';

let hasRun = false;

const useHash = ({prefix,onChange}) => {
  if (!prefix) {
    prefix = "proca_";
  }

  useEffect (() => { 
   if (hasRun) return;
   hasRun = true;

   window.addEventListener('hashchange', function() {
     const urlHash = window.location.hash.substring(1); 
     if (urlHash.startsWith(prefix)) {
       const step = urlHash.replace(prefix, "");
       onChange(step);
     }
  });
},[]);
}

export default useHash;
