import {useEffect} from 'react';
import useGeoLocation from "react-ipgeolocation";

import {
  atom,
  useRecoilState
} from 'recoil';


const State = atom ({key:'country',
  default : {country:null},
});


const useCachedGeoLocation = (params) => {
  const api = params.api || "https://country.proca.foundation";
  const [country, setCountry] = useRecoilState(State);
  const location = useGeoLocation({api:api, country: params.country || country.country});
  useEffect(() => {
    if (!params.country && location.country && !country.country) {
      setCountry({country:location.country});
    }
  },[country,setCountry,location,params.country]);

  return location || country;
};

export default useCachedGeoLocation;
