import Events from '@lib/observer';
import { getHash } from "@lib/hash";
import { unsubscribeDataLayer } from '@lib/event';
import Url from "@lib/urlparser";

const getProperties = (_event, config) => { //event not used, so far
  const utm = Url.utm();
//utm.location?
  const properties = {
    test: config.test || undefined,
    nro: "Germany",
    office: "Germany",
    page_title: document.title,
    page_language: document.documentElement.getAttribute("lang") || config.lang,
    page_path:  window.location.pathname,
    page_domain:  window.location.hostname,
    page_type: "content", 
    page_platform: "drupal", 
    utm_campaign:utm.campaign,
    utm_source: utm.source,
    utm_medium: utm.medium,
    utm_content: utm.content || "",
    utm_term: utm.term || "",
  }
  return properties;
}

const send = (event) => {
  if (event.test) { 
    console.log("hubspot",event);
  }
  window.dataLayer && window.dataLayer.push && window.dataLayer.push(event);
}

const getGoal = (actionType) => {
  const complete = {
    "signature": "Petition Signup", 
    "mail2target": "Protestmail Signup", 
    "register": "Petition Signup",
  };
  if (!actionType) return complete.register;
  return complete[actionType] || actionType; //if/when we have new action Types, let's push them without translation to the analytics
}

const Observer = async (event, data, pii) => {
  const config = window.proca.get();
  if (event.endsWith(":start")) { // the user has started to interact with the form
    const param= getProperties (event, config);
    param.event = "form_started";
    param.form_plugin="proca";
    param.form_id=config.actionpage;
    param.form_goal= getGoal(config.component.register?.actionType);
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
    param.form_goal= getGoal(config.component.register?.actionType);

    if (config.component?.register?.field?.phone) {
      param.form_contains_phone_field= true;
      if (pii?.phone) 
        param.phone_field_provided= true;
    } else {
      param.form_contains_phone_field= false;
    }
    if (pii?.email) {
      const hash = await getHash();
      param.gp_user_id= hash;
    }
    send (param);
    if (pii?.email) { // sending duplicate user_identified, TODO: remove once form_submitted is ok
      param.event = "user_identified";
      console.warn("send user_identified", param);
      send (param);
    }
    return;
  }
};


Events.subscribe(Observer);
unsubscribeDataLayer();

export default Observer;
