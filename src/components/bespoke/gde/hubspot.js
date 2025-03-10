import Events from '@lib/observer';
import { getHash } from "@lib/hash";
import { unsubscribeDataLayer } from '@lib/event';
import Url from "@lib/urlparser";

const getProperties = (event, config) => {
  const utm = Url.utm();
//utm.location?
  const properties = {
    test: config.test || undefined,
    office: "Germany",
    page_title: document.title,
    page_language: config.lang, // widget language, let's assume it's the same ;)
    page_platform: "proca", // not sure
    utm_campaign:utm.campaign,
    utm_source: utm.source,
    utm_medium: utm.medium,
  }
  return properties;
}

const send = (event) => {
  if (event.test) { 
    console.log(event);
  }
  window.dataLayer && window.dataLayer.push && window.dataLayer.push(event);
}

const Observer = async (event, data, pii) => {
  const config = window.proca.get();
  console.log('hubspot received event:', event, data, pii);
  if (event.endsWith(":start")) { // the user has started to interact with the form
    const param= getProperties (event, config);
    param.event = "form_started";
    param.form_plugin="proca";
    param.form_id=config.actionpage;
    param.form_goal=config.component.register?.actionType || "register";
    send (param);
    return;
  }
  if (event === "share") {
    const param= getProperties (event, config);
    param.event = "page_shared";
    param.medium = event.medium;
    send (param);
    return;
    
  }
  if (event.endsWith(":complete")) { // the user has submitted {
    let param= getProperties (event, config);
    param.event = "form_submitted";
    param.form_plugin="proca";
    param.form_contains_address_field= true;
    param.form_id=config.actionpage;
    param.form_goal=config.component.register?.actionType || "register";

    if (config.register?.field?.phone) {
      param.form_contains_phone_field= true;
    }
    if (pii?.phone) {
      param.phone_field_provided= true;
    }
    if (pii?.email) {
      const hash = await getHash();
      param.gp_user_id= hash;
      param.distinct_id = hash;
    }
    send (param);
    if (pii?.email) {
      param = getProperties (event, config);
      const hash = await getHash();
      param.event = "user_identified";
      param.gp_user_id= hash;
      param.distinct_id = hash;
      param.registration_type= config.component.register?.actionType || "register";
      param.registration_source= "proca";
console.log("send user_identified", param);
      send (param);
    }
    return;
  }
};


Events.subscribe(Observer);
unsubscribeDataLayer();

export default Observer;
