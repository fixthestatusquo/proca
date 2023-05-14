const dispatchAnalytics = (message, value) => {
  //https://support.google.com/analytics/answer/9267735?sjid=9242639035351824592-EU no standard events
  if (message === "count") return;
  const action = message.split(":");
  let param = {};
  if (action[1] && action[1] === "complete") {
    param.event = action[0];
  } else {
    param.event = action.join("_");
  }

  if (value?.test) {
    param.EventCategory = "proca widget test mode";
  } else {
    param.EventCategory = "proca widget";
  }
  if (value?.privacy) {
    param.EventLabel = value.privacy;
  }
  window.dataLayer && window.dataLayer.push && window.dataLayer.push(param);
};

const dispatch = (event, data, pii, config) => {
  let elem = document.getElementById("proca");
  if (!elem) {
    console.error("#proca missing");
    dispatchAnalytics("error", "missing #proca");
    elem = window;
  }
  if (config?.component?.widget?.analytics || window.dataLayer) {
    dispatchAnalytics(event, data);
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
