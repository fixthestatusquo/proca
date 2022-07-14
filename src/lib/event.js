const dispatchAnalytics = (message, value) => {
  let param = {
    event: "GenericEvent", //proca
    EventCategory: "proca widget",
    EventAction: message.replace(":", "_"),
  };
  const action = message.split(":");
  if (value?.test) {
    param.EventCategory = "proca widget test mode";
  }
  if (value?.privacy) {
    param.EventLabel = value.privacy;
  }
  if (action[1] && action[1] === "complete") {
    param.EventAction = action[0];
  }
  console.log("proca_event", message, value, param);
  window.dataLayer && window.dataLayer.push(param);
};

const dispatch = (event, data, pii, config) => {
  let elem = document.getElementById("proca");
  if (!elem) {
    console.error("#proca missing");
    dispatchAnalytics("error", "missing #proca");
    elem = window;
  }
  if (config?.component?.widget?.analytics) {
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
