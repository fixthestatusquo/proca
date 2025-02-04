import { getHash } from "./hash";
const dispatchAnalytics = (message, value, extra) => {
  //https://support.google.com/analytics/answer/9267735?sjid=9242639035351824592-EU no standard events
  if (message === "count") return;
  const action = message.split(":");
  const param = Object.assign({},value,extra);
  'uuid,firstname,lastname,country,comment,subject,message,email,emailProvider,contact'.split(',').forEach(attr => {
        if (param.hasOwnProperty(attr)) {
            delete param[attr];
        }
    });
  if (action[1] && action[1] === "complete") {
    param.event = action[0];
  } else {
    param.event = action.join("_");
  }
  param.source = "proca"; 
  if (value?.test) {
    param.test = true;
    console.log("GA4", param);
  }
  window.dataLayer && window.dataLayer.push && window.dataLayer.push(param);
};

const dispatch = (event, data, pii) => {
  let elem = document.getElementById("proca");
  if (!elem) {
    console.error("#proca missing");
    dispatchAnalytics("error", "missing #proca");
    elem = window;
  }
  if (window.dataLayer) {
    dispatchAnalytics(event, data);
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
  }
  if (pii) data.contact = pii; //TODO, add a config to remove the option to bubble up pii to the containing page
  const e = new CustomEvent(event, {
    detail: data,
    bubbles: true,
    cancelable: true,
  });
  elem.dispatchEvent(e);
  elem.dispatchEvent(
    new CustomEvent("proca", {
      bubbles: true,
      detail: { message: event.replace("proca:", ""), value: data },
    })
  ); //
};

export default dispatch;

export { dispatch };
