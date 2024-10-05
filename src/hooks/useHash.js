import { useEffect } from 'react';

let hasRun = false;

const useHash = ({name,onChange}) => {
  if (!name) {
    name = "proca_go";
  }
  name += "=";

  useEffect (() => { 
   if (hasRun) return;
   hasRun = true;

   window.addEventListener('hashchange', function() {
     const urlHash = window.location.hash.substring(1); 
     console.log('Hash changed:', urlHash,name);
     if (urlHash.startsWith(name)) {
       const step = urlHash.replace(name, "");
       onChange(step);
     }
  });
},[]);
}

export default useHash;
