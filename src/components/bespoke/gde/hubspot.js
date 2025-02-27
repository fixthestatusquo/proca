import Events from '@lib/observer';
import { getHash } from "@lib/hash";


const Observer = (event, data, pii) => {
  console.log('hubspot received event:', event, data, pii);
    if (pii?.email) {
      getHash().then(hash =>
        dispatchAnalytics("user_identified", data, {
          gp_user_id: hash,
          distinct_id: hash,
          registration_type: event,
          registration_source: "proca",
        })
      );
    }
};


Events.subscribe(Observer);

export default Observer;
